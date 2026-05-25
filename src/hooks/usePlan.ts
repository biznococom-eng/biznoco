"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { type PlanTier, PLAN_CONFIG, type PlanDef } from "@/lib/plan";

export interface UsePlanResult {
  tier: PlanTier;
  plan: PlanDef;
  isLoading: boolean;
}

export function usePlan(): UsePlanResult {
  const [tier, setTier] = useState<PlanTier>("free");
  const [isLoading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      const sb = getSupabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await sb
        .from("users")
        .select("subscription_tier")
        .eq("id", user.id)
        .maybeSingle();

      const raw = (data as { subscription_tier?: string } | null)?.subscription_tier;
      if (raw === "base" || raw === "ultra") setTier(raw);
      else setTier("free");
    } catch {
      setTier("free");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { tier, plan: PLAN_CONFIG[tier], isLoading };
}
