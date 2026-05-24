"use client";

import {
  Wallet,
  Users,
  Eye,
  MousePointerClick,
  Percent,
  Coins,
  BarChart3,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fmtCompactVND, fmtCompact, fmtPct } from "@/lib/creative-aggregator";
import type { MockOverview } from "@/mock/dilinh-campaign";
import { classifyMetric, resolveThreshold } from "@/knowledge/benchmarks";
import { cn } from "@/lib/utils";

interface Props {
  overview: MockOverview;
}

export function CampaignOverviewSection({ overview }: Props) {
  const ctrTier = classifyMetric(overview.ctr_link, resolveThreshold("ctr_link"));
  const cpcTier = classifyMetric(overview.cpc_link, resolveThreshold("cpc_link_vnd"));
  const cpmTier = classifyMetric(overview.cpm, resolveThreshold("cpm_vnd"));
  const freqTier = classifyMetric(overview.avg_frequency, resolveThreshold("frequency"));

  return (
    <Card>
      <CardContent className="p-6">
        <SectionHeader
          title="TỔNG QUAN HIỆU SUẤT"
          subtitle={`${overview.days_count} ngày · ${fmtCompactVND(overview.total_spend)} đã chi`}
        />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <KpiBig
            icon={Wallet}
            label="Chi tiêu"
            value={overview.total_spend.toLocaleString("vi-VN")}
            unit="₫"
            hint={`Ngân sách ${(overview.total_spend / overview.days_count / 1000).toFixed(0)}K/ngày`}
          />
          <KpiBig
            icon={Users}
            label="Tiếp cận"
            value={overview.total_reach.toLocaleString("vi-VN")}
            unit="người"
            hint="Unique users"
          />
          <KpiBig
            icon={Eye}
            label="Hiển thị"
            value={overview.total_impressions.toLocaleString("vi-VN")}
            unit="lần"
            hint={`Tần suất ${overview.avg_frequency.toFixed(2)}×`}
            tier={freqTier}
          />
          <KpiBig
            icon={MousePointerClick}
            label="Lượt click"
            value={overview.total_clicks.toLocaleString("vi-VN")}
            unit="clicks"
            hint={`${overview.total_link_clicks} link clicks`}
          />
          <KpiBig
            icon={Percent}
            label="CTR"
            value={overview.ctr_link.toFixed(2)}
            unit="%"
            hint="Chuẩn ngành ~1%"
            tier={ctrTier}
          />
          <KpiBig
            icon={Coins}
            label="CPC"
            value={overview.cpc_link.toLocaleString("vi-VN")}
            unit="₫"
            hint={cpcTier === "excellent" ? "↓ Tốt hơn chuẩn" : cpcTier === "poor" ? "↑ Cao hơn chuẩn" : "Trong khoảng chuẩn"}
            tier={cpcTier}
          />
          <KpiBig
            icon={BarChart3}
            label="CPM"
            value={overview.cpm.toLocaleString("vi-VN")}
            unit="₫"
            hint="Theo dõi"
            tier={cpmTier}
          />
          <KpiBig
            icon={MessageCircle}
            label="Hội thoại Mess"
            value={overview.total_conversations.toLocaleString("vi-VN")}
            unit="cuộc"
            hint={
              overview.total_conversations > 0
                ? `${overview.cost_per_conversation.toLocaleString("vi-VN")}₫/hội thoại`
                : "Không có hội thoại"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

const TIER_COLORS = {
  excellent: "border-success/40 bg-success/5",
  good: "border-primary/30 bg-primary/5",
  average: "border-warning/30 bg-warning/5",
  poor: "border-destructive/30 bg-destructive/5",
} as const;

const TIER_TEXT = {
  excellent: "text-success",
  good: "text-primary",
  average: "text-warning",
  poor: "text-destructive",
} as const;

function KpiBig({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  tier,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tier?: "excellent" | "good" | "average" | "poor";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card/60 p-4",
        tier ? TIER_COLORS[tier] : "border-border/60",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-secondary/60">
          <Icon className="h-4 w-4 text-foreground/80" />
        </div>
        {tier && (
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider",
              TIER_TEXT[tier],
            )}
          >
            {tier}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold tabular-nums">{value}</span>
          {unit && (
            <span className="text-xs font-medium text-muted-foreground">{unit}</span>
          )}
        </div>
        {hint && (
          <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-base font-semibold text-foreground">{subtitle}</p>
      )}
    </div>
  );
}
