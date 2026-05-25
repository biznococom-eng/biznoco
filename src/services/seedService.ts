"use client";

import { getSupabase } from "@/lib/supabase/client";
import { CREATIVE_STATS_MOCK } from "@/mock/creative-stats";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = (sb: ReturnType<typeof getSupabase>) => sb as any;

export interface SeedResult {
  inserted: number;
  message: string;
}

/**
 * Seed 12 ads × 14 ngày = 168 rows mock data vào creative_stats
 * cho account chỉ định. Upsert nên có thể chạy lại an toàn.
 */
export async function seedDemoData(accountId: string): Promise<SeedResult> {
  const sb = getSupabase();

  // Map mock data sang account thực — thay account_id và bỏ id (DB tự tạo)
  const rows = CREATIVE_STATS_MOCK.map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = r;
    return { ...rest, account_id: accountId };
  });

  // Upsert theo composite unique (account_id, ad_id, date)
  // Chia batch 50 để tránh payload quá lớn / timeout
  const BATCH = 50;
  let inserted = 0;
  const u = untyped(sb);
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error, count } = await u
      .from("creative_stats")
      .upsert(chunk, { onConflict: "account_id,ad_id,date", count: "exact" });
    if (error) {
      throw new Error(`seedDemoData batch ${i}: ${error.message}`);
    }
    inserted += count ?? chunk.length;
  }

  // Cập nhật last_synced_at cho account
  await u
    .from("accounts")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", accountId);

  return {
    inserted,
    message: `Đã import ${inserted} dòng dữ liệu demo (12 creative × 14 ngày).`,
  };
}

/** Xoá toàn bộ creative_stats của account — dùng để reset trước khi seed lại sạch */
export async function clearAccountData(accountId: string): Promise<number> {
  const sb = getSupabase();
  const { error, count } = await sb
    .from("creative_stats")
    .delete({ count: "exact" })
    .eq("account_id", accountId);
  if (error) throw new Error(`clearAccountData: ${error.message}`);
  return count ?? 0;
}
