"use client";

import { useAccounts } from "@/hooks/useAccounts";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { CreativeDetailContainer } from "@/components/creatives/CreativeDetailContainer";

interface Props {
  adId: string;
}

/**
 * Thin wrapper auto-pick first ad account của user → truyền xuống detail container.
 * Khi chưa cấu hình Supabase HOẶC user chưa có account → accountId undefined → mock fallback.
 */
export function CreativeDetailWrapper({ adId }: Props) {
  const { accounts } = useAccounts(isSupabaseConfigured);
  const accountId = accounts[0]?.id;
  return <CreativeDetailContainer accountId={accountId} adId={adId} />;
}
