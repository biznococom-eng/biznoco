"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * `true` when both env vars are set. UI dùng flag này để chuyển giữa
 * live Supabase mode và offline mock-data mode.
 */
export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

let cached: SupabaseClient<Database> | null = null;

/**
 * Lazy singleton Supabase **browser** client.
 *
 * QUAN TRỌNG: dùng `createBrowserClient` từ `@supabase/ssr` (KHÔNG phải
 * `createClient` từ `@supabase/supabase-js`) để session được lưu vào
 * **cookies**. Nhờ vậy server-side middleware + Server Components đọc được
 * cùng session — middleware mới chuyển hướng đúng sau khi đăng nhập.
 *
 * Nếu dùng `createClient` (mặc định lưu localStorage), browser client thấy
 * user signed-in nhưng middleware đọc cookies thì thấy null → redirect loop
 * → button "Đang đăng nhập…" xoay vô tận.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (cached) return cached;
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase chưa được cấu hình. Hãy thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY vào .env.local rồi restart dev server.",
    );
  }
  cached = createBrowserClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  return cached;
}
