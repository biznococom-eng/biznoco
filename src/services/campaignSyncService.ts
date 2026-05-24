"use client";

import { getSupabase } from "@/lib/supabase/client";
import {
  listCampaigns,
  syncCampaignAll,
  getActionValue,
  type MetaCampaign,
  type MetaInsightsRow,
} from "@/services/metaApi";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = (sb: ReturnType<typeof getSupabase>) => sb as any;

export interface SyncProgress {
  step: string;
  current: number;
  total: number;
}

export interface SyncResult {
  campaigns_upserted: number;
  daily_stats_upserted: number;
  demographics_upserted: number;
  errors: string[];
}

/**
 * Sync 1 ad account từ Meta Marketing API → Supabase.
 * Steps:
 * 1. List campaigns từ Meta → upsert vào public.campaigns
 * 2. Cho mỗi campaign: fetch insights (daily + 5 breakdowns) → upsert
 *
 * Returns counts + errors.
 */
export async function syncAccountFromMeta(
  accountId: string,
  fbAdAccountId: string,
  metaToken: string,
  options: {
    since?: string; // YYYY-MM-DD, default 30 days ago
    until?: string; // default today
    onProgress?: (p: SyncProgress) => void;
  } = {},
): Promise<SyncResult> {
  const sb = getSupabase();
  const u = untyped(sb);
  const result: SyncResult = {
    campaigns_upserted: 0,
    daily_stats_upserted: 0,
    demographics_upserted: 0,
    errors: [],
  };

  const today = new Date();
  const since =
    options.since ??
    new Date(today.getTime() - 30 * 86_400_000).toISOString().slice(0, 10);
  const until = options.until ?? today.toISOString().slice(0, 10);

  // ── 1. List campaigns ───────────────────────────────────────────────────
  options.onProgress?.({ step: "Đang lấy danh sách chiến dịch…", current: 0, total: 1 });
  let metaCampaigns: MetaCampaign[];
  try {
    metaCampaigns = await listCampaigns(fbAdAccountId, metaToken, [
      "ACTIVE",
      "PAUSED",
    ]);
  } catch (e) {
    result.errors.push(`listCampaigns: ${(e as Error).message}`);
    return result;
  }

  if (metaCampaigns.length === 0) {
    return result;
  }

  // ── 2. Upsert campaigns vào DB ──────────────────────────────────────────
  const campaignRows = metaCampaigns.map((c) => ({
    account_id: accountId,
    fb_campaign_id: c.id,
    name: c.name,
    objective: c.objective ?? null,
    status: c.status ?? "ACTIVE",
    effective_status: c.effective_status ?? c.status ?? "ACTIVE",
    daily_budget: c.daily_budget ? Number(c.daily_budget) / 100 : null, // Meta returns cents
    lifetime_budget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : null,
    budget_remaining: c.budget_remaining ? Number(c.budget_remaining) / 100 : null,
    start_time: c.start_time ?? null,
    stop_time: c.stop_time ?? null,
    created_time: c.created_time ?? null,
    updated_time: c.updated_time ?? null,
    buying_type: c.buying_type ?? null,
    last_synced_at: new Date().toISOString(),
  }));

  const { data: upserted, error: campErr } = await u
    .from("campaigns")
    .upsert(campaignRows, { onConflict: "account_id,fb_campaign_id" })
    .select("id, fb_campaign_id");

  if (campErr) {
    result.errors.push(`upsert campaigns: ${campErr.message}`);
    return result;
  }
  result.campaigns_upserted = upserted?.length ?? 0;

  // Map fb_campaign_id → uuid for stat inserts
  const fbToUuid = new Map<string, string>();
  for (const row of upserted ?? []) {
    fbToUuid.set(row.fb_campaign_id, row.id);
  }

  // ── 3. Fetch insights + upsert (loop qua từng campaign) ─────────────────
  for (let i = 0; i < metaCampaigns.length; i++) {
    const meta = metaCampaigns[i];
    const dbId = fbToUuid.get(meta.id);
    if (!dbId) continue;

    options.onProgress?.({
      step: `Đang sync insights: ${meta.name}`,
      current: i + 1,
      total: metaCampaigns.length,
    });

    let bundle;
    try {
      bundle = await syncCampaignAll(meta.id, metaToken, since, until);
    } catch (e) {
      result.errors.push(`sync ${meta.name}: ${(e as Error).message}`);
      continue;
    }

    // 3a. Daily stats
    const dailyRows = bundle.daily.map((r) => insightToDailyRow(r, dbId, accountId));
    if (dailyRows.length > 0) {
      const { error } = await u
        .from("campaign_daily_stats")
        .upsert(dailyRows, { onConflict: "campaign_id,date" });
      if (error) result.errors.push(`daily ${meta.name}: ${error.message}`);
      else result.daily_stats_upserted += dailyRows.length;
    }

    // 3b. Demographics — 5 breakdown types
    const demoBatches: Array<{ type: string; rows: MetaInsightsRow[]; valKey?: "age" | "gender" | "region" | "device_platform" | "publisher_platform"; }> = [
      { type: "gender", rows: bundle.byGender, valKey: "gender" },
      { type: "age", rows: bundle.byAge, valKey: "age" },
      { type: "age_gender", rows: bundle.byAgeGender },
      { type: "region", rows: bundle.byRegion, valKey: "region" },
      { type: "device_platform", rows: bundle.byDevicePlatform, valKey: "device_platform" },
      { type: "publisher_platform", rows: bundle.byPublisherPlatform, valKey: "publisher_platform" },
    ];

    for (const batch of demoBatches) {
      const demoRows = batch.rows.map((r) =>
        insightToDemographicsRow(r, dbId, accountId, batch.type, batch.valKey),
      );
      if (demoRows.length > 0) {
        const { error } = await u
          .from("campaign_demographics")
          .upsert(demoRows, {
            onConflict: "campaign_id,date,breakdown_type,breakdown_value",
          });
        if (error) result.errors.push(`${batch.type}: ${error.message}`);
        else result.demographics_upserted += demoRows.length;
      }
    }
  }

  // ── 4. Update account.meta_last_synced_at ───────────────────────────────
  await u
    .from("accounts")
    .update({ meta_last_synced_at: new Date().toISOString() })
    .eq("id", accountId);

  options.onProgress?.({ step: "Hoàn tất", current: 1, total: 1 });
  return result;
}

