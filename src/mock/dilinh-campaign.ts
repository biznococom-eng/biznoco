/**
 * Mock data Di Linh Campaign — hard-coded từ báo cáo PPTX gốc.
 * Dùng khi user chưa connect Meta API hoặc chưa có campaign data.
 */

export interface MockCampaign {
  id: string;
  fb_campaign_id: string;
  name: string;
  objective: string;
  status: string;
  effective_status: string;
  daily_budget: number;
  start_time: string;
  stop_time: string | null;
}

export interface MockOverview {
  total_spend: number;
  total_impressions: number;
  total_reach: number;
  avg_frequency: number;
  total_clicks: number;
  total_link_clicks: number;
  total_conversations: number;
  total_first_replies: number;
  total_welcome_views: number;
  total_connects: number;
  ctr_link: number;
  ctr_all: number;
  cpc_link: number;
  cpm: number;
  cost_per_conversation: number;
  days_count: number;
}

export interface MockBreakdown {
  value: string;
  gender: string | null;
  age_range: string | null;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  link_clicks: number;
  ctr_link: number;
  cpc_link: number;
  spend_share: number;
}

export const MOCK_DILINH_CAMPAIGN: MockCampaign = {
  id: "mock-dilinh-001",
  fb_campaign_id: "120201234567000999",
  name: "To mo-tof | BĐS | DILINH1",
  objective: "MESSAGES",
  status: "ACTIVE",
  effective_status: "ACTIVE",
  daily_budget: 100_000,
  start_time: "2026-05-22T00:00:00+07:00",
  stop_time: null,
};

export const MOCK_DILINH_OVERVIEW: MockOverview = {
  total_spend: 199_483,
  total_impressions: 1_977,
  total_reach: 1_382,
  avg_frequency: 1.43,
  total_clicks: 91,
  total_link_clicks: 33,
  total_conversations: 10,
  total_first_replies: 10,
  total_welcome_views: 23,
  total_connects: 10,
  ctr_link: 4.6,
  ctr_all: 4.6,
  cpc_link: 2_192,
  cpm: 100_900,
  cost_per_conversation: 19_948,
  days_count: 3,
};

export const MOCK_DILINH_GENDER: MockBreakdown[] = [
  {
    value: "male",
    gender: "male",
    age_range: null,
    spend: 130_929,
    impressions: 1_352,
    reach: 950,
    clicks: 66,
    link_clicks: 24,
    ctr_link: 4.88,
    cpc_link: 1_984,
    spend_share: 65.6,
  },
  {
    value: "female",
    gender: "female",
    age_range: null,
    spend: 66_475,
    impressions: 609,
    reach: 420,
    clicks: 24,
    link_clicks: 8,
    ctr_link: 3.94,
    cpc_link: 2_770,
    spend_share: 33.3,
  },
];

export const MOCK_DILINH_AGE: MockBreakdown[] = [
  { value: "18-24", gender: null, age_range: "18-24", spend: 6_056, impressions: 69, reach: 60, clicks: 2, link_clicks: 2, ctr_link: 2.9, cpc_link: 3_060, spend_share: 3.0 },
  { value: "25-34", gender: null, age_range: "25-34", spend: 22_945, impressions: 281, reach: 230, clicks: 8, link_clicks: 8, ctr_link: 2.85, cpc_link: 2_984, spend_share: 11.5 },
  { value: "35-44", gender: null, age_range: "35-44", spend: 53_213, impressions: 639, reach: 510, clicks: 21, link_clicks: 21, ctr_link: 3.29, cpc_link: 2_574, spend_share: 26.7 },
  { value: "45-54", gender: null, age_range: "45-54", spend: 57_220, impressions: 534, reach: 410, clicks: 33, link_clicks: 33, ctr_link: 6.18, cpc_link: 1_732, spend_share: 28.7 },
  { value: "55-64", gender: null, age_range: "55-64", spend: 43_456, impressions: 340, reach: 270, clicks: 15, link_clicks: 15, ctr_link: 4.41, cpc_link: 2_898, spend_share: 21.8 },
  { value: "65+", gender: null, age_range: "65+", spend: 14_842, impressions: 114, reach: 95, clicks: 12, link_clicks: 12, ctr_link: 10.53, cpc_link: 1_235, spend_share: 7.4 },
];

