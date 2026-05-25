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

  if (!user && (isProtectedRoute || isActivateRoute)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/creatives";
    dashUrl.searchParams.delete("next");
    return NextResponse.redirect(dashUrl);
  }

  if (user && (isProtectedRoute || isActivateRoute)) {
    const { data: profile, error } = await supabase
      .from("users")
      .select("is_activated")
      .eq("id", user.id)
      .maybeSingle();

    const columnMissing =
      error?.message?.toLowerCase().includes("column") &&
      error?.message?.toLowerCase().includes("is_activated");

    if (columnMissing) {
      console.warn("[middleware] activation column missing");
    } else {
      const isActivated = (profile as { is_activated?: boolean } | null)?.is_activated ?? false;
      if (!isActivated && isProtectedRoute) {
        const activateUrl = request.nextUrl.clone();
        activateUrl.pathname = "/activate";
        activateUrl.searchParams.delete("next");
        return NextResponse.redirect(activateUrl);
      }
      if (isActivated && isActivateRoute) {
        const dashUrl = request.nextUrl.clone();
        dashUrl.pathname = "/creatives";
        return NextResponse.redirect(dashUrl);
      }
    }
  }

  return response;
}
