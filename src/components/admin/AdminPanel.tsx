"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Webhook,
  Bot,
  Mail,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Info,
  ChevronRight,
  Send,
  BarChart3,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";
type TestStatus = "idle" | "testing" | "ok" | "fail";

interface BankAccount {
  id: number;
  bank_account_id: string;
  bank_account_name: string;
  bank_name: string;
  bank_short_name: string;
  bank_code: string;
  status: number;
}

interface SystemSettings {
  sepay_api_token: string;
  sepay_webhook_secret: string;
  sepay_account_number: string;
  sepay_account_name: string;
  sepay_bank_name: string;
  openai_api_key: string;
  openai_model: string;
  openai_system_prompt: string;
  resend_api_key: string;
  email_from_name: string;
  email_from_address: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
  sepay_api_token: "",
  sepay_webhook_secret: "",
  sepay_account_number: "",
  sepay_account_name: "",
  sepay_bank_name: "",
  openai_api_key: "",
  openai_model: "gpt-4o",
  openai_system_prompt:
    "Bạn là chuyên gia phân tích quảng cáo Facebook Ads cho doanh nghiệp Việt Nam. Nhiệm vụ: phân tích số liệu Hook Rate, Hold Rate, CTR, ROAS và đưa ra lời khuyên tối ưu chiến dịch ngắn gọn, thực tế. Trả lời bằng tiếng Việt, súc tích, có thể dùng emoji.",
  resend_api_key: "",
  email_from_name: "Biznoco",
  email_from_address: "noreply@biznoco.com",
};

const OPENAI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o (Khuyến nghị)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Tiết kiệm)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Nhanh nhất)" },
];

