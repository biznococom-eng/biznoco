import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Strip UTF-8 BOM (﻿) mà PowerShell thêm khi pipe env var lên Vercel */
const stripBom = (s: string): string =>
  s.charCodeAt(0) === 0xfeff ? s.slice(1).trim() : s.trim();

const APP_URL =
  stripBom(process.env.NEXT_PUBLIC_APP_URL ?? "") || "https://app.biznoco.com";
const GOOGLE_CLIENT_ID = stripBom(process.env.GOOGLE_CLIENT_ID ?? "");
const GOOGLE_CLIENT_SECRET = stripBom(process.env.GOOGLE_CLIENT_SECRET ?? "");

/**
 * GET /api/auth/google/callback?code=XXX&state=XXX
 *
 * Google redirect về đây sau khi user đồng ý.
 * 1. Exchange authorization code → Google tokens
 * 2. Dùng id_token tạo Supabase session (signInWithIdToken)
 * 3. Redirect về dashboard
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const redirectUri = `${APP_URL}/api/auth/google/callback`;

  // ── Lỗi từ Google ──────────────────────────────────────────────────────────
  if (oauthError || !code) {
    const msg = oauthError ?? "oauth_cancelled";
    return NextResponse.redirect(
      `${APP_URL}/login?error=${encodeURIComponent(msg)}`,
    );
  }

  // ── Decode next URL từ state ────────────────────────────────────────────────
  let next = "/creatives";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
      if (typeof decoded.next === "string") next = decoded.next;
    } catch {
      // state lỗi → dùng default
    }
  }

  // ── 1. Exchange code → tokens ───────────────────────────────────────────────
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("[google/callback] token exchange failed:", err);
    return NextResponse.redirect(
      `${APP_URL}/login?error=${encodeURIComponent("Không thể lấy token từ Google")}`,
    );
  }

  const tokens = (await tokenRes.json()) as {
    id_token?: string;
    access_token?: string;
    error?: string;
  };

  if (tokens.error || !tokens.id_token) {
    console.error("[google/callback] token response error:", tokens.error);
    return NextResponse.redirect(
      `${APP_URL}/login?error=${encodeURIComponent("Google không trả về id_token")}`,
    );
  }

  // ── 2. Tạo Supabase session từ Google id_token ─────────────────────────────
  try {
    const supabase = await getSupabaseServer();
    const { error: signInError } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: tokens.id_token,
      access_token: tokens.access_token,
    });

    if (signInError) {
      console.error("[google/callback] signInWithIdToken error:", signInError);
      return NextResponse.redirect(
        `${APP_URL}/login?error=${encodeURIComponent(signInError.message)}`,
      );
    }
  } catch (err) {
    console.error("[google/callback] unexpected error:", err);
    return NextResponse.redirect(
      `${APP_URL}/login?error=${encodeURIComponent("Lỗi xác thực, thử lại")}`,
    );
  }

  // ── 3. Redirect về dashboard ────────────────────────────────────────────────
  return NextResponse.redirect(`${APP_URL}${next}`);
}
