import { parseCSV, type CSVRow } from "./csv";

export type Lead = {
  raw: CSVRow;
  email: string;
  phone: string;
  name: string;
  source: string;
  campaign: string;
  createdAt: string;
  city: string;
  notes: string;
  id: string;
};

export type ExtractStats = {
  total: number;
  withEmail: number;
  withPhone: number;
  withName: number;
  duplicates: number;
  bySource: { name: string; count: number }[];
  byCampaign: { name: string; count: number }[];
  byDate: { name: string; count: number }[];
};

const EMAIL_KEYS = ["email", "e-mail", "mail", "địa chỉ email", "dia chi email"];
const PHONE_KEYS = [
  "phone",
  "phone_number",
  "phone number",
  "mobile",
  "số điện thoại",
  "so dien thoai",
  "sdt",
  "dien thoai",
];
const NAME_KEYS = [
  "full_name",
  "full name",
  "name",
  "họ tên",
  "ho ten",
  "ho va ten",
  "họ và tên",
  "first name",
  "tên",
];
const SOURCE_KEYS = ["source", "platform", "nguồn", "nguon", "ad platform"];
const CAMPAIGN_KEYS = [
  "campaign",
  "campaign_name",
  "campaign name",
  "chiến dịch",
  "ten chien dich",
];
const DATE_KEYS = [
  "created_time",
  "created time",
  "created_at",
  "created at",
  "time",
  "ngày",
  "ngay",
  "thời gian",
  "thoi gian",
  "date",
];
const CITY_KEYS = ["city", "tỉnh", "tinh", "thành phố", "thanh pho", "địa chỉ", "dia chi"];

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE_RE = /(?:\+?84|0)(?:\d[\s.-]?){8,10}/;

function pick(row: CSVRow, headers: string[], aliases: string[]): string {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const a of aliases) {
    const idx = lower.indexOf(a.toLowerCase());
    if (idx >= 0) {
      const v = row[headers[idx]];
      if (v) return v.trim();
    }
  }
  for (const a of aliases) {
    const idx = lower.findIndex((h) => h.includes(a.toLowerCase()));
    if (idx >= 0) {
      const v = row[headers[idx]];
      if (v) return v.trim();
    }
  }
  return "";
}

function scanAll(row: CSVRow, re: RegExp): string {
  for (const v of Object.values(row)) {
    if (!v) continue;
    const m = String(v).match(re);
    if (m) return m[0];
  }
  return "";
}

function normalizePhone(s: string): string {
  if (!s) return "";
  let p = s.replace(/[^\d+]/g, "");
  if (p.startsWith("+84")) p = "0" + p.slice(3);
  else if (p.startsWith("84") && p.length >= 10) p = "0" + p.slice(2);
  if (p.length >= 9 && p.length <= 11) return p;
  return "";
}

function normalizeEmail(s: string): string {
  if (!s) return "";
  const m = s.match(EMAIL_RE);
  return m ? m[0].toLowerCase() : "";
}

function dayOf(s: string): string {
  if (!s) return "";
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  // fallback: extract YYYY-MM-DD from string
  const m = s.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m) {
    const y = m[1];
    const mo = m[2].padStart(2, "0");
    const da = m[3].padStart(2, "0");
    return `${y}-${mo}-${da}`;
  }
  return s.slice(0, 10);
}

export function extractFromCSV(text: string): {
  leads: Lead[];
  stats: ExtractStats;
  headers: string[];
} {
  const { headers, rows } = parseCSV(text);
  const seen = new Set<string>();
  let duplicates = 0;
  const leads: Lead[] = [];

  for (const r of rows) {
    const email = normalizeEmail(pick(r, headers, EMAIL_KEYS) || scanAll(r, EMAIL_RE));
    const phone = normalizePhone(pick(r, headers, PHONE_KEYS) || scanAll(r, PHONE_RE));
    const name = pick(r, headers, NAME_KEYS);
    const source = pick(r, headers, SOURCE_KEYS) || "Facebook";
    const campaign = pick(r, headers, CAMPAIGN_KEYS);
    const createdAt = dayOf(pick(r, headers, DATE_KEYS));
    const city = pick(r, headers, CITY_KEYS);

    const key = `${email}|${phone}|${name.toLowerCase()}`;
    if (key !== "||" && seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);

    const id = email || phone || `r${leads.length + 1}`;
    leads.push({
      raw: r,
      email,
      phone,
      name,
      source,
      campaign,
      createdAt,
      city,
      notes: "",
      id,
    });
  }

  const stats = computeStats(leads, duplicates);
  return { leads, stats, headers };
}