export const MOCK_DILINH_AGE_GENDER: MockBreakdown[] = [
  // Male
  { value: "Nam 18-24", gender: "male", age_range: "18-24", spend: 5_735, impressions: 48, reach: 42, clicks: 2, link_clicks: 2, ctr_link: 4.17, cpc_link: 2_868, spend_share: 2.9 },
  { value: "Nam 25-34", gender: "male", age_range: "25-34", spend: 14_860, impressions: 188, reach: 155, clicks: 6, link_clicks: 6, ctr_link: 3.19, cpc_link: 2_477, spend_share: 7.4 },
  { value: "Nam 35-44", gender: "male", age_range: "35-44", spend: 31_894, impressions: 466, reach: 380, clicks: 13, link_clicks: 13, ctr_link: 2.79, cpc_link: 2_453, spend_share: 16.0 },
  { value: "Nam 45-54", gender: "male", age_range: "45-54", spend: 38_120, impressions: 360, reach: 280, clicks: 24, link_clicks: 24, ctr_link: 6.67, cpc_link: 1_588, spend_share: 19.1 },
  { value: "Nam 55-64", gender: "male", age_range: "55-64", spend: 28_300, impressions: 220, reach: 175, clicks: 9, link_clicks: 9, ctr_link: 4.09, cpc_link: 3_144, spend_share: 14.2 },
  { value: "Nam 65+", gender: "male", age_range: "65+", spend: 12_020, impressions: 76, reach: 65, clicks: 11, link_clicks: 11, ctr_link: 14.47, cpc_link: 1_093, spend_share: 6.0 },
  // Female
  { value: "Nữ 18-24", gender: "female", age_range: "18-24", spend: 321, impressions: 19, reach: 17, clicks: 0, link_clicks: 0, ctr_link: 0, cpc_link: 0, spend_share: 0.2 },
  { value: "Nữ 25-34", gender: "female", age_range: "25-34", spend: 8_085, impressions: 89, reach: 72, clicks: 2, link_clicks: 2, ctr_link: 2.25, cpc_link: 4_043, spend_share: 4.1 },
  { value: "Nữ 35-44", gender: "female", age_range: "35-44", spend: 21_319, impressions: 168, reach: 125, clicks: 8, link_clicks: 8, ctr_link: 4.76, cpc_link: 2_665, spend_share: 10.7 },
  { value: "Nữ 45-54", gender: "female", age_range: "45-54", spend: 19_100, impressions: 174, reach: 130, clicks: 9, link_clicks: 9, ctr_link: 5.17, cpc_link: 2_122, spend_share: 9.6 },
  { value: "Nữ 55-64", gender: "female", age_range: "55-64", spend: 15_156, impressions: 120, reach: 95, clicks: 6, link_clicks: 6, ctr_link: 5.0, cpc_link: 2_526, spend_share: 7.6 },
  { value: "Nữ 65+", gender: "female", age_range: "65+", spend: 2_822, impressions: 38, reach: 30, clicks: 1, link_clicks: 1, ctr_link: 2.63, cpc_link: 2_822, spend_share: 1.4 },
];

export const MOCK_DILINH_REGION: MockBreakdown[] = [
  { value: "Lâm Đồng", gender: null, age_range: null, spend: 78_443, impressions: 869, reach: 620, clicks: 36, link_clicks: 14, ctr_link: 4.22, cpc_link: 5_603, spend_share: 39.3 },
  { value: "TP. Hồ Chí Minh", gender: null, age_range: null, spend: 32_120, impressions: 332, reach: 240, clicks: 25, link_clicks: 9, ctr_link: 7.53, cpc_link: 3_569, spend_share: 16.1 },
  { value: "Bình Thuận", gender: null, age_range: null, spend: 18_900, impressions: 178, reach: 130, clicks: 7, link_clicks: 3, ctr_link: 3.94, cpc_link: 6_300, spend_share: 9.5 },
  { value: "Bà Rịa–Vũng Tàu", gender: null, age_range: null, spend: 14_500, impressions: 153, reach: 110, clicks: 5, link_clicks: 2, ctr_link: 3.26, cpc_link: 7_250, spend_share: 7.3 },
  { value: "Hà Nội", gender: null, age_range: null, spend: 13_800, impressions: 127, reach: 95, clicks: 10, link_clicks: 4, ctr_link: 7.89, cpc_link: 3_450, spend_share: 6.9 },
  { value: "Bình Dương", gender: null, age_range: null, spend: 11_900, impressions: 102, reach: 80, clicks: 6, link_clicks: 2, ctr_link: 5.88, cpc_link: 5_950, spend_share: 6.0 },
  { value: "Khánh Hòa", gender: null, age_range: null, spend: 8_500, impressions: 90, reach: 70, clicks: 1, link_clicks: 1, ctr_link: 1.11, cpc_link: 8_500, spend_share: 4.3 },
  { value: "Đồng Nai", gender: null, age_range: null, spend: 7_800, impressions: 97, reach: 75, clicks: 5, link_clicks: 1, ctr_link: 5.15, cpc_link: 7_800, spend_share: 3.9 },
  { value: "An Giang", gender: null, age_range: null, spend: 5_523, impressions: 32, reach: 28, clicks: 0, link_clicks: 0, ctr_link: 0, cpc_link: 0, spend_share: 2.8 },
  { value: "Nghệ An", gender: null, age_range: null, spend: 5_530, impressions: 34, reach: 30, clicks: 0, link_clicks: 0, ctr_link: 0, cpc_link: 0, spend_share: 2.8 },
];

