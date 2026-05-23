"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Wallet2,
  ExternalLink,
  Sparkles,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Database,
  BookOpen,
} from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import {
  deleteAccount,
  countCreativeStats,
  type AdAccount,
} from "@/services/accountsService";
import { seedDemoData, clearAccountData } from "@/services/seedService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddAccountDialog } from "./AddAccountDialog";

export function AccountsManager() {
  const { accounts, isLoading, error, refetch } = useAccounts(true);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Ad Accounts
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Quản lý Facebook Ad Account đã kết nối. Mỗi account sync dữ liệu
            riêng vào dashboard.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Kết nối account mới
        </Button>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="flex items-start gap-2 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Lỗi tải accounts: {error.message}</span>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && accounts.length === 0 && (
        <Card>
          <CardContent className="grid place-items-center py-16 text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <Wallet2 className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Chưa kết nối account nào</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Kết nối Facebook Ad Account để Biznoco bắt đầu phân tích creative
              cho bạn.
            </p>
            <Button className="mt-5" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Kết nối Facebook Ad Account
            </Button>
          </CardContent>
        </Card>
      )}

      {accounts.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} onChange={refetch} />
          ))}
        </div>
      )}

      <Card className="mt-6 border-dashed border-border/60 bg-card/40">
        <CardContent className="p-5 text-sm">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <BookOpen className="h-4 w-4 text-primary" />
            Sync dữ liệu thật từ Meta Marketing API
          </div>
          <p className="text-xs text-muted-foreground">
            Auto-sync từ Meta đang trong roadmap. Hiện tại bạn có thể:
            <br />
            (1) Bấm <b>Import demo</b> trên card để load 12 chiến dịch mẫu cho
            account đó.
            <br />
            (2) Hoặc tự upload CSV từ Ads Manager qua Supabase Studio → table{" "}
            <code className="rounded bg-secondary/40 px-1">creative_stats</code>.
          </p>
        </CardContent>
      </Card>

      <AddAccountDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}

function AccountCard({
  account,
  onChange,
}: {
  account: AdAccount;
  onChange: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<"seed" | "clear" | "delete" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [statCount, setStatCount] = useState<number | null>(null);

  // Lazy load count on first render
  useState(() => {
    countCreativeStats(account.id)
      .then((n) => setStatCount(n))
      .catch(() => setStatCount(null));
  });

  async function handleSeed() {
    setBusy("seed");
    setMsg(null);
    try {
      const r = await seedDemoData(account.id);
      setMsg({ kind: "ok", text: r.message });
      const n = await countCreativeStats(account.id);
      setStatCount(n);
      await onChange();
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  async function handleClear() {
    if (!window.confirm(`Xoá tất cả dữ liệu creative_stats của "${account.account_name}"?`)) {
      return;
    }
    setBusy("clear");
    setMsg(null);
    try {
      const n = await clearAccountData(account.id);
      setMsg({ kind: "ok", text: `Đã xoá ${n} dòng.` });
      setStatCount(0);
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Xoá account "${account.account_name}"?\n\nTất cả creative_stats liên quan cũng sẽ bị xoá (cascade). Hành động này không thể undo.`,
      )
    ) {
      return;
    }
    setBusy("delete");
    try {
      await deleteAccount(account.id);
      await onChange();
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
      setBusy(null);
    }
  }

  const statusTone =
    account.status === "active"
      ? "success"
      : account.status === "paused"
        ? "warning"
        : account.status === "error"
          ? "destructive"
          : "secondary";

  return (
    <Card className="flex flex-col overflow-hidden" id={account.id}>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-base font-bold tracking-tight">
              {account.account_name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <code className="rounded bg-secondary/40 px-1 py-0.5">
                {account.fb_ad_account_id}
              </code>
            </p>
          </div>
          <Badge variant={statusTone} className="shrink-0 capitalize">
            {account.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-md border border-border/40 bg-secondary/30 p-2 text-xs">
          <Stat label="Tiền tệ" value={account.currency ?? "—"} />
          <Stat
            label="Stats rows"
            value={statCount == null ? "…" : statCount.toLocaleString("vi-VN")}
            tone={
              statCount != null && statCount > 0
                ? "success"
                : statCount === 0
                  ? "warning"
                  : undefined
            }
          />
          <Stat
            label="Sync"
            value={
              account.last_synced_at
                ? formatDate(account.last_synced_at).split(" ")[0]
                : "Chưa"
            }
          />
        </div>

        {msg && (
          <div
            className={`flex items-start gap-2 rounded-md border p-2 text-xs ${
              msg.kind === "ok"
                ? "border-success/30 bg-success/5 text-success"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            {msg.kind === "ok" ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            )}
            <span className="break-words">{msg.text}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border/40 pt-3">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href="/creatives">
              <ExternalLink className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </Button>
          {statCount === 0 || statCount == null ? (
            <Button
              size="sm"
              variant="default"
              onClick={handleSeed}
              disabled={busy !== null}
              className="flex-1"
            >
              {busy === "seed" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Import demo
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSeed}
              disabled={busy !== null}
              className="flex-1"
              title="Upsert lại 168 rows demo"
            >
              {busy === "seed" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Database className="h-3.5 w-3.5" />
              )}
              Re-seed
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {(statCount ?? 0) > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              disabled={busy !== null}
              className="flex-1 text-muted-foreground"
            >
              {busy === "clear" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Xoá data
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={busy !== null}
            className="flex-1 text-destructive hover:bg-destructive/10"
          >
            {busy === "delete" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Xoá account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning";
}) {
  return (
    <div className="text-center">
      <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-0.5 text-xs font-bold tabular-nums ${
          tone === "success"
            ? "text-success"
            : tone === "warning"
              ? "text-warning"
              : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return s;
  }
}
