// Mock data cho bảng `creative_stats` — Facebook Creative Analytics Dashboard
// 12 ads × 14 ngày (2026-05-10 → 2026-05-23) = 168 rows
// Đổi ACCOUNT_ID bằng UUID account thực khi seed lên Supabase.

export type CreativeType = "image" | "video" | "carousel" | "collection" | "unknown";

export interface CreativeStat {
  id: string;
  account_id: string;
  date: string; // YYYY-MM-DD
  ad_id: string;
  ad_name: string;
  adset_id: string | null;
  adset_name: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  creative_type: CreativeType;
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  inline_link_clicks: number;
  video_3s_view: number;
  video_p25_view: number;
  video_p50_view: number;
  video_p75_view: number;
  video_p100_view: number;
  video_avg_time_watched: number;
  purchases: number;
  purchase_value: number;
  created_at: string;
}

export const ACCOUNT_ID = "00000000-0000-0000-0000-000000000001";

// ── 14 ngày gần nhất ────────────────────────────────────────────────────────
const DATES = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 4, 10 + i)); // 2026-05-10 .. 2026-05-23
  return d.toISOString().slice(0, 10);
});

// ── PRNG seeded (deterministic) ─────────────────────────────────────────────
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 48271) % 2147483647) - 1) / 2147483646;
}
function noise(r: () => number, base: number, pct: number) {
  return base * (1 + (r() - 0.5) * pct * 2);
}

// ── Sample video pool (public CDN demos) ────────────────────────────────────
const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
];

// ── 12 ad profiles, đa dạng kiểu hiệu suất ──────────────────────────────────
interface Profile {
  ad_id: string;
  ad_name: string;
  campaign_id: string;
  campaign_name: string;
  adset_id: string;
  adset_name: string;
  creative_type: CreativeType;
  thumb_seed: string;
  video_idx: number | null; // null = không phải video
  spend_vnd: number; // daily VND
  cpm_vnd: number;
  ctr_link: number; // %
  hook: number; // % (video_3s / impr) — 0 nếu non-video
  hold: number; // % (p25 / 3s)
  to_p50: number; // % (p50 / p25)
  to_p75: number; // % (p75 / p50)
  to_p100: number; // % (p100 / p75)
  avg_watch_s: number;
  aov_vnd: number;
  roas: number;
  freq: number;
  seed: number;
}

