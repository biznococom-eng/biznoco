"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listAccounts,
  type AdAccount,
} from "@/services/accountsService";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export interface UseAccountsResult {
  accounts: AdAccount[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAccounts(enabled: boolean = true): UseAccountsResult {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [isLoading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listAccounts();
      setAccounts(list);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { accounts, isLoading, error, refetch: load };
}
