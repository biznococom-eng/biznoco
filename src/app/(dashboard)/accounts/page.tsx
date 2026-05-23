import Link from "next/link";
import { ExternalLink, Plus, Wallet2 } from "lucide-react";

import { getSupabaseServer, isSupabaseConfiguredServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Ad Accounts · Biznoco",
};

export default async function AccountsPage() {
  if (!isSupabaseConfiguredServer) {
    return <NotConfiguredState />;
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Yêu cầu đăng nhập</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vui lòng đăng nhập để quản lý Ad Accounts.
        </p>
        <Button asChild className="mt-4">
          <Link href="/login?next=/accounts">Đăng nhập</Link>
        </Button>
      </div>
    );
  }

  type AccountRow = {
    id: string;
    account_name: string;
    fb_ad_account_id: string;
    currency: string | null;
    status: string | null;
    last_synced_at: string | null;
    created_at: string;
  };

  const { data: accountsRaw, error } = await supabase
    .from("accounts")
    .select("id, account_name, fb_ad_account_id, currency, status, last_synced_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const accounts = (accountsRaw ?? []) as AccountRow[];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ad Accounts</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Quản lý các Facebook Ad Account đã kết nối. Mỗi account sync data riêng vào dashboard.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Kết nối account mới
        </Button>
      </header>

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">
            Lỗi tải accounts: {error.message}
          </CardContent>
        </Card>
      )}

      {!error && accounts.length === 0 && (
        <Card>
          <CardContent className="grid place-items-center py-16 text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/10">
              <Wallet2 className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Chưa kết nối account nào</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Kết nối Facebook Ad Account để Biznoco bắt đầu sync creative stats hàng giờ.
            </p>
            <Button className="mt-5">
              <Plus className="h-4 w-4" /> Kết nối Facebook Ad Account
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Hoặc thêm thủ công qua{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Supabase Studio
              </a>{" "}
              → table <code className="rounded bg-secondary/40 px-1">accounts</code>.
            </p>
          </CardContent>
        </Card>
      )}

      {accounts.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <Card key={a.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="line-clamp-1 text-base">{a.account_name}</CardTitle>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  <code className="rounded bg-secondary/40 px-1">{a.fb_ad_account_id}</code>
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <Row label="Tiền tệ" value={a.currency ?? "—"} />
                <Row label="Sync gần nhất" value={a.last_synced_at ? formatDate(a.last_synced_at) : "Chưa sync"} />
                <Row label="Tạo lúc" value={formatDate(a.created_at)} />
                <div className="mt-3 flex gap-2 pt-2">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link href={`/creatives?account=${a.id}`}>
                      Xem dashboard <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6 border-dashed border-border/60 bg-card/40">
        <CardContent className="p-5 text-sm">
          <div className="font-semibold">💡 Setup Meta Marketing API sync</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Auto-sync chưa được triển khai trong bản beta. Hiện tại bạn cần seed
            data thủ công qua script <code className="rounded bg-secondary/40 px-1">scripts/seed-supabase.ts</code> hoặc
            insert trực tiếp vào table <code className="rounded bg-secondary/40 px-1">creative_stats</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const tone =
    status === "active"
      ? "success"
      : status === "paused"
        ? "warning"
        : status === "error"
          ? "destructive"
          : "secondary";
  return (
    <Badge variant={tone as "default" | "success" | "warning" | "destructive" | "secondary"} className="capitalize">
      {status ?? "unknown"}
    </Badge>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className="font-medium text-foreground/90">{value}</span>
    </div>
  );
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

function NotConfiguredState() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 text-center">
      <h1 className="text-2xl font-bold">Cấu hình Supabase trước</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Trang Ad Accounts cần Supabase Auth + Database. Hãy thêm
        <br />
        <code className="mt-1 inline-block rounded bg-secondary/40 px-2 py-0.5 text-xs">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        và{" "}
        <code className="rounded bg-secondary/40 px-2 py-0.5 text-xs">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        vào <code className="rounded bg-secondary/40 px-2 py-0.5 text-xs">.env.local</code>{" "}
        rồi restart dev server.
      </p>
      <Button asChild className="mt-5">
        <Link href="/creatives">Quay lại dashboard mock</Link>
      </Button>
    </div>
  );
}
