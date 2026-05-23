import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Nếu chưa cấu hình Supabase → không can thiệp request
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

  // QUAN TRỌNG: phải gọi getUser() để Supabase refresh JWT trong cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");
  const isProtectedRoute =
    path.startsWith("/creatives") || path.startsWith("/accounts");

  // Chưa login + truy cập route bảo vệ → chuyển sang /login
  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // Đã login + vẫn truy cập trang auth → đẩy về dashboard
  if (user && isAuthRoute) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/creatives";
    dashUrl.searchParams.delete("next");
    return NextResponse.redirect(dashUrl);
  }

  return response;
}
