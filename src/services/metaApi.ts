/**
 * Meta Marketing API client (Graph API v18.0)
 *
 * User flow:
 * 1. User tự generate long-lived access token tại https://developers.facebook.com/tools/explorer/
 *    với scopes: ads_read, ads_management (read-only OK), business_management, read_insights
 * 2. Paste token + Ad Account ID vào /accounts trong app
 * 3. App test token → validate → save
 * 4. Sync chạy daily (cron) hoặc trigger thủ công
 *
 * Token never sent đến server biznoco — fetch trực tiếp browser → graph.facebook.com.
 * CORS enabled cho graph.facebook.com.
 */

const META_VERSION = "v18.0";
const META_BASE = `https://graph.facebook.com/${META_VERSION}`;

export interface MetaError {
  message: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  objective?: string;
  status?: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  start_time?: string;
  stop_time?: string;
  created_time?: string;
  updated_time?: string;
  buying_type?: string;
  special_ad_categories?: string[];
}

export interface MetaInsightsRow {
  spend?: string;
  impressions?: string;
  reach?: string;
  frequency?: string;
  clicks?: string;
  inline_link_clicks?: string;
  unique_link_clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  date_start?: string;
  date_stop?: string;
  campaign_id?: string;
  campaign_name?: string;
  // Breakdowns
  age?: string;
  gender?: string;
  region?: string;
  country?: string;
  device_platform?: string;
  publisher_platform?: string;
  platform_position?: string;
  impression_device?: string;
  // Actions (messaging conversations, purchases…)
  actions?: { action_type: string; value: string }[];
  action_values?: { action_type: string; value: string }[];
  cost_per_action_type?: { action_type: string; value: string }[];
}

async function metaFetch<T = unknown>(
  path: string,
  params: Record<string, string | number | undefined>,
  token: string,
): Promise<T> {
  const search = new URLSearchParams({ access_token: token });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const url = `${META_BASE}/${path}?${search.toString()}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) {
    const err: MetaError = json.error ?? { message: "Unknown Meta API error" };
    throw new Error(`Meta API ${err.code ?? res.status}: ${err.message}`);
  }
  return json as T;
}

/**
 * Validate token: fetch /me to check token validity + identify user.
 */
export async function validateToken(token: string): Promise<{
  user_id: string;
  name: string;
  scopes?: string[];
}> {
  const me = await metaFetch<{ id: string; name: string }>(
    "me",
    { fields: "id,name" },
    token,
  );
  // Also check debug_token for scopes
  let scopes: string[] = [];
  try {
    const debug = await metaFetch<{
      data: { scopes?: string[]; expires_at?: number; is_valid?: boolean };
    }>("debug_token", { input_token: token }, token);
    scopes = debug.data?.scopes ?? [];
  } catch {
    /* ignore */
  }
  return { user_id: me.id, name: me.name, scopes };
}

/**
 * List ad accounts user có quyền access (chỉ active).
 */
export async function listAdAccounts(token: string): Promise<
  Array<{ id: string; account_id: string; name: string; currency: string; timezone_name: string; business?: { id: string; name: string } }>
> {
  const res = await metaFetch<{
    data: Array<{ id: string; account_id: string; name: string; currency: string; timezone_name: string; business?: { id: string; name: string } }>;
  }>(
    "me/adaccounts",
    {
      fields: "id,account_id,name,currency,timezone_name,business{id,name}",
      limit: 100,
    },
    token,
  );
  return res.data;
}

/**
 * List campaigns trong 1 ad account.
 */
export async function listCampaigns(
  adAccountId: string,
  token: string,
  effectiveStatus: string[] = ["ACTIVE", "PAUSED"],
): Promise<MetaCampaign[]> {
  const id = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
  const res = await metaFetch<{ data: MetaCampaign[] }>(
    `${id}/campaigns`,
    {
      fields:
        "id,name,objective,status,effective_status,daily_budget,lifetime_budget,budget_remaining,start_time,stop_time,created_time,updated_time,buying_type,special_ad_categories",
      effective_status: JSON.stringify(effectiveStatus),
      limit: 100,
    },
    token,
  );
  return res.data;
}

/**
 * Fetch insights cho 1 campaign trong khoảng ngày.
 * @param breakdowns vd: ['age','gender'], ['region'], ['device_platform']
 */
export async function fetchCampaignInsights(
  campaignId: string,
  token: string,
  options: {
    since: string; // YYYY-MM-DD
    until: string;
    breakdowns?: string[];
    level?: "campaign" | "adset" | "ad";
    time_increment?: number | "all_days"; // 1 = daily, "all_days" = single aggregated row
  },
): Promise<MetaInsightsRow[]> {
  const res = await metaFetch<{ data: MetaInsightsRow[] }>(
    `${campaignId}/insights`,
    {
      fields:
        "spend,impressions,reach,frequency,clicks,inline_link_clicks,unique_link_clicks,ctr,cpc,cpm,actions,action_values,cost_per_action_type,date_start,date_stop,campaign_id,campaign_name",
      time_range: JSON.stringify({ since: options.since, until: options.until }),
      breakdowns: options.breakdowns?.length ? options.breakdowns.join(",") : undefined,
      level: options.level ?? "campaign",
      time_increment: options.time_increment ?? 1,
      limit: 500,
    },
    token,
  );
  return res.data;
}

/**
 * Extract specific action_type value (eg messaging_conversation_started_7d) from row.
 */
export function getActionValue(
  row: MetaInsightsRow,
  actionType: string,
  field: "actions" | "action_values" | "cost_per_action_type" = "actions",
): number {
  const arr = row[field];
  if (!Array.isArray(arr)) return 0;
  const found = arr.find((a) => a.action_type === actionType);
  if (!found) return 0;
  const n = Number(found.value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Sync helper: fetch all required data for 1 campaign in 1 batch.
 * Returns parsed daily stats + 5 breakdowns ready to upsert vào Supabase.
 */
export interface SyncedCampaignData {
  daily: MetaInsightsRow[];
  byGender: MetaInsightsRow[];
  byAge: MetaInsightsRow[];
  byAgeGender: MetaInsightsRow[];
  byRegion: MetaInsightsRow[];
  byDevicePlatform: MetaInsightsRow[];
  byPublisherPlatform: MetaInsightsRow[];
}

export async function syncCampaignAll(
  campaignId: string,
  token: string,
  since: string,
  until: string,
): Promise<SyncedCampaignData> {
  const [daily, byGender, byAge, byAgeGender, byRegion, byDevice, byPublisher] =
    await Promise.all([
      fetchCampaignInsights(campaignId, token, { since, until, time_increment: 1 }),
      fetchCampaignInsights(campaignId, token, { since, until, breakdowns: ["gender"], time_increment: 1 }),
      fetchCampaignInsights(campaignId, token, { since, until, breakdowns: ["age"], time_increment: 1 }),
      fetchCampaignInsights(campaignId, token, { since, until, breakdowns: ["age", "gender"], time_increment: 1 }),
      fetchCampaignInsights(campaignId, token, { since, until, breakdowns: ["region"], time_increment: 1 }),
      fetchCampaignInsights(campaignId, token, { since, until, breakdowns: ["device_platform"], time_increment: 1 }),
      fetchCampaignInsights(campaignId, token, { since, until, breakdowns: ["publisher_platform"], time_increment: 1 }),
    ]);
  return { daily, byGender, byAge, byAgeGender, byRegion, byDevicePlatform: byDevice, byPublisherPlatform: byPublisher };
}