const PROFILES: Profile[] = [
  {
    ad_id: "120201234567890001",
    ad_name: "UGC_Video_Review_NuocHoaCharme_V2",
    campaign_id: "cmp_NH_CONV_Q2_2026",
    campaign_name: "NuocHoa_Charme_Conversion_Q2",
    adset_id: "as_NH_LAL3_M2534",
    adset_name: "LAL_3pct_Male_25-34_HCM_HN",
    creative_type: "video",
    thumb_seed: "charme-ugc-review",
    video_idx: 0,
    spend_vnd: 1_500_000,
    cpm_vnd: 38_000,
    ctr_link: 4.1,
    hook: 55,
    hold: 82,
    to_p50: 78,
    to_p75: 70,
    to_p100: 62,
    avg_watch_s: 19.5,
    aov_vnd: 350_000,
    roas: 6.2,
    freq: 1.42,
    seed: 11,
  },
  {
    ad_id: "120201234567890002",
    ad_name: "Video_BeforeAfter_KemDuongOhui_V1",
    campaign_id: "cmp_KD_CONV_Q2_2026",
    campaign_name: "Skincare_Ohui_Conversion_Q2",
    adset_id: "as_KD_INT_F2535",
    adset_name: "Interest_Skincare_Female_25-35",
    creative_type: "video",
    thumb_seed: "ohui-before-after",
    video_idx: 1,
    spend_vnd: 2_200_000,
    cpm_vnd: 32_000,
    ctr_link: 2.8,
    hook: 65, // hook cực cao nhưng...
    hold: 35, // ...rớt mạnh ở giây 3+
    to_p50: 55,
    to_p75: 40,
    to_p100: 28,
    avg_watch_s: 6.2,
    aov_vnd: 280_000,
    roas: 1.8,
    freq: 1.81,
    seed: 22,
  },
  {
    ad_id: "120201234567890003",
    ad_name: "Image_Sale_50_TraPhucLong",
    campaign_id: "cmp_TS_TRAFFIC_Q2_2026",
    campaign_name: "TraSua_PhucLong_Traffic_Q2",
    adset_id: "as_TS_BROAD_VN",
    adset_name: "Broad_Vietnam_18-45",
    creative_type: "image",
    thumb_seed: "phuclong-sale-50",
    video_idx: null,
    spend_vnd: 800_000,
    cpm_vnd: 22_000,
    ctr_link: 3.5,
    hook: 0,
    hold: 0,
    to_p50: 0,
    to_p75: 0,
    to_p100: 0,
    avg_watch_s: 0,
    aov_vnd: 60_000,
    roas: 4.1,
    freq: 1.95,
    seed: 33,
  },
  {
    ad_id: "120201234567890004",
    ad_name: "Video_Testimonial_VitaminC_V3",
    campaign_id: "cmp_TPC_CONV_Q2_2026",
    campaign_name: "ThucPhamCN_Blackmores_Conversion_Q2",
    adset_id: "as_TPC_INT_F3045",
    adset_name: "Interest_Health_Female_30-45",
    creative_type: "video",
    thumb_seed: "blackmores-vitc-testi",
    video_idx: 2,
    spend_vnd: 1_100_000,
    cpm_vnd: 35_000,
    ctr_link: 3.2,
    hook: 28, // hook thấp (intro chậm)
    hold: 88, // ...nhưng ai stay lại đều xem hết
    to_p50: 85,
    to_p75: 80,
    to_p100: 72,
    avg_watch_s: 32.4,
    aov_vnd: 450_000,
    roas: 7.4,
    freq: 1.31,
    seed: 44,
  },
  {
    ad_id: "120201234567890005",
    ad_name: "Carousel_Combo_SetQuaTet_V1",
    campaign_id: "cmp_QUA_CATALOG_Q2_2026",
    campaign_name: "SetQua_Premium_Catalog_Q2",
    adset_id: "as_QUA_LAL2_F2545",
    adset_name: "LAL_2pct_Female_25-45_TopCities",
    creative_type: "carousel",
    thumb_seed: "setqua-tet-combo",
    video_idx: null,
    spend_vnd: 1_300_000,
    cpm_vnd: 28_000,
    ctr_link: 4.0,
    hook: 0,
    hold: 0,
    to_p50: 0,
    to_p75: 0,
    to_p100: 0,
    avg_watch_s: 0,
    aov_vnd: 1_200_000,
    roas: 5.2,
    freq: 1.58,
    seed: 55,
  },
  {
    ad_id: "120201234567890006",
    ad_name: "Video_Demo_MayLocNuocKarofi_V2",
    campaign_id: "cmp_DG_CONV_Q2_2026",
    campaign_name: "DienGiaDung_Karofi_Conversion_Q2",
    adset_id: "as_DG_INT_F3050",
    adset_name: "Interest_Home_Family_30-50",
    creative_type: "video",
    thumb_seed: "karofi-may-loc-demo",
    video_idx: 3,
    spend_vnd: 1_800_000,
    cpm_vnd: 42_000,
    ctr_link: 2.5,
    hook: 35,
    hold: 70,
    to_p50: 75,
    to_p75: 65,
    to_p100: 55,
    avg_watch_s: 22.8,
    aov_vnd: 5_500_000,
    roas: 3.5,
    freq: 1.27,
    seed: 66,
  },
  {
    ad_id: "120201234567890007",
    ad_name: "Video_UGC_TutoMatNa_Banobagi_V1",
    campaign_id: "cmp_MP_CONV_Q2_2026",
    campaign_name: "MyPham_Banobagi_Conversion_Q2",
    adset_id: "as_MP_LAL5_F1828",
    adset_name: "LAL_5pct_Female_18-28_GenZ",
    creative_type: "video",
    thumb_seed: "banobagi-mat-na-tuto",
    video_idx: 4,
    spend_vnd: 900_000,
    cpm_vnd: 25_000,
    ctr_link: 3.5,
    hook: 45,
    hold: 75,
    to_p50: 72,
    to_p75: 64,
    to_p100: 58,
    avg_watch_s: 18.1,
    aov_vnd: 25_000,
    roas: 4.6,
    freq: 1.66,
    seed: 77,
  },
  {
    ad_id: "120201234567890008",
    ad_name: "Image_Discount_DongHoCasio_Nam_V1",
    campaign_id: "cmp_DH_CONV_Q2_2026",
    campaign_name: "DongHo_Casio_Conversion_Q2",
    adset_id: "as_DH_INT_M2545",
    adset_name: "Interest_Watches_Male_25-45",
    creative_type: "image",
    thumb_seed: "casio-nam-discount",
    video_idx: null,
    spend_vnd: 1_500_000,
    cpm_vnd: 30_000,
    ctr_link: 1.5,
    hook: 0,
    hold: 0,
    to_p50: 0,
    to_p75: 0,
    to_p100: 0,
    avg_watch_s: 0,
    aov_vnd: 850_000,
    roas: 2.6,
    freq: 2.04,
    seed: 88,
  },
  {
    ad_id: "120201234567890009",
    ad_name: "Video_Story_AoThunLocalBrand_V4",
    campaign_id: "cmp_TT_AWARENESS_Q2_2026",
    campaign_name: "ThoiTrang_Local_Awareness_Q2",
    adset_id: "as_TT_BROAD_GENZ",
    adset_name: "Broad_GenZ_18-26_VN",
    creative_type: "video",
    thumb_seed: "local-brand-aothun-story",
    video_idx: 5,
    spend_vnd: 1_300_000,
    cpm_vnd: 35_000,
    ctr_link: 1.8,
    hook: 38,
    hold: 55,
    to_p50: 60,
    to_p75: 45,
    to_p100: 32,
    avg_watch_s: 10.4,
    aov_vnd: 250_000,
    roas: 2.1,
    freq: 1.49,
    seed: 99,
  },
  {
    ad_id: "120201234567890010",
    ad_name: "Video_FlashSale_SonMaybelline_24h_V1",
    campaign_id: "cmp_MP_TRAFFIC_Q2_2026",
    campaign_name: "MyPham_Maybelline_Traffic_Q2",
    adset_id: "as_MP_BROAD_F1840",
    adset_name: "Broad_Female_18-40_VN",
    creative_type: "video",
    thumb_seed: "maybelline-flash-sale",
    video_idx: 6,
    // ── KỊCH BẢN "ĐỐT NGÂN SÁCH" ──
    spend_vnd: 3_500_000, // chi nhiều nhất
    cpm_vnd: 45_000,
    ctr_link: 0.8, // CTR cực thấp
    hook: 32,
    hold: 40,
    to_p50: 45,
    to_p75: 30,
    to_p100: 20,
    avg_watch_s: 5.8,
    aov_vnd: 120_000,
    roas: 0.6, // LỖ — ROAS < 1
    freq: 2.31,
    seed: 110,
  },
  {
    ad_id: "120201234567890011",
    ad_name: "Video_Retarget_WCA30d_TheOrdinary_V2",
    campaign_id: "cmp_MP_RTG_Q2_2026",
    campaign_name: "MyPham_TheOrdinary_Retargeting_Q2",
    adset_id: "as_MP_WCA30",
    adset_name: "WCA_30d_AllProducts_VN",
    creative_type: "video",
    thumb_seed: "theordinary-rtg-30d",
    video_idx: 7,
    // ── KỊCH BẢN RETARGETING THẮNG ──
    spend_vnd: 400_000, // chi ít
    cpm_vnd: 55_000, // CPM cao (audience nhỏ)
    ctr_link: 6.0, // CTR rất cao
    hook: 42,
    hold: 78,
    to_p50: 75,
    to_p75: 68,
    to_p100: 60,
    avg_watch_s: 21.7,
    aov_vnd: 380_000,
    roas: 9.5, // ROAS đỉnh
    freq: 1.18,
    seed: 121,
  },
  {
    ad_id: "120201234567890012",
    ad_name: "Image_NewArrival_TuiCNK_Summer_V1",
    campaign_id: "cmp_TT_CONV_Q2_2026",
    campaign_name: "ThoiTrang_CNK_Conversion_Q2",
    adset_id: "as_TT_INT_F2238",
    adset_name: "Interest_Fashion_Female_22-38",
    creative_type: "image",
    thumb_seed: "cnk-tui-summer",
    video_idx: null,
    spend_vnd: 700_000,
    cpm_vnd: 32_000,
    ctr_link: 2.2,
    hook: 0,
    hold: 0,
    to_p50: 0,
    to_p75: 0,
    to_p100: 0,
    avg_watch_s: 0,
    aov_vnd: 690_000,
    roas: 3.2,
    freq: 1.39,
    seed: 132,
  },
];

