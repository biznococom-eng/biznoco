"use client";

import Link from "next/link";
import { Check, X, Zap, Crown, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLAN_CONFIG, type PlanTier } from "@/lib/plan";

interface PricingPlansProps {
  currentTier?: PlanTier;
}

const TIER_ORDER: PlanTier[] = ["free", "base", "ultra"];

const TIER_META: Record<PlanTier, { icon: React.ComponentType<{ className?: string }>; highlight: boolean; badge?: string }> = {
  free:  { icon: Gift,  highlight: false },
  base:  { icon: Zap,   highlight: true,  badge: "Phổ biến nhất" },
  ultra: { icon: Crown, highlight: false },
};

const FEATURES: { key: string; label: string; free: string | boolean; base: string | boolean; ultra: string | boolean }[] = [
  { key: "campaigns", label: "Chiến dịch phân tích",   free: "1 chiến dịch",   base: "10 chiến dịch",  ultra: "Không giới hạn" },
  { key: "history",   label: "Lưu lịch sử chiến dịch", free: false,            base: true,             ultra: true },
  { key: "pdf",       label: "Xuất báo cáo PDF",        free: false,            base: true,             ultra: true },
  { key: "ai",        label: "AI gợi ý tối ưu ads",     free: false,            base: true,             ultra: true },
  { key: "support",   label: "Hỗ trợ email",            free: false,            base: true,             ultra: true },
  { key: "priority",  label: "Hỗ trợ ưu tiên",         free: false,            base: false,            ultra: true },
];

export function PricingPlans({ currentTier }: PricingPlansProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Chọn gói phù hợp</h1>
        <p className="mt-2 text-muted-foreground">
          Bắt đầu miễn phí, nâng cấp khi cần thêm sức mạnh.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TIER_ORDER.map((tier) => {
          const config = PLAN_CONFIG[tier];
          const meta = TIER_META[tier];
          const Icon = meta.icon;
          const isCurrent = currentTier === tier;

          return (
            <Card
              key={tier}
              className={cn(
                "relative flex flex-col transition-shadow",
                meta.highlight
                  ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/30"
                  : "border-border/60",
                isCurrent && "ring-2 ring-green-500/50",
              )}
            >
              {meta.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary px-3 text-xs font-bold text-primary-foreground">
                    {meta.badge}
                  </Badge>
                </div>
              )}

              <CardContent className="flex flex-1 flex-col p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className={cn(
                    "mb-3 grid h-10 w-10 place-items-center rounded-lg",
                    meta.highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{config.label}</h2>
                    {isCurrent && (
                      <Badge variant="outline" className="border-green-500/50 text-green-600 text-[10px]">
                        Gói hiện tại
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{config.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {config.price === 0 ? (
                    <div className="text-3xl font-extrabold">Miễn phí</div>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-extrabold">${config.price}</span>
                      <span className="mb-1 text-sm text-muted-foreground">/tháng</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-6 flex-1 space-y-2.5">
                  {FEATURES.map((f) => {
                    const val = f[tier as keyof typeof f];
                    const enabled = val !== false;
                    return (
                      <li key={f.key} className="flex items-start gap-2 text-sm">
                        {enabled ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                        )}
                        <span className={cn(!enabled && "text-muted-foreground/50")}>
                          {typeof val === "string" ? val : f.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <Button variant="outline" disabled className="w-full">
                    Đang sử dụng
                  </Button>
                ) : tier === "free" ? (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/campaigns">Dùng miễn phí</Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className={cn("w-full", meta.highlight && "bg-primary hover:bg-primary/90")}
                  >
                    <Link href={`mailto:hello@biznoco.com?subject=Nâng cấp gói ${config.label}`}>
                      Nâng cấp lên {config.label}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Liên hệ <a href="mailto:hello@biznoco.com" className="underline hover:text-foreground">hello@biznoco.com</a> để nâng cấp hoặc hỏi thêm về các gói.
      </p>
    </div>
  );
}
