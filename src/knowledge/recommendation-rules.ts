/**
 * 🧠 Rule-based Recommendation Engine
 *
 * Input: campaign overview + demographics breakdowns
 * Output: array of recommendation cards (Di Linh slide 9 style)
 *
 * Mỗi rule kiểm tra 1 pattern → tạo card với severity + action.
 * Thêm rule mới: push vào `ALL_RULES`.
 */

import {
  GENERAL_BENCHMARKS,
  classifyMetric,
  resolveThreshold,
} from "./benchmarks";

export type CardSeverity = "good" | "watch" | "action" | "critical";
export type CardCategory =
  | "delivery"
  | "creative"
  | "audience"
  | "geography"
  | "device"
  | "messenger"
  | "budget";

export interface RecommendationCard {
  id: string;
  severity: CardSeverity;
  category: CardCategory;
  title: string;
  body: string;
  /** Optional concrete action steps (numbered) */
  actions?: string[];
  /** Optional badge label (vd: "ĐANG TỐT", "THEO DÕI", "HÀNH ĐỘNG") */
  badge?: string;
}

export interface CampaignOverviewInput {
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  link_clicks: number;
  conversations: number;
  ctr_link: number;
  cpc_link: number;
  cpm: number;
  cost_per_conversation: number;
}

export interface DemographicsInput {
  /** {value: 'male', impressions, ctr, cpc, spend, ...} */
  by_gender: BreakdownRow[];
  by_age: BreakdownRow[];
  by_age_gender: BreakdownRow[];
  by_region: BreakdownRow[];
  by_device: BreakdownRow[];
  by_platform: BreakdownRow[];
}

export interface BreakdownRow {
  value: string;
  spend: number;
  impressions: number;
  clicks: number;
  link_clicks: number;
  ctr_link: number;
  cpc_link: number;
  spend_share: number;
}

export interface MessengerFunnelInput {
  impressions: number;
  reach: number;
  welcome_views: number;
  connects: number;
  conversations: number;
  first_replies: number;
}

export interface RuleContext {
  overview: CampaignOverviewInput;
  demo: DemographicsInput;
  funnel?: MessengerFunnelInput;
  industry?: string;
  objective?: string;
  currency?: string; // VND default
}

type Rule = (ctx: RuleContext) => RecommendationCard | null;

// ── Helpers ─────────────────────────────────────────────────────────────────
const SEVERITY_TO_BADGE: Record<CardSeverity, string> = {
  good: "ĐANG TỐT",
  watch: "THEO DÕI",
  action: "HÀNH ĐỘNG",
  critical: "CẢNH BÁO",
};

function fmtVND(n: number) {
  return Math.round(n).toLocaleString("vi-VN") + "₫";
}

function topN(rows: BreakdownRow[], n: number, by: keyof BreakdownRow = "ctr_link") {
  return [...rows].sort((a, b) => (b[by] as number) - (a[by] as number)).slice(0, n);
}

function bottomZero(rows: BreakdownRow[], minSpend = 1000) {
  return rows.filter((r) => r.spend > minSpend && r.link_clicks === 0);
}

// ── Rules ──────────────────────────────────────────────────────────────────

/** R1: Phát hiện top tier audience (CTR cao + CPC thấp) */
const ruleTopAudience: Rule = (ctx) => {
  const top = topN(ctx.demo.by_age_gender, 2, "ctr_link").filter(
    (r) => r.ctr_link > 3 && r.spend > 500,
  );
  if (top.length === 0) return null;
  const list = top
    .map((r) => `${r.value} CTR ${r.ctr_link.toFixed(2)}% · CPC ${fmtVND(r.cpc_link)}`)
    .join(", ");
  return {
    id: "top_audience",
    severity: "good",
    category: "audience",
    badge: SEVERITY_TO_BADGE.good,
    title: `Tệp vàng: ${top.map((r) => r.value).join(" & ")}`,
    body: `${list}. Đây là nhóm khán giả response tốt nhất chiến dịch.`,
    actions: [
      `Tạo Ad Set riêng cho ${top[0].value}, phân bổ 50-60% tổng budget.`,
      "Mở rộng audience tương tự (Lookalike 1-3%) từ list này.",
    ],
  };
};

/** R2: Top geo performers */
const ruleTopGeo: Rule = (ctx) => {
  const top = topN(ctx.demo.by_region, 3, "ctr_link").filter((r) => r.ctr_link > 3);
  if (top.length === 0) return null;
  const list = top.map((r) => `${r.value} (CTR ${r.ctr_link.toFixed(2)}%)`).join(", ");
  return {
    id: "top_geo",
    severity: "good",
    category: "geography",
    badge: SEVERITY_TO_BADGE.good,
    title: `Top tỉnh/thành: ${top.map((r) => r.value).slice(0, 2).join(" & ")}`,
    body: `${list} response cao nhất. Có thể là khách hàng đầu tư / ngoại tỉnh.`,
    actions: [
      `Tạo Remarketing campaign riêng cho ${top
        .slice(0, 2)
        .map((r) => r.value)
        .join(" + ")}.`,
      "Test creative nhấn mạnh giá trị đầu tư hoặc local angle.",
    ],
  };
};

