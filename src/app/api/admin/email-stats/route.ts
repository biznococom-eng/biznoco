import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

/**
 * GET /api/admin/email-stats
 * Admin-only: lấy thống kê email đã gửi qua Resend (last 100).
 */
export async function GET() {
  const isSupabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: true, stats: getMockStats() });
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY chưa cấu hình trong Vercel env vars." },
      { status: 400 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (resend.emails as any).list({ limit: 100 });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    // Resend trả về { data: { data: Email[], hasMore, nextPage } } hoặc { data: Email[] }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData = result.data as any;
    const emails: EmailItem[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
      ? rawData.data
      : [];

    return NextResponse.json({ ok: true, stats: aggregateStats(emails) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── Types & helpers ────────────────────────────────────────────────────────────

interface EmailItem {
  id: string;
  to: string | string[];
  from?: string;
  subject?: string;
  last_event?: string;
  created_at: string;
}

interface EmailStats {
  total: number;
  today: number;
  week: number;
  month: number;
  byStatus: Record<string, number>;
  recentEmails: RecentEmail[];
}

interface RecentEmail {
  id: string;
  to: string;
  subject: string;
  status: string;
  createdAt: string;
}

function aggregateStats(emails: EmailItem[]): EmailStats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let today = 0;
  let week = 0;
  let month = 0;
  const byStatus: Record<string, number> = {};

  for (const email of emails) {
    const createdAt = new Date(email.created_at);
    if (createdAt >= todayStart) today++;
    if (createdAt >= weekStart) week++;
    if (createdAt >= monthStart) month++;
    const status = email.last_event ?? "sent";
    byStatus[status] = (byStatus[status] ?? 0) + 1;
  }

  const recentEmails: RecentEmail[] = emails.slice(0, 10).map((e) => ({
    id: e.id,
    to: Array.isArray(e.to) ? e.to[0] : (e.to ?? ""),
    subject: e.subject ?? "(Không có tiêu đề)",
    status: e.last_event ?? "sent",
    createdAt: e.created_at,
  }));

  return { total: emails.length, today, week, month, byStatus, recentEmails };
}

function getMockStats(): EmailStats {
  const now = new Date();
  return {
    total: 23,
    today: 3,
    week: 12,
    month: 23,
    byStatus: { delivered: 18, sent: 3, bounced: 1, opened: 1 },
    recentEmails: [
      {
        id: "mock-1",
        to: "user@example.com",
        subject: "Chào mừng bạn đến với Biznoco!",
        status: "delivered",
        createdAt: now.toISOString(),
      },
      {
        id: "mock-2",
        to: "test@example.com",
        subject: "✅ Test Email từ Biznoco SMTP",
        status: "delivered",
        createdAt: new Date(now.getTime() - 3600000).toISOString(),
      },
    ],
  };
}
