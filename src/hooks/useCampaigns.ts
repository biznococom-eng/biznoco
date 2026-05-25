"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface CampaignRow {
  id: string;
  account_id: string;
  fb_campaign_id: string;
  name: string;
  objective: string | null;
  status: string;
  effective_status: string | null;
  daily_budget: number | null;
  lifetime_budget: number | null;
  start_time: string | null;
  stop_time: string | null;
  last_synced_at: string | null;
}

export interface UseCampaignsResult {
  campaigns: CampaignRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch campaigns của user đang login (RLS đã chặn theo account ownership).
 * Trả về empty array nếu chưa có data — caller fallback mock.
 */
export function useCampaigns(enabled: boolean = true): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [isLoading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sb = getSupabase();
      const { data, error: e } = await sb
        .from("campaigns")
        .select("*")
        .order("created_time", { ascending: false });
      if (e) {
        // Bảng có thể chưa được migrate
        if (/relation.*does not exist|table.*not found/i.test(e.message)) {
          setCampaigns([]);
          setLoading(false);
          return;
        }
        throw new Error(e.message);
      }
      setCampaigns((data ?? []) as CampaignRow[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { campaigns, isLoading, error, refetch: load };
}
