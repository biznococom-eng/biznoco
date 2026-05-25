"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "./CampaignOverviewSection";
import { fmtCompactVND, fmtCompact } from "@/lib/creative-aggregator";
import type { MockOverview } from "@/mock/dilinh-campaign";
import { Eye, Users, MessageSquareDashed, Link2, MessageCircle, Reply } from "lucide-react";

interface Props {
  overview: MockOverview;
}

export function CampaignFunnelSection({ overview }: Props) {
  const stages = [
    {
      icon: Eye,
      label: "Hiển thị",
      value: overview.total_impressions,
      sub: "Tổng lượt hiển thị",
      ratioBase: overview.total_impressions,
      ratioLabel: "100%",
      cost: null as number | null,
    },
    {
      icon: Users,
      label: "Tiếp cận",
      value: overview.total_reach,
      sub: `Reach rate ${((overview.total_reach / overview.total_impressions) * 100).toFixed(1)}%`,
      ratioBase: overview.total_impressions,
      ratioLabel: `${((overview.total_reach / overview.total_impressions) * 100).toFixed(1)}%`,
      cost: null,
    },
    {
      icon: MessageSquareDashed,
      label: "Xem Welcome",
      value: overview.total_welcome_views,
      sub: "Welcome screen view",
      ratioBase: overview.total_impressions,
      ratioLabel: `${((overview.total_welcome_views / overview.total_impressions) * 100).toFixed(1)}% từ impr`,
      cost: overview.total_welcome_views > 0 ? overview.total_spend / overview.total_welcome_views : null,
    },
    {
      icon: Link2,
      label: "Kết nối Mess",
      value: overview.total_connects,
      sub: `${((overview.total_connects / Math.max(overview.total_welcome_views, 1)) * 100).toFixed(1)}% từ welcome`,
      ratioBase: overview.total_welcome_views,
      ratioLabel: `${((overview.total_connects / Math.max(overview.total_welcome_views, 1)) * 100).toFixed(0)}% từ welcome`,
      cost: overview.total_connects > 0 ? overview.total_spend / overview.total_connects : null,
    },
    {
      icon: MessageCircle,
      label: "Hội thoại",
      value: overview.total_conversations,
      sub: "Conversations started",
      ratioBase: overview.total_connects,
      ratioLabel: `${overview.total_conversations === overview.total_connects ? "100" : ((overview.total_conversations / Math.max(overview.total_connects, 1)) * 100).toFixed(0)}% bắt đầu`,
      cost: overview.cost_per_conversation,
    },
    {
      icon: Reply,
      label: "First Reply",
      value: overview.total_first_replies,
      sub: "User trả lời lần đầu",
      ratioBase: overview.total_conversations,
      ratioLabel: `${overview.total_first_replies === overview.total_conversations ? "100" : ((overview.total_first_replies / Math.max(overview.total_conversations, 1)) * 100).toFixed(0)}% phản hồi`,
      cost: overview.total_first_replies > 0 ? overview.total_spend / overview.total_first_replies : null,
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <SectionHeader
          title="PHỄU MESSENGER & KẾT QUẢ CHUYỂN ĐỔI"
          subtitle="Conversion funnel từ Impressions → First Reply"
        />

        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const intensity = idx === 0 ? 1 : 1 - idx * 0.13;
            return (
              <div
                key={stage.label}
                className="rounded-xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-primary/30"
                style={{ background: `hsl(248 84% 60% / ${intensity * 0.05})` }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    #{idx + 1}
                  </span>
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {stage.label}
                </div>
                <div className="mt-1 text-2xl font-extrabold tabular-nums">
                  {fmtCompact(stage.value)}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{stage.sub}</div>
                {stage.cost !== null && (
                  <div className="mt-2 rounded bg-secondary/30 px-2 py-1 text-[10px]">
                    <span className="text-muted-foreground">Chi phí/đơn vị:</span>{" "}
                    <span className="font-bold tabular-nums">{fmtCompactVND(stage.cost)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
