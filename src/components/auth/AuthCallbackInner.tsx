"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type CallbackState =
  | { kind: "loading"; msg: string }
  | { kind: "error"; msg: string }
  | { kind: "success"; msg: string };

/**
 * Xử lý 3 flow Supabase Auth tạo ra:
 *
 * 1. PKCE flow (signInWithOAuth, signInWithOtp via @supabase/ssr)
 *    URL: /auth/callback?code=XXX&next=/path
 *    → exchangeCodeForSession(code)
 *
 * 2. Implicit / hash fragment (REST /auth/v1/recover, magic link cũ)
 *    URL: /auth/callback#access_token=...&refresh_token=...&type=recovery
 *    → setSession({access_token, refresh_token})
 *
 * 3. Token hash flow (verifyOtp)
 *    URL: /auth/callback?token_hash=XXX&type=recovery
 *    → verifyOtp({token_hash, type})
 */
export function AuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<CallbackState>({
    kind: "loading",
    msg: "Đang xác thực…",
  });
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return; // Prevent double-execution in StrictMode
    ranRef.current = true;

    (async () => {
      if (!isSupabaseConfigured) {
        setState({ kind: "error", msg: "Chưa cấu hình Supabase trong .env.local" });
        return;
      }
      const sb = getSupabase();
      const next = params.get("next") || "/creatives";

      // ── 1. PKCE flow: ?code=... ────────────────────────────────────────
      const code = params.get("code");
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (error) {
          setState({ kind: "error", msg: `PKCE: ${error.message}` });
          return;
        }
        setState({ kind: "success", msg: "Đăng nhập thành công, đang chuyển hướng…" });
        router.push(next);
        router.refresh();
        return;
      }

      // ── 2. Implicit flow: #access_token=...&refresh_token=...&type=... ──
      const hash = window.location.hash || "";
      if (hash.includes("access_token")) {
        const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");
        const type = hashParams.get("type"); // recovery | signup | magiclink | invite
        const hashError =
          hashParams.get("error_description") || hashParams.get("error");

        if (hashError) {
          setState({ kind: "error", msg: decodeURIComponent(hashError) });
          return;
        }

        if (access_token && refresh_token) {
          const { error } = await sb.auth.setSession({ access_token, refresh_token });
          if (error) {
            setState({ kind: "error", msg: `setSession: ${error.message}` });
            return;
          }
          if (type === "recovery") {
            setState({
              kind: "success",
              msg: "Xác thực thành công, đang chuyển hướng đến trang đặt mật khẩu mới…",
            });
            router.push("/reset-password");
            router.refresh();
            return;
          }
          setState({ kind: "success", msg: "Đăng nhập thành công, đang chuyển hướng…" });
          router.push(next);
          router.refresh();
          return;
        }
      }

      // ── 3. Token hash flow: ?token_hash=...&type=... ──────────────────
      const tokenHash = params.get("token_hash");
      const tokenType = params.get("type");
      if (tokenHash && tokenType) {
        const { error } = await sb.auth.verifyOtp({
          token_hash: tokenHash,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: tokenType as any,
        });
        if (error) {
          setState({ kind: "error", msg: `verifyOtp: ${error.message}` });
          return;
        }
        if (tokenType === "recovery") {
          router.push("/reset-password");
          router.refresh();
          return;
        }
        router.push(next);
        router.refresh();
        return;
      }

      // ── Không có flow nào match ────────────────────────────────────────
      const queryError =
        params.get("error_description") || params.get("error");
      setState({
        kind: "error",
        msg: queryError
          ? decodeURIComponent(queryError)
          : "Link không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.",
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card/80 p-8 text-center backdrop-blur-sm">
        {state.kind === "loading" && (
          <>
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{state.msg}</p>
          </>
        )}
        {state.kind === "success" && (
          <>
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">{state.msg}</p>
          </>
        )}
        {state.kind === "error" && (
          <>
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-destructive/15 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold">Xác thực thất bại</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{state.msg}</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild>
                <a href="/login">Quay về đăng nhập</a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href="/forgot-password">Gửi link reset password mới</a>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
