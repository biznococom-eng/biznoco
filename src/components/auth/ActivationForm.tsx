"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ActivationForm({ email }: { email?: string | null }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Vui lòng nhập mã code.");
      return;
    }
    if (!isSupabaseConfigured) {
      setStatus("error");
      setMessage("Chưa cấu hình Supabase trong .env.local");
      return;
    }

    setStatus("loading");
    setMessage(null);
    try {
      const sb = getSupabase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (sb.rpc as any)("redeem_activation_code", {
        p_code: trimmed,
      });
      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      const ok = Boolean(row?.success);
      const msg = String(row?.message ?? (ok ? "Kích hoạt thành công." : "Có lỗi xảy ra."));

      if (ok) {
        setStatus("success");
        setMessage(msg);
        // Đợi ngắn để user thấy success, refresh để middleware cho qua
        setTimeout(() => {
          router.push("/creatives");
          router.refresh();
        }, 900);
      } else {
        setStatus("error");
        setMessage(msg);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : String(err));
    }
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold">Mở khóa thành công 🎉</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="mb-1 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-300">
        <Lock className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Tài khoản đang chờ kích hoạt
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Mọi tính năng của Biznoco hiện đang <b>khóa</b>. Nhập mã code do admin
          cung cấp để mở khóa dashboard.
        </p>
        {email && (
          <p className="mt-2 text-xs text-muted-foreground">
            Đang đăng nhập với: <span className="font-medium text-foreground">{email}</span>
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="code"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Mã kích hoạt
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="code"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            autoCapitalize="characters"
            spellCheck={false}
            required
            placeholder="BIZ-2026-XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={status === "loading"}
            className="pl-9 font-mono tracking-wider uppercase"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Code chấp nhận chữ hoa/thường — tự normalize. Mỗi tài khoản chỉ
          kích hoạt được 1 lần.
        </p>
      </div>

      {message && status === "error" && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={status === "loading" || !code.trim()}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang kiểm tra mã…
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" />
            Mở khóa tài khoản
          </>
        )}
      </Button>

      <div className="flex items-center justify-between pt-2 text-xs">
        <span className="text-muted-foreground">
          Chưa có mã?{" "}
          <a
            href="mailto:hello@biznoco.com?subject=Yêu%20cầu%20mã%20kích%20hoạt"
            className="font-medium text-primary hover:underline"
          >
            Liên hệ admin
          </a>
        </span>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3 w-3" /> Đăng xuất
          </button>
        </form>
      </div>
    </form>
  );
}
