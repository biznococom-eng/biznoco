"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DateRange } from "react-day-picker";
import { Sparkles, Database, Link2, Wallet2, Loader2 } from "lucide-react";

import { useCreatives } from "@/hooks/useCreatives";
import { useAccounts } from "@/hooks/useAccounts";
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
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_FROM = new Date(Date.UTC(2026, 4, 10));
const DEFAULT_TO = new Date(Date.UTC(2026, 4, 23));
const iso = (d: Date) => d.toISOString().slice(0, 10);

export function CreativesContainer() {
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<DateRange | undefined>({
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  });
  const [sortBy, setSortBy] = useState<SortKey>("spend");

  // Step 1: Load user's accounts (only when Supabase configured)
  const { accounts, isLoading: accountsLoading } = useAccounts(isSupabaseConfigured);
  const activeAccount = accounts[0]; // First account; later support multi-account switcher
  const useMock = !isSupabaseConfigured || (!accountsLoading && !activeAccount);

  const from = range?.from ? iso(range.from) : iso(DEFAULT_FROM);
  const to = range?.to
    ? iso(range.to)
    : range?.from
      ? iso(range.from)
      : iso(DEFAULT_TO);

  // Step 2: Fetch creative stats from live Supabase (when account exists)
  const live = useCreatives({
    accountId: activeAccount?.id ?? "",
    from,
    to,
    search: search.trim() || undefined,
    enabled: Boolean(activeAccount),
  });

  // Mock mode aggregation (client-side from mock array)
  const mock = useMockData({ from, to, search });

  const aggregated = useMock ? mock.aggregated : live.aggregated;
  const overview = useMock ? mock.overview : live.overview;
  const isLoading = useMock ? accountsLoading : live.isLoading;
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

  // ── First-time onboarding: user signed in nhưng chưa add account nào ────
  if (
    isSupabaseConfigured &&
    !accountsLoading &&
    accounts.length === 0
  ) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <Card className="overflow-hidden">
          <div className="border-b border-border/40 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-teal-500/10 p-8 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 shadow-lg shadow-blue-500/40">
              <Wallet2 className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Chào mừng đến Biznoco 👋
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bạn cần kết nối ít nhất 1 Facebook Ad Account để bắt đầu phân tích.
            </p>
          </div>
          <CardContent className="p-6">
            <div className="space-y-3 text-sm">
              <Step
                n={1}
                title="Kết nối Facebook Ad Account"
                desc="Nhập Ad Account ID (vd: 1234567890) và tên tài khoản để hiển thị."
              />
              <Step
                n={2}
                title="Đồng bộ dữ liệu"
                desc="Import dữ liệu demo để xem dashboard hoạt động, hoặc cấu hình sync từ Meta API sau."
              />
              <Step
                n={3}
                title="Phân tích creative"
                desc="Xem Hook Rate, Hold Rate, ROAS cho từng video & hình ảnh quảng cáo."
              />
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href="/accounts">
                  <Link2 className="h-4 w-4" />
                  Kết nối Ad Account
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/creatives?demo=1">
                  <Sparkles className="h-4 w-4" />
                  Xem demo trước
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <Database className="h-3 w-3" /> Live
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
              ? "Đang xem dữ liệu demo từ 12 chiến dịch mẫu. Kết nối Ad Account để phân tích dữ liệu thực."
              : activeAccount
                ? `Đang phân tích: ${activeAccount.account_name} · ${activeAccount.fb_ad_account_id}`
                : "Phân tích hiệu suất video & hình ảnh quảng cáo Facebook Ads."}
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

      {accountsLoading && isSupabaseConfigured ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
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
            ) : sorted.length === 0 && !useMock ? (
              <EmptyDataState accountId={activeAccount?.id} />
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

function EmptyDataState({ accountId }: { accountId?: string }) {
  return (
    <Card className="grid place-items-center px-6 py-16 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-secondary/60">
        <Database className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">Chưa có dữ liệu creative</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Ad Account đã kết nối nhưng chưa có dữ liệu. Bấm "Import demo" tại trang
        Ad Accounts để load 12 chiến dịch mẫu.
      </p>
      <Button asChild className="mt-4">
        <Link href={`/accounts${accountId ? `#${accountId}` : ""}`}>
          <Sparkles className="h-4 w-4" />
          Import dữ liệu demo
        </Link>
      </Button>
    </Card>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-secondary/20 p-3">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
        {n}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

/* ── Mock data (when no account configured) ─────────────────────────────── */
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
