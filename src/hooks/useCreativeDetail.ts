"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchCreativeDaily } from "@/services/creativeService";
import type { CreativeMetricsRow } from "@/lib/supabase/types";

export interface UseCreativeDetailParams {
  accountId: string;
  adId: string;
  from: string;
  to: string;
  enabled?: boolean;
}

export interface UseCreativeDetailResult {
  daily: CreativeMetricsRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCreativeDetail({
  accountId,
  adId,
  from,
  to,
  enabled = true,
}: UseCreativeDetailParams): UseCreativeDetailResult {
  const [daily, setDaily] = useState<CreativeMetricsRow[]>([]);
  const [isLoading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !accountId || !adId) {
      setLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const rows = (await fetchCreativeDaily(
        { accountId, adId, from, to },
        controller.signal,
      )) as CreativeMetricsRow[];
      if (controller.signal.aborted) return;
      setDaily(rows);
    } catch (err) {
      if (controller.signal.aborted) return;
      const e = err instanceof Error ? err : new Error(String(err));
      if (e.name !== "AbortError") setError(e);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [accountId, adId, from, to, enabled]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { daily, isLoading, error, refetch: load };
}
