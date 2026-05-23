import { parseNumberLoose, type CSVRow } from "./csv";

export type AdsCampaign = {
  name: string;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpr: number;
  roas: number;
  frequency: number;
  rows: number;
};

// Column aliases — accept both English (FB Ads Manager) and Vietnamese exports.
// Matching is case-insensitive and ignores extra whitespace.
const ALIASES: Record<keyof Omit<AdsCampaign, "name" | "ctr" | "cpc" | "cpm" | "cpr" | "roas" | "rows" | "frequency">, string[]> & {
  name: string[];
  frequency: string[];
} = {
  name: [
    "campaign name",
    "tên chiến dịch",
    "ten chien dich",
    "chiến dịch",
    "campaign",
  ],
  impressions: [
    "impressions",
    "số lần hiển thị",
    "luot hien thi",
    "lượt hiển thị",
  ],
  reach: ["reach", "số người tiếp cận", "tiep can", "nguoi tiep can"],
  clicks: [
    "clicks (all)",
    "clicks",
    "link clicks",
    "lượt nhấp",
    "luot nhap",
    "click",
  ],
  spend: [
    "amount spent (vnd)",
    "amount spent (usd)",
    "amount spent",
    "spend",
    "số tiền đã chi tiêu",
    "chi phí",
    "chi phi",
    "ngân sách",
  ],
  conversions: [
    "purchases",
    "results",
    "conversions",
    "leads",
    "kết quả",
    "ket qua",
    "lead",
    "đơn hàng",
    "don hang",
  ],
  conversionValue: [
    "purchase conversion value",
    "purchases conversion value",
    "conversion value",
    "giá trị chuyển đổi",
    "gia tri chuyen doi",
    "doanh thu",
    "revenue",
  ],
  frequency: ["frequency", "tần suất", "tan suat"],
};

function findCol(headers: string[], aliases: string[]): string | null {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const a of aliases) {
    const idx = lower.indexOf(a.toLowerCase());
    if (idx >= 0) return headers[idx];
  }
  // fuzzy — contains
  for (const a of aliases) {
    const idx = lower.findIndex((h) => h.includes(a.toLowerCase()));
    if (idx >= 0) return headers[idx];
  }
  return null;
}

export type AdsParseResult = {
  campaigns: AdsCampaign[];
  totals: AdsCampaign;
  detectedColumns: Record<string, string | null>;
  totalRows: number;
};

export function aggregateAdsCSV(headers: string[], rows: CSVRow[]): AdsParseResult {
  const cols = {
    name: findCol(headers, ALIASES.name),
    impressions: findCol(headers, ALIASES.impressions),
    reach: findCol(headers, ALIASES.reach),
    clicks: findCol(headers, ALIASES.clicks),
    spend: findCol(headers, ALIASES.spend),
    conversions: findCol(headers, ALIASES.conversions),
    conversionValue: findCol(headers, ALIASES.conversionValue),
    frequency: findCol(headers, ALIASES.frequency),
  };

  const byName = new Map<string, AdsCampaign>();
  for (const r of rows) {
    const name = cols.name ? r[cols.name] || "(không tên)" : "(không tên)";
    const c = byName.get(name) ?? blank(name);
    c.impressions += num(r, cols.impressions);
    c.reach += num(r, cols.reach);
    c.clicks += num(r, cols.clicks);
    c.spend += num(r, cols.spend);
    c.conversions += num(r, cols.conversions);
    c.conversionValue += num(r, cols.conversionValue);
    c.frequency += num(r, cols.frequency);
    c.rows += 1;
    byName.set(name, c);
  }

  const campaigns = Array.from(byName.values()).map(derive);
  campaigns.sort((a, b) => b.spend - a.spend);

  const totals = campaigns.reduce(
    (acc, c) => {
      acc.impressions += c.impressions;
      acc.reach += c.reach;
      acc.clicks += c.clicks;
      acc.spend += c.spend;
      acc.conversions += c.conversions;
      acc.conversionValue += c.conversionValue;
      acc.frequency += c.frequency * c.rows;
      acc.rows += c.rows;
      return acc;
    },
    blank("TỔNG"),
  );
  if (totals.rows > 0) totals.frequency = totals.frequency / totals.rows;
  derive(totals);

  return {
    campaigns,
    totals,
    detectedColumns: cols,
    totalRows: rows.length,
  };
}

function num(r: CSVRow, col: string | null): number {
  if (!col) return 0;
  const n = parseNumberLoose(r[col]);
  return Number.isFinite(n) ? n : 0;
}

function blank(name: string): AdsCampaign {
  return {
    name,
    impressions: 0,
    reach: 0,
    clicks: 0,
    spend: 0,
    conversions: 0,
    conversionValue: 0,
    ctr: 0,
    cpc: 0,
    cpm: 0,
    cpr: 0,
    roas: 0,
    frequency: 0,
    rows: 0,
  };
}

function derive(c: AdsCampaign): AdsCampaign {
  c.ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
  c.cpc = c.clicks > 0 ? c.spend / c.clicks : 0;
  c.cpm = c.impressions > 0 ? (c.spend / c.impressions) * 1000 : 0;
  c.cpr = c.conversions > 0 ? c.spend / c.conversions : 0;
  c.roas = c.spend > 0 ? c.conversionValue / c.spend : 0;
  return c;
}

export const DEMO_ADS_CSV = `Campaign name,Impressions,Reach,Clicks (all),Amount spent (VND),Purchases,Purchase conversion value,Frequency
KhuyenMai_Tet_Conversion,128430,89220,4210,8450000,128,128000000,1.44
Brand_Awareness_Q1,512300,302100,6820,4200000,42,21000000,1.70
Lead_Form_BDS,84210,52400,3120,5180000,86,0,1.61
Remarketing_30d,42100,21800,2890,2890000,72,72000000,1.93
TopFunnel_Video,289400,221050,2210,2100000,12,6000000,1.31
Lookalike_HotLead,67800,45200,2010,3650000,58,58000000,1.50
`;