/** R3: Geo budget waste — tỉnh có spend nhưng 0 clicks */
const ruleGeoWaste: Rule = (ctx) => {
  const waste = bottomZero(ctx.demo.by_region, 1_000);
  if (waste.length === 0) return null;
  const totalWaste = waste.reduce((s, r) => s + r.spend, 0);
  const names = waste.map((r) => r.value).slice(0, 3).join(", ");
  return {
    id: "geo_waste",
    severity: "action",
    category: "geography",
    badge: SEVERITY_TO_BADGE.action,
    title: "Cắt tỉnh CTR = 0%",
    body: `${names} tiêu ${fmtVND(totalWaste)} nhưng 0 link clicks.`,
    actions: [
      `Loại ${names} khỏi targeting.`,
      "Tái phân bổ ngân sách sang top geo tier 1.",
    ],
  };
};

/** R4: iOS vs Android — recommend creative tối ưu thiết bị */
const ruleDevice: Rule = (ctx) => {
  const iphone = ctx.demo.by_device.find((r) => /iphone|ios/i.test(r.value));
  const android = ctx.demo.by_device.find((r) => /android/i.test(r.value));
  if (!iphone || !android || iphone.ctr_link === 0 || android.ctr_link === 0) return null;
  const ratio = iphone.ctr_link / android.ctr_link;
  if (ratio < 1.4) return null;
  return {
    id: "device_ios_winner",
    severity: "action",
    category: "device",
    badge: SEVERITY_TO_BADGE.action,
    title: "Tối ưu creative cho iOS",
    body: `iPhone CTR ${iphone.ctr_link.toFixed(2)}% vs Android ${android.ctr_link.toFixed(
      2,
    )}% — gấp ${ratio.toFixed(2)}×. Audience iOS thường có tài chính tốt hơn.`,
    actions: [
      "Tạo phiên bản creative 9:16 dọc cho Stories/Reels (iOS dùng nhiều).",
      "Test ad set riêng targeting iOS với bid cao hơn.",
    ],
  };
};

/** R5: Messenger funnel — phát hiện chỗ rớt */
const ruleMessengerFunnel: Rule = (ctx) => {
  if (!ctx.funnel || ctx.funnel.welcome_views === 0) return null;
  const f = ctx.funnel;
  const welcomeToConnect = f.welcome_views > 0 ? (f.connects / f.welcome_views) * 100 : 0;
  if (welcomeToConnect >= 60) return null; // funnel tốt rồi
  return {
    id: "messenger_funnel",
    severity: "action",
    category: "messenger",
    badge: SEVERITY_TO_BADGE.action,
    title: "Tối ưu phễu Messenger",
    body: `Welcome → Connect chỉ ${welcomeToConnect.toFixed(1)}%. ${
      f.welcome_views - f.connects
    } người xem welcome nhưng không kết nối.`,
    actions: [
      "Rút gọn nội dung welcome message (dưới 50 từ).",
      "Thêm CTA rõ ràng (vd: 'Bấm Bắt đầu để xem giá').",
      "Cài Auto-reply trong 5 phút đầu để bắt khách 'nóng'.",
    ],
  };
};

/** R6: CTR thấp hơn benchmark — cần thay creative */
const ruleLowCtr: Rule = (ctx) => {
  const t = resolveThreshold("ctr_link", ctx.industry, ctx.objective);
  const tier = classifyMetric(ctx.overview.ctr_link, t);
  if (tier !== "poor") return null;
  return {
    id: "low_ctr",
    severity: "critical",
    category: "creative",
    badge: SEVERITY_TO_BADGE.critical,
    title: "CTR dưới chuẩn ngành",
    body: `CTR ${ctx.overview.ctr_link.toFixed(2)}% < ngưỡng ${t.average}${t.unit}. Creative không thu hút.`,
    actions: [
      "Refresh creative — đổi thumbnail / 3 giây đầu video.",
      "Test angle mới (problem-agitate-solve, social proof, urgency).",
      "Kiểm tra audience có phù hợp sản phẩm không.",
    ],
  };
};

/** R7: CPC cao hơn benchmark — audience bão hoà hoặc bid quá cao */
const ruleHighCpc: Rule = (ctx) => {
  const t = resolveThreshold("cpc_link_vnd", ctx.industry, ctx.objective);
  const tier = classifyMetric(ctx.overview.cpc_link, t);
  if (tier !== "poor") return null;
  return {
    id: "high_cpc",
    severity: "watch",
    category: "delivery",
    badge: SEVERITY_TO_BADGE.watch,
    title: "CPC cao bất thường",
    body: `CPC ${fmtVND(ctx.overview.cpc_link)} > ngưỡng ${fmtVND(t.average)}. Có thể do audience bão hoà hoặc bid quá cao.`,
    actions: [
      "Tăng audience size (LAL 5-10% thay vì 1-3%).",
      "Chuyển từ Manual bid → Auto bid.",
      "Kiểm tra frequency — nếu > 3 thì refresh creative.",
    ],
  };
};

