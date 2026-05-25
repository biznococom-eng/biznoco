"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EMPTY_OVERVIEW,
  fetchCreativeAggregates,
  fetchOverview,
} from "@/services/creativeService";
import type {
  CreativeAggregated,
  OverviewMetrics,
} from "@/lib/creative-aggregator";

export interface UseCreativesParams {
  accountId: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  search?: string;
  /** Bỏ qua fetch (vd: trong mock mode) */
  enabled?: boolean;
}

export interface UseCreativesResult {
  aggregated: CreativeAggregated[];
  overview: OverviewMetrics;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCreatives({
  accountId,
  from,
  to,
  search,
  enabled = true,
}: UseCreativesParams): UseCreativesResult {
  const [aggregated, setAggregated] = useState<CreativeAggregated[]>([]);
  const [overview, setOverview] = useState<OverviewMetrics>(EMPTY_OVERVIEW);
  const [isLoading, setLoading] = useState<boolean>(enabled);
  const [isFetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Abort previous request when args change
  const abortRef = useRef<AbortController | null>(null);
  const hasFetchedRef = useRef(false);

  const load = useCallback(async () => {
    if (!enabled || !accountId) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Show full skeleton first time; subsequent fetches just show "refreshing"
    if (!hasFetchedRef.current) setLoading(true);
    setFetching(true);
    setError(null);

    try {
      const [aggregates, overviewMetrics] = await Promise.all([
        fetchCreativeAggregates({ accountId, from, to, search }, controller.signal),
        fetchOverview({ accountId, from, to }, controller.signal),
      ]);

      if (controller.signal.aborted) return;
      setAggregated(aggregates);
      setOverview(overviewMetrics);
      hasFetchedRef.current = true;
    } catch (err) {
      if (controller.signal.aborted) return;
      const e = err instanceof Error ? err : new Error(String(err));
      // Bỏ qua AbortError — user thay đổi filter nhanh
      if (e.name !== "AbortError") setError(e);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setFetching(false);
      }
    }
  }, [accountId, from, to, search, enabled]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { aggregated, overview, isLoading, isFetching, error, refetch: load };
}
