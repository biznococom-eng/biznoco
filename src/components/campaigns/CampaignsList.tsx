"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Megaphone,
  ArrowRight,
  Pause,
  CheckCircle2,
  AlertCircle,
  PlugZap,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  MOCK_CAMPAIGNS_LIST,
  MOCK_CAMPAIGNS_OVERVIEW,
  type MockCampaign,
  type MockOverview,
} from "@/mock/dilinh-campaign";
import { useCampaigns } from "@/hooks/useCampaigns";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtCompactVND, fmtCompact, fmtPct } from "@/lib/creative-aggregator";

export function CampaignsList() {
  const { campaigns: liveCampaigns, isLoading } = useCampaigns(isSupabaseConfigured);

  // Khi user có campaigns thật → dùng; nếu trống → fallback mock
  const useMock = liveCampaigns.length === 0;
  const campaigns = useMemo<MockCampaign[]>(() => {
    if (useMock) return MOCK_CAMPAIGNS_LIST;
    return liveCampaigns.map((c) => ({
      id: c.id,
      fb_campaign_id: c.fb_campaign_id,
      name: c.name,
      objective: c.objective ?? "—",
      status: c.status,
      effective_status: c.effective_status ?? c.status,
      daily_budget: c.daily_budget ?? 0,
      start_time: c.start_time ?? new Date().toISOString(),
      stop_time: c.stop_time,
    }));
  }, [liveCampaigns, useMock]);

  const overviews = MOCK_CAMPAIGNS_OVERVIEW; // TODO: fetch from get_campaign_overview RPC per campaign

  const activeCount = campaigns.filter((c) => c.effective_status === "ACTIVE").length;
  const totalSpend = Object.values(overviews).reduce((s, o) => s + o.total_spend, 0);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Chiến dịch Facebook Ads
            </h1>
            {isLoading ? (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Đang tải…
              </Badge>
            ) : useMock ? (
              <Badge variant="default" className="gap-1 bg-primary/15 text-primary">
                <Sparkles className="h-3 w-3" /> Demo data
              </Badge>
            ) : (
              <Badge variant="default" className="gap-1 bg-success/15 text-success">
                <CheckCircle2 className="h-3 w-3" /> Live · {liveCampaigns.length} chiến dịch
              </Badge>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {campaigns.length} chiến dịch · {activeCount} đang chạy · tổng spend{" "}
            <b>{fmtCompactVND(totalSpend)}</b>.{" "}
            {useMock
              ? "Đang xem dữ liệu demo — kết nối Meta API để sync thật."
              : "Click vào 1 chiến dịch để xem báo cáo chi tiết."}
          </p>
        </div>
        <Button asChild>
          <Link href="/accounts">
            <PlugZap className="h-4 w-4" />
            {useMock ? "Kết nối Meta API" : "Quản lý accounts"}
          </Link>
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((c) => (
          <CampaignCard
            key={c.id}
            campaign={c}
            overview={overviews[c.id]}
          />
        ))}
      </div>

      <Card className="mt-6 border-dashed">
        <CardContent className="flex flex-wrap items-start gap-3 p-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
            <PlugZap className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold">Kết nối Facebook Ad Account thật</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Nhập Meta API access token trong trang Ad Accounts để app tự sync chiến dịch
              & insights từ Meta Marketing API. Hiện tại đang hiển thị dữ liệu demo.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/accounts">
              Hướng dẫn lấy token
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignCard({
  campaign,
  overview,
}: {
  campaign: MockCampaign;
  overview?: MockOverview;
}) {
  const statusInfo = statusToInfo(campaign.effective_status);

  return (
    <Link href={`/campaigns/${campaign.id}`} className="group">
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardContent className="space-y-3 p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Megaphone className="h-3 w-3" />
                {campaign.objective ?? "—"}
              </div>
              <h3 className="mt-1 line-clamp-2 text-sm font-bold tracking-tight">
                {campaign.name}
              </h3>
            </div>
            <Badge variant={statusInfo.variant} className="shrink-0 gap-1 text-[10px]">
              <statusInfo.Icon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>

          {/* Stats */}
          {overview && (
            <>
              <div className="grid grid-cols-3 gap-2 rounded-md border border-border/40 bg-secondary/30 p-2">
                <Stat label="Spend" value={fmtCompactVND(overview.total_spend)} />
                <Stat label="Impr." value={fmtCompact(overview.total_impressions)} />
                <Stat label="CTR" value={fmtPct(overview.ctr_link, 2)} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <MiniStat label="Clicks" value={fmtCompact(overview.total_link_clicks)} />
                <MiniStat label="CPC" value={fmtCompactVND(overview.cpc_link)} />
                <MiniStat label="Days" value={String(overview.days_count)} />
              </div>
              {overview.total_conversations > 0 && (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-2 text-xs">
                  <span className="font-semibold text-primary">
                    {overview.total_conversations} hội thoại Messenger
                  </span>{" "}
                  <span className="text-muted-foreground">
                    · {fmtCompactVND(overview.cost_per_conversation)}/hội thoại
                  </span>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs">
            <span className="text-muted-foreground">
              Budget {fmtCompactVND(campaign.daily_budget)}/ngày
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:text-primary">
              Xem báo cáo
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function statusToInfo(status: string) {
  switch (status) {
    case "ACTIVE":
      return { variant: "success" as const, Icon: CheckCircle2, label: "Đang chạy" };
    case "PAUSED":
      return { variant: "warning" as const, Icon: Pause, label: "Tạm dừng" };
    default:
      return { variant: "destructive" as const, Icon: AlertCircle, label: status };
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold tabular-nums">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-muted-foreground">
      <span className="text-[10px]">{label}: </span>
      <span className="font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}