const WEBHOOK_BASE_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/webhook/sepay`
    : "https://app.biznoco.com/api/webhook/sepay";

// ─── Helpers — lưu settings vào auth user_metadata (không cần DB migration) ──

async function loadSettings(): Promise<Partial<SystemSettings>> {
  if (!isSupabaseConfigured) return {};
  const sb = getSupabase();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return {};
  const meta = data.user.user_metadata ?? {};
  return {
    sepay_api_token: (meta.sepay_api_token as string) ?? "",
    sepay_webhook_secret: (meta.sepay_webhook_secret as string) ?? "",
    sepay_account_number: (meta.sepay_account_number as string) ?? "",
    sepay_account_name: (meta.sepay_account_name as string) ?? "",
    sepay_bank_name: (meta.sepay_bank_name as string) ?? "",
    openai_api_key: (meta.openai_api_key as string) ?? "",
    openai_model: (meta.openai_model as string) ?? "",
    openai_system_prompt: (meta.openai_system_prompt as string) ?? "",
    resend_api_key: (meta.resend_api_key as string) ?? "",
    email_from_name: (meta.email_from_name as string) ?? "",
    email_from_address: (meta.email_from_address as string) ?? "",
  };
}

async function saveSettings(
  patch: Partial<SystemSettings>
): Promise<{ ok: boolean; message?: string }> {
  if (!isSupabaseConfigured) {
    await new Promise((r) => setTimeout(r, 800));
    return { ok: true };
  }
  const sb = getSupabase();
  const { error } = await sb.auth.updateUser({ data: patch });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-foreground"
    >
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}

function SecretInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-10 font-mono text-sm"
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SaveButton({
  status,
  onClick,
  disabled,
}: {
  status: SaveStatus;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || status === "saving"}
      size="sm"
      className="min-w-[130px]"
    >
      {status === "saving" ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang lưu…
        </>
      ) : status === "saved" ? (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4 text-green-400" />
          Đã lưu!
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Lưu cài đặt
        </>
      )}
    </Button>
  );
}

function StatusBanner({
  status,
  message,
}: {
  status: SaveStatus;
  message?: string;
}) {
  if (status === "idle" || status === "saving") return null;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
        status === "saved"
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      )}
    >
      {status === "saved" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      {status === "saved" ? "Lưu thành công!" : (message ?? "Có lỗi xảy ra.")}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 gap-1.5 text-xs"
    >
      {copied ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Đã copy!" : "Copy"}
    </Button>
  );
}

// ─── Section: Gửi mã kích hoạt ───────────────────────────────────────────────

function ActivationSection() {
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "fail">("idle");
  const [result, setResult] = useState<{ code?: string; error?: string }>({});

  const handleSend = useCallback(async () => {
    if (!email.trim()) return;
    setStatus("sending");
    setResult({});
    try {
      const res = await fetch("/api/admin/send-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), notes: notes.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("ok");
        setResult({ code: data.code });
        setEmail("");
        setNotes("");
      } else {
        setStatus("fail");
        setResult({ code: data.code, error: data.error ?? "Gửi thất bại" });
      }
    } catch {
      setStatus("fail");
      setResult({ error: "Lỗi kết nối mạng" });
    }
    setTimeout(() => setStatus("idle"), 6000);
  }, [email, notes]);

  return (
    <section className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
      <div className="flex items-start gap-4 p-6">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">Gửi mã kích hoạt</h2>
            <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
              Admin only
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Tạo code mới và gửi email kích hoạt đến user. Mỗi code dùng được 1 lần.
          </p>
        </div>
      </div>

      <Separator className="bg-border/40" />

      <div className="space-y-5 p-6">
        <div>
          <FieldLabel htmlFor="activation-email" required>
            Email người nhận
          </FieldLabel>
          <Input
            id="activation-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            disabled={status === "sending"}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
        </div>

        <div>
          <FieldLabel htmlFor="activation-notes">Ghi chú (tuỳ chọn)</FieldLabel>
          <Input
            id="activation-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="VD: early-access, khách hàng XYZ"
            disabled={status === "sending"}
          />
        </div>

        {/* Result banner */}
        {status === "ok" && result.code && (
          <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
            <div>
              <div className="text-sm font-semibold text-green-400">
                Đã gửi thành công!
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                Code:{" "}
                <code className="rounded bg-muted/50 px-2 py-0.5 font-mono font-bold text-foreground">
                  {result.code}
                </code>
                <CopyButton text={result.code} />
              </div>
            </div>
          </div>
        )}

        {status === "fail" && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <div className="text-sm font-semibold text-destructive">
                {result.error ?? "Gửi thất bại"}
              </div>
              {result.code && (
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  Code đã tạo (gửi thủ công):{" "}
                  <code className="rounded bg-muted/50 px-2 py-0.5 font-mono font-bold text-foreground">
                    {result.code}
                  </code>
                  <CopyButton text={result.code} />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border/40 bg-muted/10 p-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Lưu ý
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              Email SMTP (Resend) phải được cấu hình bên dưới trước
            </li>
            <li className="flex gap-2">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              Code có định dạng <code className="font-mono">BIZ-YYYY-XXXXXX</code>, dùng 1 lần
            </li>
            <li className="flex gap-2">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              User nhập code tại{" "}
              <a
                href="https://app.biznoco.com/activate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                app.biznoco.com/activate
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          </ul>
        </div>

        <Button
          onClick={handleSend}
          disabled={!email.trim() || status === "sending"}
          className="gap-2"
        >
          {status === "sending" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {status === "sending" ? "Đang gửi…" : "Tạo code & gửi email"}
        </Button>
      </div>
    </section>
  );
}

// ─── Section: Email Stats ────────────────────────────────────────────────────

const RESEND_FREE_DAILY_LIMIT = 100;
const RESEND_FREE_MONTHLY_LIMIT = 3000;

const STATUS_META: Record<string, { label: string; color: string }> = {
  delivered:  { label: "Đã giao",    color: "text-green-400" },
  sent:       { label: "Đã gửi",     color: "text-blue-400" },
  opened:     { label: "Đã mở",      color: "text-emerald-400" },
  clicked:    { label: "Đã click",   color: "text-sky-400" },
  bounced:    { label: "Bị trả lại", color: "text-red-400" },
  complained: { label: "Báo spam",   color: "text-orange-400" },
  failed:     { label: "Thất bại",   color: "text-destructive" },
};

interface EmailStatsData {
  total: number;
  today: number;
  week: number;
  month: number;
  byStatus: Record<string, number>;
  recentEmails: {
    id: string;
    to: string;
    subject: string;
    status: string;
    createdAt: string;
  }[];
}

function UsageBar({
  used,
  limit,
  label,
}: {
  used: number;
  limit: number;
  label: string;
}) {
  const pct = Math.min((used / limit) * 100, 100);
  const barColor =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
  const textColor =
    pct >= 90
      ? "text-red-400 font-semibold"
      : pct >= 70
      ? "text-amber-400 font-semibold"
      : "text-foreground";
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={textColor}>
          {used} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EmailStatsSection({ hasApiKey }: { hasApiKey: boolean }) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<EmailStatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/email-stats");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Không lấy được thống kê");
      } else {
        setStats(json.stats);
      }
    } catch {
      setError("Lỗi kết nối mạng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasApiKey) fetchStats();
  }, [hasApiKey, fetchStats]);

  const sortedStatuses = stats
    ? Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <section className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
      <div className="flex items-start gap-4 p-6">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <BarChart3 className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">Thống kê Email đã gửi</h2>
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-400 text-[10px]"
            >
              Resend Usage
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Theo dõi lượng email đã gửi để biết khi nào cần nâng cấp gói Resend.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchStats}
          disabled={loading || !hasApiKey}
          className="shrink-0 gap-1.5"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Làm mới
        </Button>
      </div>

      <Separator className="bg-border/40" />

      <div className="space-y-5 p-6">
        {!hasApiKey && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Nhập Resend API Key ở mục{" "}
            <strong className="mx-1">Email / SMTP</strong> bên trên để xem
            thống kê.
          </div>
        )}

        {hasApiKey && error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải thống kê từ Resend…
          </div>
        )}

        {stats && !loading && (
          <>
            {/* Progress bars */}
            <div className="space-y-3">
              <div className="text-sm font-medium">Hạn mức sử dụng</div>
              <UsageBar
                used={stats.today}
                limit={RESEND_FREE_DAILY_LIMIT}
                label="Hôm nay (giới hạn free: 100/ngày)"
              />
              <UsageBar
                used={stats.month}
                limit={RESEND_FREE_MONTHLY_LIMIT}
                label="Tháng này (giới hạn free: 3.000/tháng)"
              />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { label: "Hôm nay",    value: stats.today },
                  { label: "7 ngày qua", value: stats.week },
                  { label: "Tháng này",  value: stats.month },
                ] as const
              ).map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center"
                >
                  <div className="text-xl font-bold">{value}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Status breakdown */}
            {sortedStatuses.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-medium">Tình trạng gửi</div>
                <div className="overflow-hidden rounded-lg border border-border/50">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/20">
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          Trạng thái
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          Số email
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          Tỷ lệ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedStatuses.map(([status, count]) => {
                        const meta = STATUS_META[status] ?? {
                          label: status,
                          color: "text-muted-foreground",
                        };
                        const pct =
                          stats.total > 0
                            ? ((count / stats.total) * 100).toFixed(0)
                            : "0";
                        return (
                          <tr
                            key={status}
                            className="border-b border-border/30 last:border-0"
                          >
                            <td className="px-3 py-2">
                              <span className={cn("font-medium", meta.color)}>
                                {meta.label}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono">
                              {count}
                            </td>
                            <td className="px-3 py-2 text-right text-muted-foreground">
                              {pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent emails */}
            {stats.recentEmails.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-medium">Gửi gần đây</div>
                <div className="overflow-hidden rounded-lg border border-border/50">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/20">
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          Người nhận
                        </th>
                        <th className="hidden px-3 py-2 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                          Tiêu đề
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          Trạng thái
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          Thời gian
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentEmails.map((email) => {
                        const meta = STATUS_META[email.status] ?? {
                          label: email.status,
                          color: "text-muted-foreground",
                        };
                        return (
                          <tr
                            key={email.id}
                            className="border-b border-border/30 last:border-0 hover:bg-muted/10"
                          >
                            <td className="max-w-[120px] truncate px-3 py-2 font-mono text-xs">
                              {email.to}
                            </td>
                            <td className="hidden max-w-[180px] truncate px-3 py-2 text-xs text-muted-foreground sm:table-cell">
                              {email.subject}
                            </td>
                            <td
                              className={cn(
                                "px-3 py-2 text-right text-xs font-medium",
                                meta.color
                              )}
                            >
                              {meta.label}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-right text-xs text-muted-foreground">
                              {new Date(email.createdAt).toLocaleDateString(
                                "vi-VN",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {stats.total >= 100 && (
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3 w-3 shrink-0" />
                    Hiển thị 10 email gần nhất trong 100 bản ghi được tải. Xem
                    đầy đủ tại{" "}
                    <a
                      href="https://resend.com/emails"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline"
                    >
                      Resend Dashboard
                    </a>
                    .
                  </p>
                )}
              </div>
            )}

            {/* Upgrade note */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Info className="h-3.5 w-3.5" />
                Gói Resend hiện tại (Free)
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Giới hạn ngày:</span>
                  <span className="text-foreground">100 email/ngày</span>
                </div>
                <div className="flex justify-between">
                  <span>Giới hạn tháng:</span>
                  <span className="text-foreground">3.000 email/tháng</span>
                </div>
              </div>
              <a
                href="https://resend.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
              >
                Xem các gói nâng cấp →
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─── Section: Sepay ──────────────────────────────────────────────────────────

type FetchStatus = "idle" | "fetching" | "ok" | "fail";

function SepaySection({
  initial,
  loading,
}: {
  initial: Partial<SystemSettings>;
  loading: boolean;
}) {
  const [apiToken, setApiToken] = useState(initial.sepay_api_token ?? "");
  const [secret, setSecret] = useState(initial.sepay_webhook_secret ?? "");
  const [selectedAccount, setSelectedAccount] = useState(
    initial.sepay_account_number ?? ""
  );
  const [selectedName, setSelectedName] = useState(
    initial.sepay_account_name ?? ""
  );
  const [selectedBank, setSelectedBank] = useState(
    initial.sepay_bank_name ?? ""
  );

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [fetchError, setFetchError] = useState<string>();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string>();

  // Sync khi data load xong
  useEffect(() => {
    setApiToken(initial.sepay_api_token ?? "");
    setSecret(initial.sepay_webhook_secret ?? "");
    setSelectedAccount(initial.sepay_account_number ?? "");
    setSelectedName(initial.sepay_account_name ?? "");
    setSelectedBank(initial.sepay_bank_name ?? "");
  }, [initial]);

  const handleFetchAccounts = useCallback(async () => {
    if (!apiToken.trim()) return;
    setFetchStatus("fetching");
    setFetchError(undefined);
    setBankAccounts([]);
    try {
      const res = await fetch(
        `/api/sepay/bank-accounts?token=${encodeURIComponent(apiToken.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setFetchStatus("fail");
        setFetchError(data?.error ?? "Không lấy được danh sách tài khoản");
        return;
      }
      const accounts: BankAccount[] = data?.bankAccounts ?? [];
      setBankAccounts(accounts);
      setFetchStatus("ok");
      // Auto-select nếu chỉ có 1 tài khoản hoặc khớp với tài khoản đã lưu
      if (accounts.length === 1) {
        setSelectedAccount(accounts[0].bank_account_id);
        setSelectedName(accounts[0].bank_account_name);
        setSelectedBank(accounts[0].bank_name);
      } else if (selectedAccount) {
        const match = accounts.find(
          (a) => a.bank_account_id === selectedAccount
        );
        if (!match && accounts.length > 0) {
          setSelectedAccount(accounts[0].bank_account_id);
          setSelectedName(accounts[0].bank_account_name);
          setSelectedBank(accounts[0].bank_name);
        }
      }
    } catch {
      setFetchStatus("fail");
      setFetchError("Lỗi kết nối mạng");
    }
  }, [apiToken, selectedAccount]);

  const handleSelectAccount = useCallback(
    (acc: BankAccount) => {
      setSelectedAccount(acc.bank_account_id);
      setSelectedName(acc.bank_account_name);
      setSelectedBank(acc.bank_name);
    },
    []
  );

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    setSaveError(undefined);
    const res = await saveSettings({
      sepay_api_token: apiToken,
      sepay_webhook_secret: secret,
      sepay_account_number: selectedAccount,
      sepay_account_name: selectedName,
      sepay_bank_name: selectedBank,
    });
    if (res.ok) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("error");
      setSaveError(res.message);
    }
  }, [apiToken, secret, selectedAccount, selectedName, selectedBank]);

  const isConnected = fetchStatus === "ok" && bankAccounts.length > 0;
  const hasSavedAccount = !loading && !!initial.sepay_account_number;

  return (
    <section className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start gap-4 p-6">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
          <Webhook className="h-5 w-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">Sepay — Thanh toán tự động</h2>
            <Badge
              variant="outline"
              className="border-blue-500/30 text-blue-400 text-[10px]"
            >
              API + Webhook
            </Badge>
            {hasSavedAccount && (
              <Badge
                variant="outline"
                className="border-green-500/30 text-green-400 text-[10px]"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Đã kết nối
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Nhập API Token để tự động tải danh sách tài khoản ngân hàng, sau đó
            cấu hình webhook nhận thanh toán realtime.
          </p>
        </div>
      </div>

      <Separator className="bg-border/40" />

      <div className="space-y-6 p-6">
        {/* ── Bước 1: API Token ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
              1
            </div>
            <span className="text-sm font-semibold">Nhập SePay API Token</span>
          </div>

          <div>
            <FieldLabel htmlFor="sepay-token" required>
              API Token
            </FieldLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <SecretInput
                  id="sepay-token"
                  value={loading ? "" : apiToken}
                  onChange={setApiToken}
                  placeholder={
                    loading ? "Đang tải…" : "Nhập API Token từ SePay Dashboard"
                  }
                  disabled={loading}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchAccounts}
                disabled={
                  loading || !apiToken.trim() || fetchStatus === "fetching"
                }
                className={cn(
                  "shrink-0 gap-2",
                  fetchStatus === "ok" &&
                    "border-green-500/40 text-green-400 hover:border-green-500/60",
                  fetchStatus === "fail" &&
                    "border-destructive/40 text-destructive"
                )}
              >
                {fetchStatus === "fetching" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : fetchStatus === "ok" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : fetchStatus === "fail" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {fetchStatus === "fetching"
                  ? "Đang tải…"
                  : fetchStatus === "ok"
                  ? "Đã kết nối"
                  : fetchStatus === "fail"
                  ? "Thử lại"
                  : "Kết nối"}
              </Button>
            </div>
            {fetchStatus === "fail" && fetchError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {fetchError}
              </p>
            )}
            <FieldHint>
              Lấy tại{" "}
              <a
                href="https://my.sepay.vn/userapi/token"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                SePay Dashboard → API Token
              </a>
              . Token dùng để tự động lấy danh sách tài khoản ngân hàng.
            </FieldHint>
          </div>
        </div>

        {/* ── Bước 2: Chọn tài khoản ngân hàng ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                isConnected
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-muted/40 text-muted-foreground"
              )}
            >
              2
            </div>
            <span
              className={cn(
                "text-sm font-semibold",
                !isConnected && "text-muted-foreground"
              )}
            >
              Chọn tài khoản ngân hàng nhận tiền
            </span>
          </div>

          {/* Hiện tài khoản đã lưu nếu chưa fetch */}
          {hasSavedAccount && fetchStatus === "idle" && (
            <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {initial.sepay_bank_name || "Ngân hàng"} —{" "}
                  {initial.sepay_account_number}
                </div>
                {initial.sepay_account_name && (
                  <div className="text-xs text-muted-foreground">
                    {initial.sepay_account_name}
                  </div>
                )}
              </div>
              <Badge
                variant="outline"
                className="border-green-500/30 text-green-400 text-[10px] shrink-0"
              >
                Đang dùng
              </Badge>
            </div>
          )}

          {/* Danh sách sau khi fetch */}
          {isConnected && bankAccounts.length > 0 && (
            <div className="space-y-2">
              {bankAccounts.map((acc) => {
                const isSelected = selectedAccount === acc.bank_account_id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left transition-all",
                      isSelected
                        ? "border-blue-500/50 bg-blue-500/10 ring-1 ring-blue-500/30"
                        : "border-border/60 bg-card/40 hover:border-border hover:bg-accent/30",
                      acc.status !== 1 && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                          isSelected
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-muted/50 text-muted-foreground"
                        )}
                      >
                        {acc.bank_short_name?.slice(0, 3) ?? "BNK"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {acc.bank_account_id}
                          </span>
                          {acc.status !== 1 && (
                            <Badge
                              variant="outline"
                              className="border-muted-foreground/30 text-muted-foreground text-[10px]"
                            >
                              Không hoạt động
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {acc.bank_account_name} · {acc.bank_name}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "h-4 w-4 shrink-0 rounded-full border-2 transition-colors",
                          isSelected
                            ? "border-blue-400 bg-blue-400"
                            : "border-muted-foreground/40"
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {fetchStatus === "ok" && bankAccounts.length === 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
              Không tìm thấy tài khoản ngân hàng nào trong SePay của bạn.
              Vui lòng liên kết tài khoản tại SePay Dashboard trước.
            </div>
          )}

          {fetchStatus === "idle" && !hasSavedAccount && (
            <p className="text-xs text-muted-foreground">
              Nhập API Token và nhấn <strong>Kết nối</strong> để tải danh sách
              tài khoản ngân hàng của bạn từ SePay.
            </p>
          )}
        </div>

        {/* ── Bước 3: Webhook ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400">
              3
            </div>
            <span className="text-sm font-semibold">Cấu hình Webhook</span>
          </div>

          {/* Webhook URL */}
          <div>
            <FieldLabel htmlFor="webhook-url">Webhook URL</FieldLabel>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 font-mono text-sm text-muted-foreground">
                <span className="flex-1 truncate">{WEBHOOK_BASE_URL}</span>
              </div>
              <CopyButton text={WEBHOOK_BASE_URL} />
            </div>
            <FieldHint>
              Dán URL này vào <strong>SePay Dashboard → Webhook → URL</strong>.
              Không thể thay đổi.
            </FieldHint>
          </div>

          {/* Webhook Secret */}
          <div>
            <FieldLabel htmlFor="sepay-secret">Webhook Secret Key</FieldLabel>
            <SecretInput
              id="sepay-secret"
              value={loading ? "" : secret}
              onChange={setSecret}
              placeholder={
                loading ? "Đang tải…" : "Dán Secret Key từ SePay Dashboard"
              }
              disabled={loading}
            />
            <FieldHint>
              Lấy tại SePay Dashboard → Webhook → Secret. Dùng để xác thực
              request hợp lệ từ SePay.
            </FieldHint>
          </div>

          {/* Setup guide */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Info className="h-3.5 w-3.5" />
              Hướng dẫn cấu hình Webhook trên SePay
            </div>
            <ol className="space-y-1 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                Đăng nhập{" "}
                <a
                  href="https://my.sepay.vn/userapi/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline"
                >
                  my.sepay.vn → Webhook
                </a>
              </li>
              <li className="flex gap-2">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                Nhấn <strong>Thêm webhook</strong> → dán URL bên trên vào ô URL
              </li>
              <li className="flex gap-2">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                Chọn tài khoản ngân hàng muốn nhận sự kiện → Lưu
              </li>
              <li className="flex gap-2">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                Copy <strong>Secret Key</strong> → điền vào ô Webhook Secret
                bên trên → Lưu cài đặt
              </li>
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-5">
          <SaveButton
            status={saveStatus}
            onClick={handleSave}
            disabled={loading}
          />
          <StatusBanner status={saveStatus} message={saveError} />
        </div>
      </div>
    </section>
  );
}

// ─── Section: OpenAI API ─────────────────────────────────────────────────────

function OpenAISection({
  initial,
  loading,
}: {
  initial: Partial<SystemSettings>;
  loading: boolean;
}) {
  const [apiKey, setApiKey] = useState(initial.openai_api_key ?? "");
  const [model, setModel] = useState(
    initial.openai_model ?? DEFAULT_SETTINGS.openai_model
  );
  const [prompt, setPrompt] = useState(
    initial.openai_system_prompt ?? DEFAULT_SETTINGS.openai_system_prompt
  );
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>();

  // Sync khi data load xong
  useEffect(() => {
    setApiKey(initial.openai_api_key ?? "");
    setModel(initial.openai_model ?? DEFAULT_SETTINGS.openai_model);
    setPrompt(
      initial.openai_system_prompt ?? DEFAULT_SETTINGS.openai_system_prompt
    );
  }, [initial]);

  const handleSave = useCallback(async () => {
    setStatus("saving");
    setErrorMsg(undefined);
    const res = await saveSettings({
      openai_api_key: apiKey,
      openai_model: model,
      openai_system_prompt: prompt,
    });
    if (res.ok) {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setErrorMsg(res.message);
    }
  }, [apiKey, model, prompt]);

  const handleTest = useCallback(async () => {
    if (!apiKey.trim()) return;
    setTestStatus("testing");
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      setTestStatus(res.ok ? "ok" : "fail");
    } catch {
      setTestStatus("fail");
    }
    setTimeout(() => setTestStatus("idle"), 4000);
  }, [apiKey]);

  const modelLabel = OPENAI_MODELS.find((m) => m.value === model)?.label ?? model;

  return (
    <section className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start gap-4 p-6">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20">
          <Bot className="h-5 w-5 text-violet-400" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">OpenAI API</h2>
            <Badge variant="outline" className="border-violet-500/30 text-violet-400 text-[10px]">
              AI tư vấn chiến dịch
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Kết nối OpenAI để kích hoạt tính năng AI phân tích creative, gợi ý tối ưu ngân sách và đề xuất nội dung quảng cáo.
          </p>
        </div>
      </div>

      <Separator className="bg-border/40" />

      <div className="space-y-5 p-6">
        {/* API Key */}
        <div>
          <FieldLabel htmlFor="openai-key" required>
            OpenAI API Key
          </FieldLabel>
          <SecretInput
            id="openai-key"
            value={loading ? "" : apiKey}
            onChange={setApiKey}
            placeholder={loading ? "Đang tải…" : "sk-…"}
            disabled={loading}
          />
          <FieldHint>
            Lấy tại platform.openai.com → API Keys → Create new secret key. Key chỉ hiển thị 1 lần.
          </FieldHint>
        </div>

        {/* Model */}
        <div>
          <FieldLabel htmlFor="openai-model">Model AI</FieldLabel>
          <div className="relative">
            <select
              id="openai-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={loading}
              className={cn(
                "flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 py-2 text-sm shadow-sm ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {OPENAI_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ▾
            </div>
          </div>
          <FieldHint>
            GPT-4o cân bằng tốt giữa chất lượng và tốc độ. GPT-4o Mini rẻ hơn ~15x, phù hợp query nhiều.
          </FieldHint>
        </div>

        {/* System Prompt */}
        <div>
          <FieldLabel htmlFor="openai-prompt">System Prompt (ngữ cảnh AI)</FieldLabel>
          <textarea
            id="openai-prompt"
            value={loading ? "" : prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            rows={5}
            placeholder={loading ? "Đang tải…" : "Nhập ngữ cảnh và hướng dẫn cho AI…"}
            className={cn(
              "flex min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
              "resize-y font-mono"
            )}
          />
          <FieldHint>
            Prompt này gắn vào đầu mỗi cuộc hội thoại. Giúp AI hiểu context doanh nghiệp và trả lời đúng trọng tâm.
          </FieldHint>
        </div>

        {/* Preview model info */}
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3.5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-violet-400">
            <Bot className="h-3.5 w-3.5" />
            Cấu hình hiện tại
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="font-mono text-foreground">{modelLabel}</span>
            </div>
            <div className="flex justify-between">
              <span>API Key:</span>
              <span className="font-mono text-foreground">
                {apiKey
                  ? `${apiKey.slice(0, 7)}…${apiKey.slice(-4)}`
                  : "Chưa cấu hình"}
              </span>
            </div>
          </div>
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-violet-400 hover:underline"
          >
            Mở OpenAI Platform
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <SaveButton status={status} onClick={handleSave} disabled={loading} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={loading || !apiKey.trim() || testStatus === "testing"}
            className={cn(
              "min-w-[150px] gap-2",
              testStatus === "ok" && "border-green-500/40 text-green-400",
              testStatus === "fail" && "border-destructive/40 text-destructive"
            )}
          >
            {testStatus === "testing" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : testStatus === "ok" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : testStatus === "fail" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {testStatus === "testing"
              ? "Đang kiểm tra…"
              : testStatus === "ok"
              ? "Kết nối OK!"
              : testStatus === "fail"
              ? "Kết nối thất bại"
              : "Kiểm tra kết nối"}
          </Button>
          <StatusBanner status={status} message={errorMsg} />
        </div>
      </div>
    </section>
  );
}

// ─── Section: Email / SMTP ───────────────────────────────────────────────────

function EmailSection({
  initial,
  loading,
}: {
  initial: Partial<SystemSettings>;
  loading: boolean;
}) {
  const [apiKey, setApiKey] = useState(initial.resend_api_key ?? "");
  const [fromName, setFromName] = useState(
    initial.email_from_name ?? DEFAULT_SETTINGS.email_from_name
  );
  const [fromAddress, setFromAddress] = useState(
    initial.email_from_address ?? DEFAULT_SETTINGS.email_from_address
  );
  const [testTo, setTestTo] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [sendStatus, setSendStatus] = useState<TestStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>();

  useEffect(() => {
    setApiKey(initial.resend_api_key ?? "");
    setFromName(initial.email_from_name ?? DEFAULT_SETTINGS.email_from_name);
    setFromAddress(
      initial.email_from_address ?? DEFAULT_SETTINGS.email_from_address
    );
  }, [initial]);

  const handleSave = useCallback(async () => {
    setStatus("saving");
    setErrorMsg(undefined);
    const res = await saveSettings({
      resend_api_key: apiKey,
      email_from_name: fromName,
      email_from_address: fromAddress,
    });
    if (res.ok) {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setErrorMsg(res.message);
    }
  }, [apiKey, fromName, fromAddress]);

  const handleSendTest = useCallback(async () => {
    if (!testTo.trim()) return;
    setSendStatus("testing");
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo.trim() }),
      });
      setSendStatus(res.ok ? "ok" : "fail");
    } catch {
      setSendStatus("fail");
    }
    setTimeout(() => setSendStatus("idle"), 5000);
  }, [testTo]);

  return (
    <section className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start gap-4 p-6">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <Mail className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">Email / SMTP</h2>
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-400 text-[10px]"
            >
              Resend
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cấu hình Resend để gửi email từ{" "}
            <code className="rounded bg-muted/50 px-1 text-xs">
              @biznoco.com
            </code>{" "}
            — magic link, thông báo, cảnh báo hiệu suất.
          </p>
        </div>
      </div>

      <Separator className="bg-border/40" />

      <div className="space-y-5 p-6">
        {/* Resend API Key */}
        <div>
          <FieldLabel htmlFor="resend-key" required>
            Resend API Key
          </FieldLabel>
          <SecretInput
            id="resend-key"
            value={loading ? "" : apiKey}
            onChange={setApiKey}
            placeholder={loading ? "Đang tải…" : "re_xxxxxxxxxxxxxxxxxxxxxxxx"}
            disabled={loading}
          />
          <FieldHint>
            Lấy tại resend.com/api-keys → Create API Key. Chọn quyền{" "}
            <strong>Sending access</strong> cho domain biznoco.com.
          </FieldHint>
        </div>

        {/* From Name */}
        <div>
          <FieldLabel htmlFor="email-from-name">Tên người gửi</FieldLabel>
          <Input
            id="email-from-name"
            value={loading ? "" : fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder={loading ? "Đang tải…" : "Biznoco"}
            disabled={loading}
          />
        </div>

        {/* From Address */}
        <div>
          <FieldLabel htmlFor="email-from-address">Email người gửi</FieldLabel>
          <Input
            id="email-from-address"
            type="email"
            value={loading ? "" : fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            placeholder={loading ? "Đang tải…" : "noreply@biznoco.com"}
            disabled={loading}
          />
          <FieldHint>
            Phải là email thuộc domain đã verify trên Resend (biznoco.com).
          </FieldHint>
        </div>

        {/* Setup guide */}
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Info className="h-3.5 w-3.5" />
            Hướng dẫn cấu hình Resend + Supabase SMTP
          </div>
          <ol className="space-y-1 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              Đăng ký <strong>resend.com</strong> → Domains → Add Domain →{" "}
              <code>biznoco.com</code>
            </li>
            <li className="flex gap-2">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              Thêm DNS records (SPF + DKIM) vào nhà đăng ký domain
            </li>
            <li className="flex gap-2">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              Tạo API Key → điền vào ô trên → Lưu cài đặt
            </li>
            <li className="flex gap-2">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span>
                Supabase Dashboard → Settings → Auth → SMTP:{" "}
                <code>smtp.resend.com:465</code>, user{" "}
                <code>resend</code>, pass = API Key
              </span>
            </li>
          </ol>
          <div className="mt-2 flex gap-3">
            <a
              href="https://resend.com/domains"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
            >
              Resend Domains
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={`https://supabase.com/dashboard/project/zdchzmvonqvxbdbfuufl/settings/auth`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
            >
              Supabase SMTP Settings
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* SMTP reference */}
        <div className="rounded-lg border border-border/40 bg-muted/20 p-3.5">
          <div className="mb-2 text-xs font-semibold text-muted-foreground">
            Thông số SMTP để nhập vào Supabase
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {[
              ["Host", "smtp.resend.com"],
              ["Port", "465"],
              ["Username", "resend"],
              ["Password", apiKey || "re_xxxxxxxx (API Key)"],
              ["Sender email", fromAddress || "noreply@biznoco.com"],
              ["Sender name", fromName || "Biznoco"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{k}:</span>
                <span className="text-foreground">
                  {k === "Password" && apiKey
                    ? `${apiKey.slice(0, 7)}…${apiKey.slice(-4)}`
                    : v}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Test send */}
        <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
          <div className="mb-3 text-sm font-medium">Gửi email test</div>
          <div className="flex gap-2">
            <Input
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="email@example.com"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendTest}
              disabled={!testTo.trim() || sendStatus === "testing"}
              className={cn(
                "min-w-[120px] gap-2 shrink-0",
                sendStatus === "ok" && "border-green-500/40 text-green-400",
                sendStatus === "fail" && "border-destructive/40 text-destructive"
              )}
            >
              {sendStatus === "testing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : sendStatus === "ok" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : sendStatus === "fail" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sendStatus === "testing"
                ? "Đang gửi…"
                : sendStatus === "ok"
                ? "Đã gửi!"
                : sendStatus === "fail"
                ? "Thất bại"
                : "Gửi test"}
            </Button>
          </div>
          <FieldHint>
            Nhấn "Gửi test" để xác nhận Resend API Key hoạt động và email đến inbox.
          </FieldHint>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <SaveButton status={status} onClick={handleSave} disabled={loading} />
          <StatusBanner status={status} message={errorMsg} />
        </div>
      </div>
    </section>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function AdminPanel() {
  const [settings, setSettings] = useState<Partial<SystemSettings>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadSettings()
      .then((s) => {
        setSettings(s);
        setLoading(false);
      })
      .catch(() => {
        setLoadError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 md:px-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-semibold uppercase tracking-wider">
              Admin
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Cài đặt hệ thống — chỉ quản trị viên mới truy cập được
          </p>
        </div>
      </div>

      {/* Mock mode warning */}
      {!isSupabaseConfigured && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">Mock mode — dữ liệu không được lưu</div>
            <div className="mt-0.5 text-xs text-amber-400/80">
              Kết nối Supabase để lưu cài đặt thực.
            </div>
          </div>
        </div>
      )}

      {loadError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">Không thể tải cài đặt</div>
            <div className="mt-0.5 text-xs text-red-400/80">
              Kiểm tra kết nối Supabase và thử lại.
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <ActivationSection />
      <EmailSection initial={settings} loading={loading} />
      <EmailStatsSection hasApiKey={!loading && !!settings.resend_api_key} />
      <SepaySection initial={settings} loading={loading} />
      <OpenAISection initial={settings} loading={loading} />

      {/* Footer note */}
      <p className="pb-4 text-center text-xs text-muted-foreground">
        Cài đặt được mã hóa và lưu trữ an toàn trong Supabase.{" "}
        <span className="text-primary">Chỉ bạn mới thấy trang này.</span>
      </p>
    </div>
  );
}
