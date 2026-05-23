import type { CreativeStat, CreativeType } from "@/mock/creative-stats";

export interface CreativeAggregated {
  ad_id: string;
  ad_name: string;
  campaign_name: string | null;
  adset_name: string | null;
  creative_type: CreativeType;
  thumbnail_url: string | null;
  video_url: string | null;

  // raw totals
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  link_clicks: number;
  v3: number;
  p25: number;
  p50: number;
  p75: number;
  p100: number;
  avg_watch: number;
  purchases: number;
  purchase_value: number;

  // computed KPIs
  hook_rate: number; // %
  hold_rate: number; // %
  completion_rate: number; // %
  ctr_link: number; // %
  cpc_link: number; // VND
  cpm: number; // VND
  roas: number; // multiplier
}

/** Safe percentage of a/b with 0 fallback. */
const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);
const div = (a: number, b: number) => (b > 0 ? a / b : 0);

/**
 * Aggregate raw daily stats into per-ad totals.
 * IMPORTANT: ratios are computed AFTER summing — never average per-day ratios.
 */
export function aggregateByAd(rows: CreativeStat[]): CreativeAggregated[] {
  const map = new Map<string, CreativeAggregated>();

  for (const r of rows) {
    let a = map.get(r.ad_id);
    if (!a) {
      a = {
        ad_id: r.ad_id,
        ad_name: r.ad_name,
        campaign_name: r.campaign_name,
        adset_name: r.adset_name,
        creative_type: r.creative_type,
        thumbnail_url: r.thumbnail_url,
        video_url: r.video_url,
        spend: 0,
        impressions: 0,
        reach: 0,
        clicks: 0,
        link_clicks: 0,
        v3: 0,
        p25: 0,
        p50: 0,
        p75: 0,
        p100: 0,
        avg_watch: 0,
        purchases: 0,
        purchase_value: 0,
        hook_rate: 0,
        hold_rate: 0,
        completion_rate: 0,
        ctr_link: 0,
        cpc_link: 0,
        cpm: 0,
        roas: 0,
      };
      map.set(r.ad_id, a);
    }
    a.spend += r.spend;
    a.impressions += r.impressions;
    a.reach = Math.max(a.reach, r.reach);
    a.clicks += r.clicks;
    a.link_clicks += r.inline_link_clicks;
    a.v3 += r.video_3s_view;
    a.p25 += r.video_p25_view;
    a.p50 += r.video_p50_view;
    a.p75 += r.video_p75_view;
    a.p100 += r.video_p100_view;
    a.avg_watch = Math.max(a.avg_watch, r.video_avg_time_watched);
    a.purchases += r.purchases;
    a.purchase_value += r.purchase_value;
  }

  for (const a of map.values()) {
    a.hook_rate = pct(a.v3, a.impressions);
    a.hold_rate = pct(a.p25, a.v3);
    a.completion_rate = pct(a.p100, a.v3);
    a.ctr_link = pct(a.link_clicks, a.impressions);
    a.cpc_link = div(a.spend, a.link_clicks);
    a.cpm = a.impressions > 0 ? (a.spend / a.impressions) * 1000 : 0;
    a.roas = div(a.purchase_value, a.spend);
  }

  return Array.from(map.values());
}

export interface OverviewMetrics {
  total_spend: number;
  total_impressions: number;
  total_link_clicks: number;
  total_purchases: number;
  total_purchase_value: number;
  avg_hook_rate: number;
  avg_hold_rate: number;
  avg_ctr_link: number;
  blended_roas: number;
}

/** Account-level metrics — ratios from totals (correct math). */
export function computeOverview(rows: CreativeStat[]): OverviewMetrics {
  let spend = 0,
    impressions = 0,
    clicks = 0,
    v3 = 0,
    p25 = 0,
    purchases = 0,
    purchase_value = 0;
  for (const r of rows) {
    spend += r.spend;
    impressions += r.impressions;
    clicks += r.inline_link_clicks;
    v3 += r.video_3s_view;
    p25 += r.video_p25_view;
    purchases += r.purchases;
    purchase_value += r.purchase_value;
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

export type SortKey = "spend" | "hook_rate" | "hold_rate" | "roas" | "ctr_link" | "impressions";

export function sortAggregated(
  list: CreativeAggregated[],
  key: SortKey,
): CreativeAggregated[] {
  return [...list].sort((a, b) => (b[key] as number) - (a[key] as number));
}

export const fmtVND = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫" : "—";

export const fmtCompactVND = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " tỷ ₫";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + " tr ₫";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K ₫";
  return n.toFixed(0) + " ₫";
};

export const fmtCompact = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(0);
};

export const fmtPct = (n: number, digits = 1) =>
  Number.isFinite(n) ? n.toFixed(digits) + "%" : "—";
