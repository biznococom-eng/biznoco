"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MIN_PASSWORD = 8;

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setStatus("error");
      setErrorMsg(`Mật khẩu phải có ít nhất ${MIN_PASSWORD} ký tự.`);
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setErrorMsg("Mật khẩu xác nhận không khớp.");
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
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw error;
      setStatus("done");
      setTimeout(() => router.push("/creatives"), 1500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  if (status === "done") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold">Đặt lại thành công</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Đang chuyển bạn về dashboard…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Đặt mật khẩu mới</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nhập mật khẩu mới (≥ {MIN_PASSWORD} ký tự).
        </p>
      </div>

      <PasswordField
        id="new-pwd"
        label="Mật khẩu mới"
        value={password}
        onChange={setPassword}
        show={show}
        onToggle={() => setShow((v) => !v)}
        disabled={status === "loading"}
      />
      <PasswordField
        id="confirm-pwd"
        label="Xác nhận mật khẩu"
        value={confirm}
        onChange={setConfirm}
        show={show}
        onToggle={() => setShow((v) => !v)}
        disabled={status === "loading"}
        hideToggle
      />

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang đặt lại…
          </>
        ) : (
          "Đặt mật khẩu mới"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Quay về đăng nhập
        </Link>
      </p>
    </form>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  disabled,
  hideToggle,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  disabled: boolean;
  hideToggle?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pl-9 pr-10"
        />
        {!hideToggle && (
          <button
            type="button"
            onClick={onToggle}
            tabIndex={-1}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-accent/40 hover:text-foreground"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
