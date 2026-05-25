import { type NextRequest, NextResponse } from "next/server";

/** Strip UTF-8 BOM (﻿) mà PowerShell thêm khi pipe env var lên Vercel */
const stripBom = (s: string): string =>
  s.charCodeAt(0) === 0xfeff ? s.slice(1).trim() : s.trim();

const APP_URL =
  stripBom(process.env.NEXT_PUBLIC_APP_URL ?? "") || "https://app.biznoco.com";
const GOOGLE_CLIENT_ID = stripBom(process.env.GOOGLE_CLIENT_ID ?? "");

/**
 * GET /api/auth/google/initiate?next=/creatives
 *
 * Redirect user sang Google OAuth với redirect_uri trỏ về app.biznoco.com
 * → Google consent screen hiển thị "app.biznoco.com" thay vì Supabase domain.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/creatives";

  const state = Buffer.from(JSON.stringify({ next, ts: Date.now() })).toString(
    "base64url",
  );

  const redirectUri = `${APP_URL}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