function insightToDailyRow(r: MetaInsightsRow, campaignId: string, accountId: string) {
  return {
    campaign_id: campaignId,
    account_id: accountId,
    date: r.date_start ?? "",
    spend: Number(r.spend ?? 0),
    impressions: Number(r.impressions ?? 0),
    reach: Number(r.reach ?? 0),
    frequency: Number(r.frequency ?? 0),
    clicks: Number(r.clicks ?? 0),
    inline_link_clicks: Number(r.inline_link_clicks ?? 0),
    unique_link_clicks: Number(r.unique_link_clicks ?? 0),
    messaging_conversations_started: getActionValue(
      r,
      "onsite_conversion.messaging_conversation_started_7d",
    ),
    messaging_first_reply: getActionValue(r, "onsite_conversion.messaging_first_reply"),
    messaging_welcome_views: getActionValue(
      r,
      "onsite_conversion.messaging_user_subscribed",
    ),
    messaging_connects: getActionValue(r, "onsite_conversion.messaging_block"),
    purchases: getActionValue(r, "purchase"),
    purchase_value: getActionValue(r, "purchase", "action_values"),
    leads: getActionValue(r, "lead"),
    registrations: getActionValue(r, "complete_registration"),
  };
}

function insightToDemographicsRow(
  r: MetaInsightsRow,
  campaignId: string,
  accountId: string,
  breakdownType: string,
  valKey?: "age" | "gender" | "region" | "device_platform" | "publisher_platform",
) {
  // Build breakdown_value
  let value: string;
  if (breakdownType === "age_gender") {
    value = `${r.gender ?? "?"}_${r.age ?? "?"}`;
  } else if (valKey && r[valKey]) {
    value = String(r[valKey]);
  } else {
    value = "unknown";
  }

  return {
    campaign_id: campaignId,
    account_id: accountId,
    date: r.date_start ?? "",
    breakdown_type: breakdownType,
    breakdown_value: value,
    gender: r.gender ?? null,
    age_range: r.age ?? null,
    spend: Number(r.spend ?? 0),
    impressions: Number(r.impressions ?? 0),
    reach: Number(r.reach ?? 0),
    clicks: Number(r.clicks ?? 0),
    inline_link_clicks: Number(r.inline_link_clicks ?? 0),
  };
}

/**
 * Update access_token cho 1 account.
 */
export async function saveMetaToken(
  accountId: string,
  token: string,
  metadata: { user_id?: string; scopes?: string[]; business_id?: string } = {},
): Promise<void> {
  const sb = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb as any)
    .from("accounts")
    .update({
      access_token: token,
      meta_token_user_id: metadata.user_id ?? null,
      meta_token_scopes: metadata.scopes ?? null,
      meta_business_id: metadata.business_id ?? null,
    })
    .eq("id", accountId);
  if (error) throw new Error(`saveMetaToken: ${error.message}`);
}
