"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* Google icon SVG (official brand mark) */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

interface AuthFormProps {
  mode: "login" | "signup";
}

const MIN_PASSWORD = 8;

export function AuthForm({ mode }: AuthFormProps) {
  const params = useSearchParams();
  const router = useRouter();
  const initialError = params.get("error");
  const next = params.get("next") || "/creatives";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "verify-email" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function signInWithGoogle() {
    if (!isSupabaseConfigured) {
      setStatus("error");
      setErrorMsg("Chưa cấu hình Supabase trong .env.local");
      return;
    }
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      const sb = getSupabase();
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
      // Browser tự redirect sang Google — không cần làm gì thêm
    } catch (err) {
      setGoogleLoading(false);
      setStatus("error");
      const raw = err instanceof Error ? err.message : String(err);
      setErrorMsg(translateError(raw));
    }
  }

  const isLogin = mode === "login";

  function validate(): string | null {
    if (!email.includes("@") || email.length < 5) return "Email không hợp lệ.";
    if (password.length < MIN_PASSWORD)
      return `Mật khẩu phải có ít nhất ${MIN_PASSWORD} ký tự.`;
    if (!isLogin && password !== confirm) return "Mật khẩu xác nhận không khớp.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setStatus("error");
      setErrorMsg(v);
      return;
    }
    if (!isSupabaseConfigured) {
      setStatus("error");
      setErrorMsg(
        "Chưa cấu hình NEXT_PUBLIC_SUPABASE_URL / ANON_KEY trong .env.local",
      );
      return;
    }
    setStatus("loading");
    setErrorMsg(null);

    // Safety timeout — nếu request hang > 20s, reset state để user thử lại
    const timeoutId = window.setTimeout(() => {
      setStatus("error");
      setErrorMsg(
        "Yêu cầu mất quá lâu (>20s). Kiểm tra kết nối mạng hoặc thử lại.",
      );
    }, 20_000);

    try {
      const sb = getSupabase();
      if (isLogin) {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        window.clearTimeout(timeoutId);
        if (error) throw error;
        // Full reload (KHÔNG dùng router.push) để middleware đọc cookie session mới
        // và redirect đúng (vd: /activate nếu chưa activate).
        window.location.assign(next);
      } else {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        window.clearTimeout(timeoutId);
        if (error) throw error;
        if (data.session) {
          window.location.assign(next);
        } else {
          setStatus("verify-email");
        }
      }
    } catch (err) {
      window.clearTimeout(timeoutId);
      setStatus("error");
      const raw = err instanceof Error ? err.message : String(err);
      setErrorMsg(translateError(raw));
    }
  }

  // ── Success state: chờ user xác nhận email ─────────────────────────────
  if (status === "verify-email") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold">Xác nhận email của bạn</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Chúng tôi đã gửi link xác nhận đến{" "}
          <span className="font-medium text-foreground">{email}</span>. Bấm link
          trong email để kích hoạt tài khoản (~5 phút).
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Không thấy email? Kiểm tra thư mục Spam, hoặc{" "}
          <button
            onClick={() => {
              setStatus("idle");
              setPassword("");
              setConfirm("");
            }}
            className="font-medium text-primary hover:underline"
          >
            đăng ký lại
          </button>
          .
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block text-sm font-semibold text-primary hover:underline"
        >
          → Quay về đăng nhập
        </Link>
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
            ? "Nhập email và mật khẩu để vào dashboard."
            : "Tạo tài khoản với email và mật khẩu của bạn."}
        </p>
      </div>

      {/* ── Google OAuth button ── */}
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={googleLoading || status === "loading"}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-border/60 bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent/40 disabled:pointer-events-none disabled:opacity-50"
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="h-4 w-4" />
        )}
        {googleLoading ? "Đang chuyển hướng…" : "Tiếp tục với Google"}
      </button>

      {/* ── Divider ── */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-background px-3 text-muted-foreground/60">hoặc dùng email</span>
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
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

      {/* Password */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Mật khẩu
          </label>
          {isLogin && (
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Quên mật khẩu?
            </Link>
          )}
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPwd ? "text" : "password"}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={MIN_PASSWORD}
            placeholder={isLogin ? "••••••••" : `Ít nhất ${MIN_PASSWORD} ký tự`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={status === "loading"}
            className="pl-9 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            tabIndex={-1}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-accent/40 hover:text-foreground"
            aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {!isLogin && password.length > 0 && (
          <PasswordStrength value={password} />
        )}
      </div>

      {/* Confirm (signup only) */}
      {!isLogin && (
        <div>
          <label
            htmlFor="confirm"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirm"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD}
              placeholder="Nhập lại mật khẩu"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={status === "loading"}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={status === "loading" || !email || !password}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isLogin ? "Đang đăng nhập…" : "Đang tạo tài khoản…"}
          </>
        ) : isLogin ? (
          "Đăng nhập"
        ) : (
          "Tạo tài khoản"
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

      {!isLogin && (
        <p className="text-center text-[11px] text-muted-foreground/80">
          Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Biznoco.
        </p>
      )}
    </form>
  );
}

function PasswordStrength({ value }: { value: string }) {
  const checks = [
    { ok: value.length >= MIN_PASSWORD, label: `${MIN_PASSWORD}+ ký tự` },
    { ok: /[A-Z]/.test(value), label: "Có chữ HOA" },
    { ok: /[a-z]/.test(value), label: "Có chữ thường" },
    { ok: /\d/.test(value), label: "Có chữ số" },
    { ok: /[^A-Za-z0-9]/.test(value), label: "Có ký tự đặc biệt" },
  ];
  const score = checks.filter((c) => c.ok).length;
  const tone =
    score >= 4 ? "bg-success" : score >= 3 ? "bg-warning" : "bg-destructive";
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < score ? tone : "bg-secondary/60"
            }`}
          />
        ))}
      </div>
      <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
        {checks.map((c) => (
          <li
            key={c.label}
            className={c.ok ? "text-success" : "text-muted-foreground/60"}
          >
            {c.ok ? "✓" : "·"} {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function translateError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Email hoặc mật khẩu sai.";
  if (m.includes("email not confirmed"))
    return "Email chưa được xác nhận — kiểm tra hộp thư để click link xác nhận.";
  if (m.includes("user already registered") || m.includes("already exists"))
    return "Email đã được đăng ký. Hãy đăng nhập hoặc đặt lại mật khẩu.";
  if (m.includes("password should be") || m.includes("password is too short"))
    return `Mật khẩu quá yếu — cần ít nhất ${MIN_PASSWORD} ký tự.`;
  if (m.includes("rate limit") || m.includes("too many requests"))
    return "Quá nhiều yêu cầu — vui lòng đợi 60s rồi thử lại.";
  if (m.includes("network") || m.includes("fetch"))
    return "Lỗi mạng — kiểm tra kết nối internet.";
  return raw;
}
