"use client";

import { getSupabase } from "@/lib/supabase/client";
import type { CreativeSummaryRow, CreativeStatsRow } from "@/lib/supabase/types";
import type {
  CreativeAggregated,
  OverviewMetrics,
} from "@/lib/creative-aggregator";

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);
const div = (a: number, b: number) => (b > 0 ? a / b : 0);

export const EMPTY_OVERVIEW: OverviewMetrics = {
  total_spend: 0,
  total_impressions: 0,
  total_link_clicks: 0,
  total_purchases: 0,
  total_purchase_value: 0,
  avg_hook_rate: 0,
  avg_hold_rate: 0,
  avg_ctr_link: 0,
  blended_roas: 0,
};

/* ──────────────────────────────────────────────────────────────────────────
 * 1. fetchCreativeAggregates
 *    DB nén dữ liệu sẵn qua RPC `get_creative_summary` — chỉ trả về 1 row
 *    cho mỗi `ad_id` trong khoảng ngày. Filter `search` chạy client-side
 *    vì dataset post-aggregation rất nhỏ (≤200 ads/account/tháng điển hình).
 * ────────────────────────────────────────────────────────────────────────── */
export interface FetchCreativesParams {
  accountId: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  search?: string;
}

export async function fetchCreativeAggregates(
  params: FetchCreativesParams,
  signal?: AbortSignal,
): Promise<CreativeAggregated[]> {
  const sb = getSupabase();
  const { accountId, from, to, search } = params;

  const builder = sb.rpc("get_creative_summary", {
    p_account_id: accountId,
    p_start_date: from,
    p_end_date: to,
  });

  if (signal) builder.abortSignal(signal);

  const { data, error } = (await builder) as {
    data: CreativeSummaryRow[] | null;
    error: { message: string } | null;
  };
  if (error) throw new Error(`get_creative_summary: ${error.message}`);

  const rows = (data ?? []) as CreativeSummaryRow[];
  let list = rows.map(mapSummaryToAggregate);

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (a) =>
        a.ad_name.toLowerCase().includes(q) ||
        (a.campaign_name ?? "").toLowerCase().includes(q),
    );
  }
  return list;
}

function mapSummaryToAggregate(r: CreativeSummaryRow): CreativeAggregated {
  const v3 = num(r.total_3s_views);
  const impressions = num(r.total_impressions);
  const link_clicks = num(r.total_link_clicks);
  const spend = num(r.total_spend);
  const purchase_value = num(r.total_purchase_value);
  const p25 = num(r.total_p25_views);
  const p100 = num(r.total_p100_views);

  return {
    ad_id: r.ad_id,
    ad_name: r.ad_name ?? "(không tên)",
    campaign_name: r.campaign_name,
    adset_name: null, // RPC current shape không trả adset — bổ sung sau nếu cần
    creative_type: (r.creative_type ?? "unknown") as CreativeAggregated["creative_type"],
    thumbnail_url: r.thumbnail_url,
    video_url: r.video_url,

    spend,
    impressions,
    reach: 0,
    clicks: num(r.total_clicks),
    link_clicks,
    v3,
    p25,
    p50: num(r.total_p50_views),
    p75: num(r.total_p75_views),
    p100,
    avg_watch: 0,
    purchases: num(r.total_purchases),
    purchase_value,

    // KPIs: ưu tiên giá trị do RPC tính sẵn, fallback nếu null
    hook_rate: r.hook_rate != null ? num(r.hook_rate) : pct(v3, impressions),
    hold_rate: r.hold_rate != null ? num(r.hold_rate) : pct(p25, v3),
    completion_rate:
      r.completion_rate != null ? num(r.completion_rate) : pct(p100, v3),
    ctr_link: r.ctr_link != null ? num(r.ctr_link) : pct(link_clicks, impressions),
    cpc_link: r.cpc_link != null ? num(r.cpc_link) : div(spend, link_clicks),
    cpm: r.cpm != null ? num(r.cpm) : impressions > 0 ? (spend / impressions) * 1000 : 0,
    roas: r.roas != null ? num(r.roas) : div(purchase_value, spend),
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * 2. fetchOverview
 *    Query trực tiếp creative_stats với date range ở DB, chỉ select cột cần
 *    để giảm payload. Sum client-side (dataset nhỏ).
 *    Nếu scale lớn (>10K rows), khuyến nghị tạo thêm RPC get_account_overview.
 * ────────────────────────────────────────────────────────────────────────── */
export interface FetchOverviewParams {
  accountId: string;
  from: string;
  to: string;
}

export async function fetchOverview(
  params: FetchOverviewParams,
  signal?: AbortSignal,
): Promise<OverviewMetrics> {
  const sb = getSupabase();
  const { accountId, from, to } = params;

  const query = sb
    .from("creative_stats")
    .select(
      "spend, impressions, inline_link_clicks, video_3s_view, video_p25_view, purchases, purchase_value",
    )
    .eq("account_id", accountId)
    .gte("date", from)
    .lte("date", to);

  if (signal) query.abortSignal(signal);

  const { data, error } = (await query) as {
    data: Pick<
      CreativeStatsRow,
      | "spend"
      | "impressions"
      | "inline_link_clicks"
      | "video_3s_view"
      | "video_p25_view"
      | "purchases"
      | "purchase_value"
    >[] | null;
    error: { message: string } | null;
  };
  if (error) throw new Error(`creative_stats overview: ${error.message}`);
  if (!data || data.length === 0) return { ...EMPTY_OVERVIEW };

  let spend = 0,
    impressions = 0,
    clicks = 0,
    v3 = 0,
    p25 = 0,
    purchases = 0,
    purchase_value = 0;

  for (const r of data) {
    spend += num(r.spend);
    impressions += num(r.impressions);
    clicks += num(r.inline_link_clicks);
    v3 += num(r.video_3s_view);
    p25 += num(r.video_p25_view);
    purchases += num(r.purchases);
    purchase_value += num(r.purchase_value);
  }

  return {
    total_spend: spend,
    total_impressions: impressions,
    total_link_clicks: clicks,
    total_purchases: purchases,
    total_purchase_value: purchase_value,
    avg_hook_rate: pct(v3, impressions),
    avg_hold_rate: pct(p25, v3),
    avg_ctr_link: pct(clicks, impressions),
    blended_roas: div(purchase_value, spend),
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * 3. fetchCreativeDaily — cho trang detail /creatives/[ad_id]
 *    Đọc từ VIEW `creative_metrics` (KPI tính sẵn), order theo ngày.
 * ────────────────────────────────────────────────────────────────────────── */
export interface FetchDailyParams {
  accountId: string;
  adId: string;
  from: string;
  to: string;
}

export async function fetchCreativeDaily(
  params: FetchDailyParams,
  signal?: AbortSignal,
) {
  const sb = getSupabase();
  const { accountId, adId, from, to } = params;

  const query = sb
    .from("creative_metrics")
    .select("*")
    .eq("account_id", accountId)
    .eq("ad_id", adId)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });

  if (signal) query.abortSignal(signal);

  const { data, error } = (await query) as {
    data: import("@/lib/supabase/types").CreativeMetricsRow[] | null;
    error: { message: string } | null;
  };
  if (error) throw new Error(`creative_metrics daily: ${error.message}`);
  return data ?? [];
}
