"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const params = useSearchParams();
  const initialError = params.get("error");
  const next = params.get("next") || "/creatives";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);

  const isLogin = mode === "login";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    if (!isSupabaseConfigured) {
      setStatus("error");
      setErrorMsg("Chưa cấu hình NEXT_PUBLIC_SUPABASE_URL / ANON_KEY trong .env.local");
      return;
    }
    setStatus("loading");
    setErrorMsg(null);
    try {
      const sb = getSupabase();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: !isLogin, // signup: tạo mới nếu chưa có; login: chỉ user đã tồn tại
        },
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
          Magic link đã được gửi đến <span className="font-medium text-foreground">{email}</span>.
          Bấm link trong email để đăng nhập (~5 phút).
        </p>
        <button
          onClick={() => {
            setStatus("idle");
            setEmail("");
          }}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Gửi cho email khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLogin
            ? "Nhập email — chúng tôi sẽ gửi magic link để đăng nhập."
            : "Nhập email — magic link tạo tài khoản tự động."}
        </p>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Email
        </label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="ban@biznoco.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
        />
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={status === "loading" || !email}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang gửi…
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            {isLogin ? "Gửi magic link" : "Tạo tài khoản"}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {isLogin ? (
          <>
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Đăng ký
            </Link>
          </>
        ) : (
          <>
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Đăng nhập
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
