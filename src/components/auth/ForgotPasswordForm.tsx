"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setErrorMsg("Email không hợp lệ");
      return;
    }
    if (!isSupabaseConfigured) {
      setStatus("error");
      setErrorMsg("Chưa cấu hình Supabase");
      return;
    }
    setStatus("loading");
    setErrorMsg(null);
    try {
      const sb = getSupabase();
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold">Kiểm tra email của bạn</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Link đặt lại mật khẩu đã được gửi đến{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Quay về đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Quay về đăng nhập
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quên mật khẩu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nhập email — chúng tôi sẽ gửi link để đặt lại mật khẩu.
        </p>
      </div>

      <div>
        <label
          htmlFor="fp-email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="fp-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="ban@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="pl-9"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={status === "loading" || !email}>
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang gửi…
          </>
        ) : (
          "Gửi link đặt lại"
        )}
      </Button>
    </form>
  );
}
