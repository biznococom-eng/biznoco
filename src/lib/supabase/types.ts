/**
 * Typed schema cho Supabase client.
 * Map 1-1 với `db/schema.sql` — chỉnh khi thay đổi schema.
 *
 * Khi cần generate tự động (production): `supabase gen types typescript --project-id ... > src/lib/supabase/types.ts`
 */

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          avatar_url: string | null;
          subscription_tier: "free" | "base" | "ultra";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          fb_ad_account_id: string;
          fb_business_id: string | null;
          account_name: string;
          currency: string | null;
          timezone_name: string | null;
          access_token: string | null;
          token_expires_at: string | null;
          status: "active" | "paused" | "disconnected" | "error";
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["accounts"]["Row"]> & {
          user_id: string;
          fb_ad_account_id: string;
          account_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Row"]>;
      };
      creative_stats: {
        Row: CreativeStatsRow;
        Insert: Partial<CreativeStatsRow> & {
          account_id: string;
          date: string;
          ad_id: string;
        };
        Update: Partial<CreativeStatsRow>;
      };
    };
    Views: {
      creative_metrics: {
        Row: CreativeMetricsRow;
      };
    };
    Functions: {
      get_creative_summary: {
        Args: {
          p_account_id: string;
          p_start_date: string;
          p_end_date: string;
        };
        Returns: CreativeSummaryRow[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export interface CreativeStatsRow {
  id: string;
  account_id: string;
  date: string; // YYYY-MM-DD
  ad_id: string;
  ad_name: string | null;
  adset_id: string | null;
  adset_name: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  creative_type: "image" | "video" | "carousel" | "collection" | "unknown" | null;
  spend: number;
  impressions: number;
  reach: number | null;
  frequency: number | null;
  clicks: number;
  inline_link_clicks: number;
  video_3s_view: number | null;
  video_p25_view: number | null;
  video_p50_view: number | null;
  video_p75_view: number | null;
  video_p100_view: number | null;
  video_avg_time_watched: number | null;
  purchases: number | null;
  purchase_value: number | null;
  created_at: string;
}

export interface CreativeMetricsRow extends CreativeStatsRow {
  hook_rate: number | null;
  hold_rate: number | null;
  completion_rate: number | null;
  ctr_link: number | null;
  ctr_all: number | null;
  cpc_link: number | null;
  cpc_all: number | null;
  cpm: number | null;
  roas: number | null;
}

export interface CreativeSummaryRow {
  ad_id: string;
  ad_name: string | null;
  campaign_name: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  creative_type: CreativeStatsRow["creative_type"];
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  total_link_clicks: number;
  total_3s_views: number;
  total_p25_views: number;
  total_p50_views: number;
  total_p75_views: number;
  total_p100_views: number;
  total_purchases: number;
  total_purchase_value: number;
  hook_rate: number | null;
  hold_rate: number | null;
  completion_rate: number | null;
  ctr_link: number | null;
  ctr_all: number | null;
  cpc_link: number | null;
  cpm: number | null;
  roas: number | null;
}
