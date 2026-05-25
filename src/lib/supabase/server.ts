import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase client cho Server Components / Route Handlers (Next.js App Router).
 * Tự đọc/ghi cookies session để giữ user signed-in giữa các request.
 */
export async function getSupabaseServer() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase server: thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as CookieOptions),
          );
        } catch {
          // setAll bị từ chối trong Server Component — bỏ qua, middleware sẽ refresh
        }
      },
    },
  });
}

export const isSupabaseConfiguredServer =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

/**
 * Supabase Admin client dùng Service Role Key — bypass RLS.
 * Chỉ dùng trong server-side API routes, không bao giờ expose ra client.
 */
export function getSupabaseAdmin() {
  if (!SUPABASE_URL) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL.");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