/** R8: Frequency cao — audience sắp bị burn out */
const ruleHighFrequency: Rule = (ctx) => {
  if (ctx.overview.frequency < 2.5) return null;
  return {
    id: "high_frequency",
    severity: "watch",
    category: "creative",
    badge: SEVERITY_TO_BADGE.watch,
    title: "Audience đang bị burn out",
    body: `Frequency ${ctx.overview.frequency.toFixed(2)}× — mỗi người xem ad ${ctx.overview.frequency.toFixed(
      1,
    )} lần trong period. Risk burn out, CTR sẽ giảm.`,
    actions: [
      "Refresh creative trong 3-5 ngày tới.",
      "Mở rộng audience hoặc đổi targeting.",
      "Đặt frequency cap nếu objective là REACH/BRAND_AWARENESS.",
    ],
  };
};

/** R9: Gender imbalance — 1 giới performance vượt trội */
const ruleGenderImbalance: Rule = (ctx) => {
  const male = ctx.demo.by_gender.find((r) => /male|nam/i.test(r.value) && !/female/i.test(r.value));
  const female = ctx.demo.by_gender.find((r) => /female|nữ|nu/i.test(r.value));
  if (!male || !female || male.ctr_link === 0 || female.ctr_link === 0) return null;
  const ratio = Math.max(male.ctr_link, female.ctr_link) / Math.min(male.ctr_link, female.ctr_link);
  if (ratio < 1.3) return null;
  const winner = male.ctr_link > female.ctr_link ? male : female;
  const loser = winner === male ? female : male;
  const wName = winner === male ? "Nam" : "Nữ";
  const lName = loser === male ? "Nam" : "Nữ";
  return {
    id: "gender_imbalance",
    severity: "action",
    category: "audience",
    badge: SEVERITY_TO_BADGE.action,
    title: `${wName} response tốt hơn ${lName} ${((ratio - 1) * 100).toFixed(0)}%`,
    body: `${wName} CTR ${winner.ctr_link.toFixed(2)}% · CPC ${fmtVND(
      winner.cpc_link,
    )} | ${lName} CTR ${loser.ctr_link.toFixed(2)}% · CPC ${fmtVND(loser.cpc_link)}.`,
    actions: [
      `Tạo Ad Set riêng cho ${wName}, ưu tiên 60-70% budget.`,
      `Test creative khác cho ${lName} nếu muốn giữ — nội dung phù hợp hơn.`,
    ],
  };
};

/** R10: Cost per conversation cao (Messenger campaigns) */
const ruleHighCostConvo: Rule = (ctx) => {
  if (ctx.overview.conversations === 0) return null;
  const t = resolveThreshold("cost_per_conversation_vnd", ctx.industry, ctx.objective);
  const tier = classifyMetric(ctx.overview.cost_per_conversation, t);
  if (tier === "excellent" || tier === "good") return null;
  return {
    id: "high_cost_convo",
    severity: tier === "poor" ? "critical" : "watch",
    category: "messenger",
    badge: tier === "poor" ? SEVERITY_TO_BADGE.critical : SEVERITY_TO_BADGE.watch,
    title: "Chi phí mỗi hội thoại cao",
    body: `${fmtVND(ctx.overview.cost_per_conversation)}/hội thoại — cao hơn benchmark (${fmtVND(t.good)}).`,
    actions: [
      "Optimize creative để filter audience: nói rõ giá / điều kiện ngay trong ad.",
      "Cài flow chatbot tự động qualify lead (giảm cost-per-quality-lead).",
      "Test campaign optimization → Conversations thay vì Link Clicks.",
    ],
  };
};

// ── Registry ────────────────────────────────────────────────────────────────
export const ALL_RULES: Rule[] = [
  ruleTopAudience,
  ruleTopGeo,
  ruleGeoWaste,
  ruleDevice,
  ruleMessengerFunnel,
  ruleLowCtr,
  ruleHighCpc,
  ruleHighFrequency,
  ruleGenderImbalance,
  ruleHighCostConvo,
];

/**
 * Run all rules và trả về cards (đã sắp xếp: good → watch → action → critical).
 */
export function generateRecommendations(ctx: RuleContext): RecommendationCard[] {
  const cards: RecommendationCard[] = [];
  for (const rule of ALL_RULES) {
    try {
      const c = rule(ctx);
      if (c) cards.push(c);
    } catch (err) {
      // Rule lỗi → skip, không break toàn bộ
      console.warn("Rule error:", err);
    }
  }
  // Sort: good first (positive findings), then watch, then action, then critical
  const order: CardSeverity[] = ["good", "watch", "action", "critical"];
  return cards.sort(
    (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity),
  );
}
