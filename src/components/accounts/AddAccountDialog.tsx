"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Wallet2, X } from "lucide-react";
import { createAccount } from "@/services/accountsService";
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
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await createAccount({
        fb_ad_account_id: fbId.trim(),
        account_name: name.trim(),
        currency,
      });
      // Reset form
      setFbId("");
      setName("");
      setCurrency("VND");
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
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white">
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
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ad Account ID *
              </label>
              <Input
                placeholder="1234567890 hoặc act_1234567890"
                value={fbId}
                onChange={(e) => setFbId(e.target.value)}
                disabled={busy}
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Lấy tại Facebook Ads Manager → Account Overview → Account ID
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