// ── Builder ─────────────────────────────────────────────────────────────────
function uuid(p: string, i: number): string {
  // pseudo-UUID deterministic theo (ad_id, date_index)
  const hash = (s: string) => {
    let h = 2166136261;
    for (let k = 0; k < s.length; k++) h = Math.imul(h ^ s.charCodeAt(k), 16777619);
    return (h >>> 0).toString(16).padStart(8, "0");
  };
  const a = hash(p + ":" + i);
  const b = hash(p + ":b:" + i);
  return `${a}-${b.slice(0, 4)}-4${b.slice(4, 7)}-a${b.slice(0, 3)}-${a}${b.slice(0, 4)}`;
}

function buildRow(p: Profile, date: string, dayIdx: number): CreativeStat {
  const r = rng(p.seed * 1000 + dayIdx);
  const spend = Math.round(noise(r, p.spend_vnd, 0.18));
  const impressions = Math.round((spend / p.cpm_vnd) * 1000 * (1 + (r() - 0.5) * 0.1));
  const freq = +noise(r, p.freq, 0.08).toFixed(2);
  const reach = Math.round(impressions / Math.max(freq, 1));

  const linkClicks = Math.round((impressions * p.ctr_link) / 100 * (1 + (r() - 0.5) * 0.18));
  const clicks = Math.round(linkClicks * noise(r, 1.32, 0.08)); // all clicks > link clicks

  let v3 = 0,
    v25 = 0,
    v50 = 0,
    v75 = 0,
    v100 = 0,
    avgW = 0;
  if (p.creative_type === "video") {
    v3 = Math.round((impressions * p.hook) / 100 * (1 + (r() - 0.5) * 0.06));
    v25 = Math.round((v3 * p.hold) / 100 * (1 + (r() - 0.5) * 0.05));
    v50 = Math.round((v25 * p.to_p50) / 100 * (1 + (r() - 0.5) * 0.05));
    v75 = Math.round((v50 * p.to_p75) / 100 * (1 + (r() - 0.5) * 0.05));
    v100 = Math.round((v75 * p.to_p100) / 100 * (1 + (r() - 0.5) * 0.05));
    avgW = +noise(r, p.avg_watch_s, 0.1).toFixed(2);
  }

  const purchaseValue = Math.round(spend * p.roas * (1 + (r() - 0.5) * 0.15));
  const purchases = Math.max(0, Math.round(purchaseValue / p.aov_vnd));

  return {
    id: uuid(p.ad_id, dayIdx),
    account_id: ACCOUNT_ID,
    date,
    ad_id: p.ad_id,
    ad_name: p.ad_name,
    adset_id: p.adset_id,
    adset_name: p.adset_name,
    campaign_id: p.campaign_id,
    campaign_name: p.campaign_name,
    thumbnail_url: `https://picsum.photos/seed/${p.thumb_seed}/600/600`,
    video_url: p.video_idx !== null ? SAMPLE_VIDEOS[p.video_idx] : null,
    creative_type: p.creative_type,
    spend,
    impressions,
    reach,
    frequency: freq,
    clicks,
    inline_link_clicks: linkClicks,
    video_3s_view: v3,
    video_p25_view: v25,
    video_p50_view: v50,
    video_p75_view: v75,
    video_p100_view: v100,
    video_avg_time_watched: avgW,
    purchases,
    purchase_value: purchaseValue,
    created_at: `${date}T03:15:00.000Z`,
  };
}

// ── Final export ────────────────────────────────────────────────────────────
export const CREATIVE_STATS_MOCK: CreativeStat[] = PROFILES.flatMap((p) =>
  DATES.map((d, i) => buildRow(p, d, i)),
);

// ── Helpers (tuỳ chọn) ──────────────────────────────────────────────────────
export const MOCK_AD_IDS = PROFILES.map((p) => p.ad_id);

export const getMockByAdId = (adId: string): CreativeStat[] =>
  CREATIVE_STATS_MOCK.filter((r) => r.ad_id === adId);

export const getMockByDate = (date: string): CreativeStat[] =>
  CREATIVE_STATS_MOCK.filter((r) => r.date === date);

export const getMockInRange = (start: string, end: string): CreativeStat[] =>
  CREATIVE_STATS_MOCK.filter((r) => r.date >= start && r.date <= end);
