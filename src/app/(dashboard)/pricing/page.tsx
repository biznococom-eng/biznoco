import { getSupabaseServer, isSupabaseConfiguredServer } from "@/lib/supabase/server";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import type { PlanTier } from "@/lib/plan";

export const metadata = { title: "Bảng giá · Biznoco" };

export default async function PricingPage() {
  let currentTier: PlanTier = "free";

  if (isSupabaseConfiguredServer) {
    try {
      const supabase = await getSupabaseServer();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("subscription_tier")
          .eq("id", user.id)
          .maybeSingle();
        const raw = (data as { subscription_tier?: string } | null)?.subscription_tier;
        if (raw === "base" || raw === "ultra") currentTier = raw;
      }
    } catch { /* fallback free */ }
  }

  return <PricingPlans currentTier={currentTier} />;
}
