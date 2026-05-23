"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * `true` when both env vars are set. UI uses this to decide between
 * live Supabase mode and offline mock-data mode.
 */
export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

let cached: SupabaseClient | null = null;

/**
 * Lazy singleton — throws a clear error if env vars are missing
 * AND code paths that need Supabase try to use it.
 *
 * Note: dùng untyped client; type assertion ở từng service function
 * (xem `src/services/creativeService.ts`). Để generated types: chạy
 * `supabase gen types typescript --project-id <ref>` rồi bật `<Database>` generic.
 */
export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase chưa được cấu hình. Hãy thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY vào .env.local rồi restart dev server.",
    );
  }
  cached = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    db: { schema: "public" },
  });
  return cached;
}
