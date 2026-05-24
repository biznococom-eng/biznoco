import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // QUAN TRỌNG: phải gọi getUser() để refresh JWT
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password");

  const isActivateRoute = path.startsWith("/activate");
  const isProtectedRoute =
    path.startsWith("/creatives") ||
    path.startsWith("/campaigns") ||
    path.startsWith("/accounts");

  // ── Chưa đăng nhập + truy cập route bảo vệ → /login ─────────────────────
  if (!user && (isProtectedRoute || isActivateRoute)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // ── Đã đăng nhập + đang ở trang auth → đẩy về dashboard (sẽ tự redirect /activate nếu cần) ──
  if (user && isAuthRoute) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/creatives";
    dashUrl.searchParams.delete("next");
    return NextResponse.redirect(dashUrl);
  }

  // ── Activation gate ──────────────────────────────────────────────────────
  // Chỉ check khi cần (protected hoặc activate route) để tiết kiệm query
  if (user && (isProtectedRoute || isActivateRoute)) {
    const { data: profile, error } = await supabase
      .from("users")
      .select("is_activated")
      .eq("id", user.id)
      .maybeSingle();

    // Nếu cột chưa tồn tại trong DB (chưa chạy migration activation.sql)
    // → log warning, không chặn — tránh khoá kẹt
    const columnMissing =
      error?.message?.toLowerCase().includes("column") &&
      error?.message?.toLowerCase().includes("is_activated");

    if (columnMissing) {
      console.warn(
        "[middleware] activation column missing — chạy db/activation.sql để kích hoạt gate",
      );
    } else {
      const isActivated = (profile as { is_activated?: boolean } | null)?.is_activated ?? false;

      // Chưa activate + truy cập dashboard → /activate
      if (!isActivated && isProtectedRoute) {
        const activateUrl = request.nextUrl.clone();
        activateUrl.pathname = "/activate";
        activateUrl.searchParams.delete("next");
        return NextResponse.redirect(activateUrl);
      }
      // Đã activate + vào /activate → /creatives
      if (isActivated && isActivateRoute) {
        const dashUrl = request.nextUrl.clone();
        dashUrl.pathname = "/creatives";
        return NextResponse.redirect(dashUrl);
      }
    }
  }

  return response;
}