export function extractFromJSON(text: string): {
  leads: Lead[];
  stats: ExtractStats;
  headers: string[];
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { leads: [], stats: emptyStats(), headers: [] };
  }
  const arr: Record<string, unknown>[] = Array.isArray(parsed)
    ? (parsed as Record<string, unknown>[])
    : Array.isArray((parsed as { data?: unknown })?.data)
      ? ((parsed as { data: Record<string, unknown>[] }).data)
      : [];
  if (arr.length === 0) return { leads: [], stats: emptyStats(), headers: [] };

  // Flatten field_data style (Lead Ads webhook) — [{name, values:[...]}]
  const csvRows: CSVRow[] = arr.map((it) => {
    const row: CSVRow = {};
    if (Array.isArray((it as { field_data?: unknown }).field_data)) {
      const fd = (it as { field_data: { name?: string; values?: string[] }[] }).field_data;
      for (const f of fd) {
        row[f.name || ""] = (f.values || []).join(", ");
      }
    }
    for (const [k, v] of Object.entries(it)) {
      if (k === "field_data") continue;
      row[k] = typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
    }
    return row;
  });
  const headers = Array.from(new Set(csvRows.flatMap((r) => Object.keys(r))));

  // Re-use the CSV extractor by piggy-backing on headers/rows.
  const seen = new Set<string>();
  let duplicates = 0;
  const leads: Lead[] = [];
  for (const r of csvRows) {
    const email = normalizeEmail(pick(r, headers, EMAIL_KEYS) || scanAll(r, EMAIL_RE));
    const phone = normalizePhone(pick(r, headers, PHONE_KEYS) || scanAll(r, PHONE_RE));
    const name = pick(r, headers, NAME_KEYS);
    const source = pick(r, headers, SOURCE_KEYS) || "Facebook Lead Ads";
    const campaign = pick(r, headers, CAMPAIGN_KEYS);
    const createdAt = dayOf(pick(r, headers, DATE_KEYS));
    const city = pick(r, headers, CITY_KEYS);

    const key = `${email}|${phone}|${name.toLowerCase()}`;
    if (key !== "||" && seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);
    leads.push({
      raw: r,
      email,
      phone,
      name,
      source,
      campaign,
      createdAt,
      city,
      notes: "",
      id: email || phone || `r${leads.length + 1}`,
    });
  }
  return { leads, stats: computeStats(leads, duplicates), headers };
}

function computeStats(leads: Lead[], duplicates: number): ExtractStats {
  const bySource = group(leads.map((l) => l.source || "(không rõ)"));
  const byCampaign = group(leads.map((l) => l.campaign || "(không gắn)"));
  const byDate = group(leads.map((l) => l.createdAt || "(không có)"));
  return {
    total: leads.length,
    withEmail: leads.filter((l) => l.email).length,
    withPhone: leads.filter((l) => l.phone).length,
    withName: leads.filter((l) => l.name).length,
    duplicates,
    bySource,
    byCampaign,
    byDate: byDate.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function group(values: string[]): { name: string; count: number }[] {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) || 0) + 1);
  return Array.from(m.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function emptyStats(): ExtractStats {
  return {
    total: 0,
    withEmail: 0,
    withPhone: 0,
    withName: 0,
    duplicates: 0,
    bySource: [],
    byCampaign: [],
    byDate: [],
  };
}

export const DEMO_DATASET_CSV = `created_time,full_name,email,phone_number,city,campaign_name,platform
2026-05-20T08:32:11+0700,Nguyễn Văn An,an.nguyen@gmail.com,0912345678,Hà Nội,KhuyenMai_Tet_Conversion,Facebook
2026-05-20T09:14:02+0700,Trần Thị Bích,bich.tran@yahoo.com,+84987654321,TP.HCM,Lead_Form_BDS,Facebook
2026-05-20T10:55:31+0700,Lê Quốc Cường,,0901112233,Đà Nẵng,Lookalike_HotLead,Instagram
2026-05-21T07:22:00+0700,Phạm Thu Dung,dung.pham@hotmail.com,0934567890,Hà Nội,Remarketing_30d,Facebook
2026-05-21T11:03:45+0700,Hoàng Minh Đức,duc.hoang@gmail.com,,Hải Phòng,KhuyenMai_Tet_Conversion,Facebook
2026-05-21T15:48:19+0700,Đỗ Thị Em,em.do@gmail.com,0976543210,Cần Thơ,Lead_Form_BDS,Facebook
2026-05-22T08:11:22+0700,Nguyễn Văn An,an.nguyen@gmail.com,0912345678,Hà Nội,KhuyenMai_Tet_Conversion,Facebook
2026-05-22T09:30:10+0700,Vũ Anh Giang,giang.vu@gmail.com,0945678901,Đà Nẵng,Lookalike_HotLead,Facebook
2026-05-22T14:02:55+0700,Bùi Khánh Hà,ha.bui@outlook.com,0923456789,TP.HCM,Brand_Awareness_Q1,Instagram
2026-05-22T16:18:40+0700,Lý Hoàng Ý,y.ly@gmail.com,0967890123,Hà Nội,Remarketing_30d,Facebook
2026-05-23T07:55:09+0700,Mai Văn Khoa,khoa.mai@gmail.com,0908765432,Bình Dương,Lead_Form_BDS,Facebook
2026-05-23T10:44:21+0700,Phan Thị Lan,lan.phan@gmail.com,+84919283746,Đồng Nai,KhuyenMai_Tet_Conversion,Facebook
`;
