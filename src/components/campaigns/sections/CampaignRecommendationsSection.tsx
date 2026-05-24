"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Eye,
  AlertTriangle,
  AlertOctagon,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "./CampaignOverviewSection";
import {
  generateRecommendations,
  type CardSeverity,
  type RecommendationCard,
} from "@/knowledge/recommendation-rules";
import type { MockCampaignBundle } from "@/mock/dilinh-campaign";
import { cn } from "@/lib/utils";

interface Props {
  bundle: MockCampaignBundle;
}

export function CampaignRecommendationsSection({ bundle }: Props) {
  const cards = useMemo(() => {
    return generateRecommendations({
      overview: {
        spend: bundle.overview.total_spend,
        impressions: bundle.overview.total_impressions,
        reach: bundle.overview.total_reach,
        frequency: bundle.overview.avg_frequency,
        clicks: bundle.overview.total_clicks,
        link_clicks: bundle.overview.total_link_clicks,
        conversations: bundle.overview.total_conversations,
        ctr_link: bundle.overview.ctr_link,
        cpc_link: bundle.overview.cpc_link,
        cpm: bundle.overview.cpm,
        cost_per_conversation: bundle.overview.cost_per_conversation,
      },
      demo: {
        by_gender: bundle.gender.map(mapRow),
        by_age: bundle.age.map(mapRow),
        by_age_gender: bundle.age_gender.map(mapRow),
        by_region: bundle.region.map(mapRow),
        by_device: bundle.device.map(mapRow),
        by_platform: bundle.platform.map(mapRow),
      },
      funnel: {
        impressions: bundle.overview.total_impressions,
        reach: bundle.overview.total_reach,
        welcome_views: bundle.overview.total_welcome_views,
        connects: bundle.overview.total_connects,
        conversations: bundle.overview.total_conversations,
        first_replies: bundle.overview.total_first_replies,
      },
      industry: bundle.campaign.name.toLowerCase().includes("bđs") || bundle.campaign.name.toLowerCase().includes("bds")
        ? "real_estate"
        : undefined,
      objective: bundle.campaign.objective,
    });
  }, [bundle]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
              PHÂN TÍCH & KHUYẾN NGHỊ
            </h2>
            <p className="mt-1 text-base font-semibold">
              {cards.length} insights từ rule engine
            </p>
          </div>
          <Badge variant="default" className="gap-1 bg-primary/15 text-primary">
            <Lightbulb className="h-3 w-3" /> Rule-based
          </Badge>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/40 px-4 py-8 text-center text-sm text-muted-foreground">
            Không có khuyến nghị nào — chiến dịch đang hoạt động trong mức bình thường.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {cards.map((card) => (
              <RecCard key={card.id} card={card} />
            ))}
          </div>
        )}

        <p className="mt-4 text-[11px] text-muted-foreground">
          💡 Khuyến nghị được tạo bằng rule engine kết hợp benchmark theo ngành (real_estate,
          ecommerce, beauty, education, fnb). Cập nhật{" "}
          <code className="rounded bg-secondary/40 px-1">
            src/knowledge/recommendation-rules.ts
          </code>{" "}
          để thêm rule mới.
        </p>
      </CardContent>
    </Card>
  );
}

const SEVERITY_CONFIG: Record<
  CardSeverity,
  {
    Icon: React.ComponentType<{ className?: string }>;
    border: string;
    bg: string;
    text: string;
  }
> = {
  good: {
    Icon: CheckCircle2,
    border: "border-success/40",
    bg: "bg-success/5",
    text: "text-success",
  },
  watch: {
    Icon: Eye,
    border: "border-warning/40",
    bg: "bg-warning/5",
    text: "text-warning",
  },
  action: {
    Icon: AlertTriangle,
    border: "border-primary/40",
    bg: "bg-primary/5",
    text: "text-primary",
  },
  critical: {
    Icon: AlertOctagon,
    border: "border-destructive/40",
    bg: "bg-destructive/5",
    text: "text-destructive",
  },
};

function RecCard({ card }: { card: RecommendationCard }) {
  const cfg = SEVERITY_CONFIG[card.severity];
  return (
    <div className={cn("rounded-xl border p-4", cfg.border, cfg.bg)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge variant="outline" className={cn("gap-1 border-0 bg-transparent text-[10px]", cfg.text)}>
          <cfg.Icon className="h-3 w-3" />
          {card.badge ?? card.severity.toUpperCase()}
        </Badge>
      </div>
      <h3 className={cn("text-sm font-bold tracking-tight", cfg.text)}>{card.title}</h3>
      <p className="mt-1.5 text-xs text-muted-foreground">{card.body}</p>
      {card.actions && card.actions.length > 0 && (
        <ol className="mt-3 space-y-1 border-t border-border/40 pt-2 text-xs">
          {card.actions.map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className={cn(
                  "grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold",
                  cfg.bg,
                  cfg.text,
                )}
              >
                {i + 1}
              </span>
              <span className="text-foreground/80">{a}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function mapRow(r: {
  value: string;
  spend: number;
  impressions: number;
  clicks: number;
  link_clicks: number;
  ctr_link: number;
  cpc_link: number;
  spend_share: number;
}) {
  return {
    value: r.value,
    spend: r.spend,
    impressions: r.impressions,
    clicks: r.clicks,
    link_clicks: r.link_clicks,
    ctr_link: r.ctr_link,
    cpc_link: r.cpc_link,
    spend_share: r.spend_share,
  };
}