export const MOCK_DILINH_DEVICE: MockBreakdown[] = [
  { value: "Android Phone", gender: null, age_range: null, spend: 120_156, impressions: 1_197, reach: 850, clicks: 42, link_clicks: 18, ctr_link: 3.51, cpc_link: 6_676, spend_share: 60.2 },
  { value: "iPhone", gender: null, age_range: null, spend: 77_627, impressions: 754, reach: 510, clicks: 49, link_clicks: 14, ctr_link: 6.5, cpc_link: 5_545, spend_share: 38.9 },
  { value: "Android Tablet", gender: null, age_range: null, spend: 831, impressions: 10, reach: 8, clicks: 0, link_clicks: 0, ctr_link: 0, cpc_link: 0, spend_share: 0.4 },
  { value: "Desktop", gender: null, age_range: null, spend: 569, impressions: 12, reach: 10, clicks: 0, link_clicks: 1, ctr_link: 8.33, cpc_link: 569, spend_share: 0.3 },
];

export const MOCK_DILINH_PLATFORM: MockBreakdown[] = [
  { value: "Facebook", gender: null, age_range: null, spend: 199_283, impressions: 1_974, reach: 1_380, clicks: 91, link_clicks: 33, ctr_link: 4.61, cpc_link: 6_039, spend_share: 99.9 },
  { value: "Instagram", gender: null, age_range: null, spend: 200, impressions: 3, reach: 2, clicks: 0, link_clicks: 0, ctr_link: 0, cpc_link: 0, spend_share: 0.1 },
];

export interface MockCampaignBundle {
  campaign: MockCampaign;
  overview: MockOverview;
  gender: MockBreakdown[];
  age: MockBreakdown[];
  age_gender: MockBreakdown[];
  region: MockBreakdown[];
  device: MockBreakdown[];
  platform: MockBreakdown[];
}

export const MOCK_DILINH_BUNDLE: MockCampaignBundle = {
  campaign: MOCK_DILINH_CAMPAIGN,
  overview: MOCK_DILINH_OVERVIEW,
  gender: MOCK_DILINH_GENDER,
  age: MOCK_DILINH_AGE,
  age_gender: MOCK_DILINH_AGE_GENDER,
  region: MOCK_DILINH_REGION,
  device: MOCK_DILINH_DEVICE,
  platform: MOCK_DILINH_PLATFORM,
};

/** Additional mock campaigns cho list view */
export const MOCK_CAMPAIGNS_LIST: MockCampaign[] = [
  MOCK_DILINH_CAMPAIGN,
  {
    id: "mock-shop-002",
    fb_campaign_id: "120201234567000888",
    name: "BlackFriday | Cosmetic Shop | CONV",
    objective: "CONVERSIONS",
    status: "ACTIVE",
    effective_status: "ACTIVE",
    daily_budget: 500_000,
    start_time: "2026-05-15T00:00:00+07:00",
    stop_time: null,
  },
  {
    id: "mock-edu-003",
    fb_campaign_id: "120201234567000777",
    name: "Tuyển sinh IELTS | Q3 | TRAFFIC",
    objective: "TRAFFIC",
    status: "PAUSED",
    effective_status: "PAUSED",
    daily_budget: 200_000,
    start_time: "2026-05-01T00:00:00+07:00",
    stop_time: "2026-05-20T00:00:00+07:00",
  },
];

/** Quick overview cho campaigns khác (placeholder data) */
export const MOCK_CAMPAIGNS_OVERVIEW: Record<string, MockOverview> = {
  [MOCK_DILINH_CAMPAIGN.id]: MOCK_DILINH_OVERVIEW,
  "mock-shop-002": {
    total_spend: 4_280_000,
    total_impressions: 156_320,
    total_reach: 89_400,
    avg_frequency: 1.75,
    total_clicks: 3_840,
    total_link_clicks: 2_350,
    total_conversations: 0,
    total_first_replies: 0,
    total_welcome_views: 0,
    total_connects: 0,
    ctr_link: 1.5,
    ctr_all: 2.46,
    cpc_link: 1_821,
    cpm: 27_383,
    cost_per_conversation: 0,
    days_count: 9,
  },
  "mock-edu-003": {
    total_spend: 3_800_000,
    total_impressions: 89_500,
    total_reach: 54_200,
    avg_frequency: 1.65,
    total_clicks: 1_240,
    total_link_clicks: 850,
    total_conversations: 0,
    total_first_replies: 0,
    total_welcome_views: 0,
    total_connects: 0,
    ctr_link: 0.95,
    ctr_all: 1.39,
    cpc_link: 4_471,
    cpm: 42_458,
    cost_per_conversation: 0,
    days_count: 19,
  },
};
