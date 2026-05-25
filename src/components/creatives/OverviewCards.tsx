"use client";

import {
  TrendingUp,
  Eye,
  Target,
  Wallet,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fmtCompact,
  fmtCompactVND,
  fmtPct,
  type OverviewMetrics,
} from "@/lib/creative-aggregator";
import { cn } from "@/lib/utils";

interface OverviewCardsProps {
  metrics: OverviewMetrics;
}

export function OverviewCards({ metrics }: OverviewCardsProps) {
  const items: Array<{
    label: string;
    value: string;
    sub?: string;
    icon: LucideIcon;
    accent: string;
    badge?: { label: string; tone: "success" | "warning" | "destructive" | "default" };
  }> = [
    {
      label: "Tổng chi tiêu",
      value: fmtCompactVND(metrics.total_spend),
      sub: `${fmtCompact(metrics.total_impressions)} impressions`,
      icon: Wallet,
      accent: "from-blue-500/30 to-cyan-500/20",
    },
    {
      label: "Hook Rate (TB)",
      value: fmtPct(metrics.avg_hook_rate),
      sub: "3s view / impressions",
      icon: Eye,
      accent: "from-blue-500/30 to-cyan-500/20",
      badge: {
        label:
          metrics.avg_hook_rate >= 40
            ? "Tốt"
            : metrics.avg_hook_rate >= 25
              ? "Trung bình"
              : "Cần cải thiện",
        tone:
          metrics.avg_hook_rate >= 40
            ? "success"
            : metrics.avg_hook_rate >= 25
              ? "warning"
              : "destructive",
      },
    },
    {
      label: "Hold Rate (TB)",
      value: fmtPct(metrics.avg_hold_rate),
      sub: "25% view / 3s view",
      icon: Target,
      accent: "from-emerald-500/30 to-teal-500/20",
      badge: {
        label:
          metrics.avg_hold_rate >= 70
            ? "Giữ chân tốt"
            : metrics.avg_hold_rate >= 50
              ? "Khá"
              : "Khán giả rớt",
        tone:
          metrics.avg_hold_rate >= 70
            ? "success"
            : metrics.avg_hold_rate >= 50
              ? "warning"
              : "destructive",
      },
    },
    {
      label: "CTR (link)",
      value: fmtPct(metrics.avg_ctr_link, 2),
      sub: `${fmtCompact(metrics.total_link_clicks)} link clicks`,
      icon: MousePointerClick,
      accent: "from-amber-500/30 to-orange-500/20",
    },
    {
      label: "ROAS (blended)",
      value: metrics.blended_roas.toFixed(2) + "×",
      sub: `${fmtCompactVND(metrics.total_purchase_value)} doanh thu`,
      icon: TrendingUp,
      accent: "from-teal-500/30 to-cyan-500/20",
      badge: {
        label:
          metrics.blended_roas >= 3
            ? "Có lãi"
            : metrics.blended_roas >= 1
              ? "Hoà vốn"
              : "Lỗ",
        tone:
          metrics.blended_roas >= 3
            ? "success"
            : metrics.blended_roas >= 1
              ? "warning"
              : "destructive",
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {items.map((it) => (
        <Card key={it.label} className="relative overflow-hidden">
          <div
            className={cn(
              "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl opacity-70",
              it.accent,
            )}
          />
          <CardContent className="relative p-4">
            <div className="flex items-start justify-between">
              <div className="rounded-md bg-secondary/60 p-1.5">
                <it.icon className="h-4 w-4 text-foreground/80" />
              </div>
              {it.badge && (
                <Badge variant={it.badge.tone} className="text-[10px]">
                  {it.badge.label}
                </Badge>
              )}
            </div>
            <div className="mt-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {it.label}
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
                {it.value}
              </div>
              {it.sub && (
                <div className="mt-1 text-xs text-muted-foreground">{it.sub}</div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
