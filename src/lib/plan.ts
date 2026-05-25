export type PlanTier = "free" | "base" | "ultra";

export interface PlanDef {
  label: string;
  price: number;
  campaigns: number;
  history: boolean;
  pdf: boolean;
  ai: boolean;
  description: string;
}

export const PLAN_CONFIG: Record<PlanTier, PlanDef> = {
  free: {
    label: "FREE",
    price: 0,
    campaigns: 1,
    history: false,
    pdf: false,
    ai: false,
    description: "Dùng thử miễn phí",
  },
  base: {
    label: "BASE",
    price: 10,
    campaigns: 10,
    history: true,
    pdf: true,
    ai: true,
    description: "Cho team nhỏ & freelancer",
  },
  ultra: {
    label: "ULTRA",
    price: 15,
    campaigns: Infinity,
    history: true,
    pdf: true,
    ai: true,
    description: "Không giới hạn, mọi tính năng",
  },
};

export function canCreateCampaign(tier: PlanTier, currentCount: number): boolean {
  const limit = PLAN_CONFIG[tier].campaigns;
  return currentCount < limit;
}

export function getCampaignLimit(tier: PlanTier): number {
  return PLAN_CONFIG[tier].campaigns;
}

export function hasFeature(tier: PlanTier, feature: keyof Pick<PlanDef, "history" | "pdf" | "ai">): boolean {
  return PLAN_CONFIG[tier][feature];
}
