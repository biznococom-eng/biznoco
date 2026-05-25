"use client";

import { useState } from "react";
import {
  Loader2,
  AlertCircle,
  Wallet2,
  X,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { createAccount } from "@/services/accountsService";
import { validateToken, listAdAccounts } from "@/services/metaApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface AddAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddAccountDialog({ open, onClose, onCreated }: AddAccountDialogProps) {
  const [fbId, setFbId] = useState("");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [metaToken, setMetaToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<
    | { kind: "idle" }
    | { kind: "checking" }
    | { kind: "ok"; name: string; adAccountsCount: number }
    | { kind: "err"; msg: string }
  >({ kind: "idle" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  async function checkToken() {
    if (!metaToken.trim()) return;
    setTokenStatus({ kind: "checking" });
    try {
      const info = await validateToken(metaToken.trim());
      const accs = await listAdAccounts(metaToken.trim());
      setTokenStatus({ kind: "ok", name: info.name, adAccountsCount: accs.length });
      // Auto-fill từ ad account đầu tiên nếu user chưa nhập
      if (accs.length > 0 && !fbId) {
        setFbId(accs[0].id);
      }
      if (accs.length > 0 && !name) {
        setName(accs[0].name);
      }
    } catch (e) {
      setTokenStatus({ kind: "err", msg: e instanceof Error ? e.message : String(e) });
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await createAccount({
        fb_ad_account_id: fbId.trim(),
        account_name: name.trim(),
        currency,
        access_token: metaToken.trim() || undefined,
        meta_token_user_id: tokenStatus.kind === "ok" ? undefined : undefined,
      });
      // Reset form
      setFbId("");
      setName("");
      setCurrency("VND");
      setMetaToken("");
      setTokenStatus({ kind: "idle" });
      onCreated();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <Card className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent/40 hover:text-foreground"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 text-white">
              <Wallet2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Kết nối Ad Account</h2>
              <p className="text-xs text-muted-foreground">
                Nhập thông tin Ad Account của bạn để bắt đầu phân tích.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {/* META TOKEN — bước 1 */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wide text-primary">
                  ⚡ Meta API Access Token
                </label>
                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                >
                  Lấy token <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <div className="relative">
                <Key className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder="EAAxxx... (long-lived access token)"
                  value={metaToken}
                  onChange={(e) => {
                    setMetaToken(e.target.value);
                    setTokenStatus({ kind: "idle" });
                  }}
                  onBlur={checkToken}
                  disabled={busy}
                  className="pl-9 pr-20 text-xs"
                />
                <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-0.5">
                  <button
                    type="button"
                    onClick={() => setShowToken((v) => !v)}
                    tabIndex={-1}
                    className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-accent/40"
                  >
                    {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={checkToken}
                    disabled={!metaToken.trim() || tokenStatus.kind === "checking"}
                    className="rounded bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground hover:brightness-110 disabled:opacity-50"
                  >
                    {tokenStatus.kind === "checking" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Test"
                    )}
                  </button>
                </div>
              </div>
              {tokenStatus.kind === "ok" && (
                <div className="mt-2 flex items-center gap-1.5 rounded bg-success/15 px-2 py-1 text-[11px] text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  Token valid · {tokenStatus.name} · {tokenStatus.adAccountsCount} ad accounts
                </div>
              )}
              {tokenStatus.kind === "err" && (
                <div className="mt-2 flex items-start gap-1.5 rounded bg-destructive/15 px-2 py-1 text-[11px] text-destructive">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{tokenStatus.msg}</span>
                </div>
              )}
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                Scopes cần: <code>ads_read</code>, <code>business_management</code>,{" "}
                <code>read_insights</code>. Token lưu local, không gửi đến server biznoco.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ad Account ID *
              </label>
              <Input
                placeholder="act_1234567890"
                value={fbId}
                onChange={(e) => setFbId(e.target.value)}
                disabled={busy}
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Auto-fill khi Test token thành công, hoặc lấy tại Ads Manager → Account ID
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tên hiển thị *
              </label>
              <Input
                placeholder="Shop ABC · TMĐT · Mỹ phẩm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tiền tệ
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={busy}
                className="flex h-10 w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm"
              >
                <option value="VND">VND — Việt Nam Đồng</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="THB">THB — Thai Baht</option>
                <option value="SGD">SGD — Singapore Dollar</option>
              </select>
            </div>

            {err && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                disabled={busy || !fbId.trim() || !name.trim()}
                className="flex-1"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang kết nối…
                  </>
                ) : (
                  "Kết nối"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={busy}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
