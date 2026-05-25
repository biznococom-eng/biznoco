import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { sendEmail } from "@/lib/email";

/**
 * POST /api/admin/test-email
 * Body: { to: string }
 * Admin-only: gửi test email để kiểm tra SMTP.
 */
export async function POST(request: NextRequest) {
  // Auth guard
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const to: string = body.to ?? user.email ?? "";

  if (!to) {
    return NextResponse.json({ error: "Missing 'to' field" }, { status: 400 });
  }

  console.log("[test-email] sending to:", to, "| RESEND_API_KEY set:", !!process.env.RESEND_API_KEY);
  try {
    const result = await sendEmail({
      to,
      subject: "✅ Test Email từ Biznoco SMTP",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <img src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
               alt="Biznoco" style="height:36px;width:auto;margin-bottom:24px" />
          <h2 style="color:#0f172a">SMTP hoạt động tốt! ✅</h2>
          <p style="color:#475569;line-height:1.6">
            Email này được gửi từ <strong>Biznoco Admin Panel</strong> qua Resend SMTP.<br />
            Sender: <code>noreply@biznoco.com</code>
          </p>
          <p style="color:#94a3b8;font-size:13px;margin-top:24px">
            Biznoco · app.biznoco.com
          </p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true, id: result?.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[test-email] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
