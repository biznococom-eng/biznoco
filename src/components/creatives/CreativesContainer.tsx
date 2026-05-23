"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DateRange } from "react-day-picker";
import { Sparkles, Database, Link2 } from "lucide-react";

import { useCreatives } from "@/hooks/useCreatives";
import {
  aggregateByAd,
  computeOverview,
  sortAggregated,
  type SortKey,
} from "@/lib/creative-aggregator";
import { CREATIVE_STATS_MOCK } from "@/mock/creative-stats";
import { isSupabaseConfigured } from "@/lib/supabase/client";

import { CreativeFilters } from "@/components/creatives/CreativeFilters";
import { OverviewCards } from "@/components/creatives/OverviewCards";
import { CreativeGrid } from "@/components/creatives/CreativeGrid";
import {
  OverviewSkeleton,
  GridSkeleton,
} from "@/components/creatives/CreativesSkeleton";
import { CreativesErrorState } from "@/components/creatives/CreativesErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CreativesContainerProps {
  accountId?: string;
  /** Ép buộc chế độ mock (mặc định: tự bật nếu chưa cấu hình Supabase) */
  forceMock?: boolean;
}

const DEFAULT_FROM = new Date(Date.UTC(2026, 4, 17));
const DEFAULT_TO = new Date(Date.UTC(2026, 4, 23));
const iso = (d: Date) => d.toISOString().slice(0, 10);

export function CreativesContainer({
  accountId,
  forceMock = false,
}: CreativesContainerProps) {
  const useMock = forceMock || !isSupabaseConfigured || !accountId;

  const [search, setSearch] = useState("");
  const [range, setRange] = useState<DateRange | undefined>({
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  });
  const [sortBy, setSortBy] = useState<SortKey>("spend");

  const from = range?.from ? iso(range.from) : iso(DEFAULT_FROM);
  const to = range?.to
    ? iso(range.to)
    : range?.from
      ? iso(range.from)
      : iso(DEFAULT_TO);

  // Live mode: gọi Supabase qua hook (filter date+search ở DB level)
  const live = useCreatives({
    accountId: accountId ?? "",
    from,
    to,
    search: search.trim() || undefined,
    enabled: !useMock,
  });

  // Mock mode: aggregate tại client từ mảng mock
  const mock = useMockData({ from, to, search });

  const aggregated = useMock ? mock.aggregated : live.aggregated;
  const overview = useMock ? mock.overview : live.overview;
  const isLoading = useMock ? false : live.isLoading;
  const isFetching = useMock ? false : live.isFetching;
  const error = useMock ? null : live.error;

  const sorted = useMemo(
    () => sortAggregated(aggregated, sortBy),
    [aggregated, sortBy],
  );

  const reset = () => {
    setSearch("");
    setRange({ from: DEFAULT_FROM, to: DEFAULT_TO });
    setSortBy("spend");
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Creative Analytics
            </h1>
            {useMock ? (
              <Badge variant="default" className="gap-1 bg-primary/15 text-primary">
                <Sparkles className="h-3 w-3" /> Dữ liệu demo
              </Badge>
            ) : (
              <Badge variant="default" className="gap-1 bg-success/15 text-success">
                <Database className="h-3 w-3" /> Đang kết nối
              </Badge>
            )}
            {isFetching && !isLoading && (
              <Badge variant="secondary" className="animate-pulse text-xs">
                Đang cập nhật…
              </Badge>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {useMock
              ? "Đang xem dữ liệu demo từ 12 chiến dịch mẫu. Kết nối Facebook Ad Account để phân tích dữ liệu thực của bạn."
              : "Phân tích hiệu suất video & hình ảnh quảng cáo Facebook Ads theo thời gian thực."}
          </p>
        </div>
        {useMock && (
          <Button asChild>
            <Link href="/accounts">
              <Link2 className="h-4 w-4" />
              Kết nối Ad Account
            </Link>
          </Button>
        )}
      </header>

      {error ? (
        <CreativesErrorState
          error={error}
          onRetry={live.refetch}
          isConfigured={isSupabaseConfigured}
        />
      ) : (
        <>
          <section className="mb-6">
            {isLoading ? <OverviewSkeleton /> : <OverviewCards metrics={overview} />}
          </section>

          <section className="mb-5">
            <CreativeFilters
              search={search}
              onSearchChange={setSearch}
              range={range}
              onRangeChange={setRange}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onReset={reset}
              resultCount={sorted.length}
            />
          </section>

          <section>
            {isLoading ? (
              <GridSkeleton count={6} />
            ) : (
              <CreativeGrid
                data={sorted}
                sortBy={sortBy}
                totalSpend={overview.total_spend}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}

/* ── Client-side aggregation cho mock mode ──────────────────────────────── */
function useMockData({
  from,
  to,
  search,
}: {
  from: string;
  to: string;
  search: string;
}) {
  return useMemo(() => {
    const rows = CREATIVE_STATS_MOCK.filter(
      (r) => r.date >= from && r.date <= to,
    );
    let aggregated = aggregateByAd(rows);
    const q = search.trim().toLowerCase();
    if (q) {
      aggregated = aggregated.filter(
        (a) =>
          a.ad_name.toLowerCase().includes(q) ||
          (a.campaign_name ?? "").toLowerCase().includes(q) ||
          (a.adset_name ?? "").toLowerCase().includes(q),
      );
    }
    return { aggregated, overview: computeOverview(rows) };
  }, [from, to, search]);
}
