import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { sendActivationCodeEmail } from "@/lib/email";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bỏ 0/O/1/I dễ nhầm
  const year = new Date().getFullYear();
  const rand = Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
  return `BIZ-${year}-${rand}`;
}

/**
 * POST /api/admin/send-activation
 * Body: { email: string, notes?: string }
 * Admin-only: tạo code mới trong DB và gửi email kích hoạt cho user.
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
  const email: string = (body.email ?? "").trim().toLowerCase();
  const notes: string = (body.notes ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
  }

  // Tạo code duy nhất — retry tối đa 3 lần nếu trùng
  const admin = getSupabaseAdmin();
  let code = "";
  for (let i = 0; i < 3; i++) {
    code = generateCode();
    const { error } = await admin.from("activation_codes").insert({
      code,
      notes: notes || `Gửi cho ${email}`,
      max_uses: 1,
      created_by: user.id,
    });
    if (!error) break;
    if (i === 2) {
      return NextResponse.json(
        { error: "Không thể tạo code, thử lại." },
        { status: 500 }
      );
    }
  }

  // Gửi email
  try {
    await sendActivationCodeEmail(email, code);
  } catch (err: unknown) {
    // Code đã được insert — trả về code để admin có thể gửi thủ công
    const msg = err instanceof Error ? err.message : "Email error";
    console.error("[send-activation] email failed:", msg);
    return NextResponse.json(
      { ok: false, code, error: `Code đã tạo (${code}) nhưng gửi email thất bại: ${msg}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, code });
}
