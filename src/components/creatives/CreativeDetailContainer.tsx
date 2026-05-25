"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DateRange } from "react-day-picker";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Play,
  Image as ImageIcon,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { useCreativeDetail } from "@/hooks/useCreativeDetail";
import { CREATIVE_STATS_MOCK } from "@/mock/creative-stats";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fmtCompact,
  fmtCompactVND,
  fmtPct,
} from "@/lib/creative-aggregator";
import type { CreativeMetricsRow } from "@/lib/supabase/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { CreativesErrorState } from "@/components/creatives/CreativesErrorState";
import {
  CreativeTimeSeriesChart,
  type DailyPoint,
} from "@/components/creatives/CreativeTimeSeriesChart";
import { CreativeFunnelChart } from "@/components/creatives/CreativeFunnelChart";

interface Props {
  accountId?: string;
  adId: string;
}

const DEFAULT_FROM = new Date(Date.UTC(2026, 4, 10));
const DEFAULT_TO = new Date(Date.UTC(2026, 4, 23));
const iso = (d: Date) => d.toISOString().slice(0, 10);

export function CreativeDetailContainer({ accountId, adId }: Props) {
  const useMock = !isSupabaseConfigured || !accountId;
  const [range, setRange] = useState<DateRange | undefined>({
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  });
  const from = range?.from ? iso(range.from) : iso(DEFAULT_FROM);
  const to = range?.to ? iso(range.to) : range?.from ? iso(range.from) : iso(DEFAULT_TO);

  const live = useCreativeDetail({
    accountId: accountId ?? "",
    adId,
    from,
    to,
    enabled: !useMock,
  });

  const mockRows = useMemo<CreativeMetricsRow[]>(() => {
    return CREATIVE_STATS_MOCK.filter(
      (r) => r.ad_id === adId && r.date >= from && r.date <= to,
    ).map((r) => ({
      ...r,
      reach: r.reach,
      frequency: r.frequency,
      hook_rate:
        r.impressions > 0 ? (r.video_3s_view / r.impressions) * 100 : 0,
      hold_rate:
        r.video_3s_view > 0
          ? (r.video_p25_view / r.video_3s_view) * 100
          : 0,
      completion_rate:
        r.video_3s_view > 0
          ? (r.video_p100_view / r.video_3s_view) * 100
          : 0,
      ctr_link:
        r.impressions > 0 ? (r.inline_link_clicks / r.impressions) * 100 : 0,
      ctr_all: r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0,
      cpc_link: r.inline_link_clicks > 0 ? r.spend / r.inline_link_clicks : 0,
      cpc_all: r.clicks > 0 ? r.spend / r.clicks : 0,
      cpm: r.impressions > 0 ? (r.spend / r.impressions) * 1000 : 0,
      roas: r.spend > 0 ? r.purchase_value / r.spend : 0,
    }));
  }, [adId, from, to]);

  const daily = useMock ? mockRows : live.daily;
  const isLoading = useMock ? false : live.isLoading;
  const error = useMock ? null : live.error;

  // Aggregate totals across the date range
  const totals = useMemo(() => {
    let spend = 0,
      impressions = 0,
      clicks = 0,
      link_clicks = 0,
      v3 = 0,
      p25 = 0,
      p50 = 0,
      p75 = 0,
      p100 = 0,
      purchases = 0,
      purchase_value = 0;
    for (const r of daily) {
      spend += +(r.spend ?? 0);
      impressions += +(r.impressions ?? 0);
      clicks += +(r.clicks ?? 0);
      link_clicks += +(r.inline_link_clicks ?? 0);
      v3 += +(r.video_3s_view ?? 0);
      p25 += +(r.video_p25_view ?? 0);
      p50 += +(r.video_p50_view ?? 0);
      p75 += +(r.video_p75_view ?? 0);
      p100 += +(r.video_p100_view ?? 0);
      purchases += +(r.purchases ?? 0);
      purchase_value += +(r.purchase_value ?? 0);
    }
    return {
      spend,
      impressions,
      clicks,
      link_clicks,
      v3,
      p25,
      p50,
      p75,
      p100,
      purchases,
      purchase_value,
      hook_rate: impressions > 0 ? (v3 / impressions) * 100 : 0,
      hold_rate: v3 > 0 ? (p25 / v3) * 100 : 0,
      completion_rate: v3 > 0 ? (p100 / v3) * 100 : 0,
      ctr_link: impressions > 0 ? (link_clicks / impressions) * 100 : 0,
      cpc_link: link_clicks > 0 ? spend / link_clicks : 0,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      roas: spend > 0 ? purchase_value / spend : 0,
    };
  }, [daily]);

  const meta = daily[0];
  const isVideo = meta?.creative_type === "video";
  const isCarousel = meta?.creative_type === "carousel";
  const isImage = meta?.creative_type === "image";

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8">
        <BackLink />
        <div className="mt-4">
          <CreativesErrorState error={error} onRetry={live.refetch} isConfigured={isSupabaseConfigured} />
        </div>
      </div>
    );
  }

  if (!isLoading && daily.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8">
        <BackLink />
        <Card className="mt-4">
          <CardContent className="grid place-items-center py-16 text-center">
            <h2 className="text-lg font-semibold">Không có dữ liệu cho creative này</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Ad ID <code className="rounded bg-secondary/60 px-1 text-xs">{adId}</code> không có row nào trong khoảng ngày đã chọn.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeSeries: DailyPoint[] = daily.map((r) => ({
    date: r.date,
    spend: +(r.spend ?? 0),
    impressions: +(r.impressions ?? 0),
    ctr_link: +(r.ctr_link ?? 0),
    hook_rate: +(r.hook_rate ?? 0),
    hold_rate: +(r.hold_rate ?? 0),
    roas: +(r.roas ?? 0),
  }));

  const dateLabel = range?.from
    ? range.to
      ? `${format(range.from, "dd/MM", { locale: vi })} → ${format(range.to, "dd/MM/yyyy", { locale: vi })}`
      : format(range.from, "dd/MM/yyyy", { locale: vi })
    : "Chọn ngày";

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
      <BackLink />

      {/* Header */}
      <header className="mt-4 grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Media */}
        <div className="aspect-square overflow-hidden rounded-xl border border-border/60 bg-black/40">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-none" />
          ) : isVideo && meta?.video_url ? (
            <video
              src={meta.video_url}
              poster={meta.thumbnail_url ?? undefined}
              controls
              playsInline
              className="h-full w-full object-cover"
            />
          ) : meta?.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={meta.thumbnail_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted-foreground">
              <span className="text-xs">No preview</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {meta?.ad_name ?? adId}
                </h1>
                <Badge variant="outline" className="capitalize">
                  {isVideo ? <><Play className="mr-1 h-3 w-3 fill-current" /> Video</> :
                   isCarousel ? <><Layers className="mr-1 h-3 w-3" /> Carousel</> :
                   isImage ? <><ImageIcon className="mr-1 h-3 w-3" /> Image</> :
                   meta?.creative_type ?? "—"}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                <span>Campaign: <span className="text-foreground/90">{meta?.campaign_name ?? "—"}</span></span>
                <span>•</span>
                <span>Adset: <span className="text-foreground/90">{meta?.adset_name ?? "—"}</span></span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Ad ID: <code className="rounded bg-secondary/40 px-1 text-[10px]">{adId}</code>
              </div>
            </>
          )}

          {/* Date picker */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-3.5 w-3.5" /> {dateLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={2}
                  defaultMonth={range?.from}
                  locale={vi}
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground">
              {daily.length} ngày dữ liệu
            </span>
          </div>

          {/* Quick totals */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Quick label="Tổng spend" value={fmtCompactVND(totals.spend)} />
            <Quick label="Impressions" value={fmtCompact(totals.impressions)} />
            <Quick label="CTR" value={fmtPct(totals.ctr_link, 2)} />
            <Quick label="ROAS" value={totals.roas.toFixed(2) + "×"} tone={totals.roas >= 3 ? "ok" : totals.roas >= 1.5 ? "warn" : "bad"} />
          </div>
        </div>
      </header>

      {/* KPI tiles for video */}
      {isVideo && (
        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <KpiTile label="Hook Rate" value={fmtPct(totals.hook_rate, 1)} hint="3s view / Impressions" tone={totals.hook_rate >= 40 ? "ok" : totals.hook_rate >= 25 ? "warn" : "bad"} />
          <KpiTile label="Hold Rate" value={fmtPct(totals.hold_rate, 1)} hint="25% / 3s view" tone={totals.hold_rate >= 70 ? "ok" : totals.hold_rate >= 50 ? "warn" : "bad"} />
          <KpiTile label="Completion" value={fmtPct(totals.completion_rate, 1)} hint="100% / 3s view" tone={totals.completion_rate >= 25 ? "ok" : totals.completion_rate >= 10 ? "warn" : "bad"} />
        </section>
      )}

      {/* Time series */}
      <section className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[260px]" />
            <Skeleton className="h-[260px]" />
          </div>
        ) : (
          <CreativeTimeSeriesChart data={timeSeries} />
        )}
      </section>

      {/* Funnel (chỉ video) */}
      {isVideo && (
        <section className="mt-6">
          {isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <CreativeFunnelChart
              impressions={totals.impressions}
              v3={totals.v3}
              p25={totals.p25}
              p50={totals.p50}
              p75={totals.p75}
              p100={totals.p100}
            />
          )}
        </section>
      )}

      {/* Daily table */}
      <section className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Chi tiết theo ngày</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Ngày</th>
                  <th className="px-4 py-2 text-right">Spend</th>
                  <th className="px-4 py-2 text-right">Impr</th>
                  <th className="px-4 py-2 text-right">Clicks</th>
                  <th className="px-4 py-2 text-right">CTR</th>
                  <th className="px-4 py-2 text-right">Hook</th>
                  <th className="px-4 py-2 text-right">Hold</th>
                  <th className="px-4 py-2 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-border/40">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-2.5">
                          <Skeleton className="h-3 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  daily.map((r) => (
                    <tr key={r.date} className="border-t border-border/40 hover:bg-accent/20">
                      <td className="px-4 py-2 font-medium">{r.date}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{fmtCompactVND(+(r.spend ?? 0))}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{fmtCompact(+(r.impressions ?? 0))}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{fmtCompact(+(r.inline_link_clicks ?? 0))}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{fmtPct(+(r.ctr_link ?? 0), 2)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{isVideo ? fmtPct(+(r.hook_rate ?? 0), 1) : "—"}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{isVideo ? fmtPct(+(r.hold_rate ?? 0), 1) : "—"}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-semibold">{(+(r.roas ?? 0)).toFixed(2)}×</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/creatives"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Quay lại Creative Analytics
    </Link>
  );
}

function Quick({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" | "bad" }) {
  return (
    <div className="rounded-lg border border-border/40 bg-card/40 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`mt-0.5 text-base font-bold tabular-nums ${
          tone === "ok" ? "text-success" : tone === "bad" ? "text-destructive" : tone === "warn" ? "text-warning" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function KpiTile({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: "ok" | "warn" | "bad" }) {
  const ring =
    tone === "ok" ? "ring-success/30 bg-success/5" :
    tone === "warn" ? "ring-warning/30 bg-warning/5" :
    "ring-destructive/30 bg-destructive/5";
  const text =
    tone === "ok" ? "text-success" :
    tone === "warn" ? "text-warning" :
    "text-destructive";
  return (
    <div className={`rounded-xl border border-border/40 px-5 py-4 ring-1 ring-inset ${ring}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 text-3xl font-extrabold tabular-nums ${text}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
