import { Resend } from "resend";

// Đọc tại runtime (không cache ở module level) để tránh warm-Lambda issue
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY chưa được cấu hình trong Vercel.");
  return new Resend(key);
}

function getFromEmail(): string {
  return process.env.EMAIL_FROM ?? "Biznoco <noreply@biznoco.com>";
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

// ── Core send function ────────────────────────────────────────────────────────

export async function sendEmail(opts: SendEmailOptions) {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: getFromEmail(),
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo,
  });

  if (error) {
    console.error("[email] send error:", error);
    throw new Error(error.message);
  }
  return data;
}

// ── Template helpers ──────────────────────────────────────────────────────────

/**
 * Gửi mã kích hoạt cho user — admin gọi khi cấp quyền truy cập.
 */
export async function sendActivationCodeEmail(to: string, code: string) {
  return sendEmail({
    to,
    subject: "🔑 Mã kích hoạt tài khoản Biznoco của bạn",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <img src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
             alt="Biznoco" style="height:36px;width:auto;margin-bottom:24px" />
        <h2 style="color:#0f172a;margin:0 0 12px">Tài khoản của bạn đã được phê duyệt!</h2>
        <p style="color:#475569;line-height:1.6">
          Admin đã cấp cho bạn mã kích hoạt để mở khóa <strong>Biznoco Creative Analytics</strong>.
          Nhập mã bên dưới vào trang kích hoạt để bắt đầu sử dụng.
        </p>
        <div style="margin:24px 0;padding:20px;background:#f8fafc;border:2px dashed #e2e8f0;border-radius:12px;text-align:center">
          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Mã kích hoạt</p>
          <p style="margin:0;font-size:28px;font-weight:700;font-family:monospace;color:#0f172a;letter-spacing:3px">${code}</p>
        </div>
        <a href="https://app.biznoco.com/activate"
           style="display:inline-block;padding:12px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
          Kích hoạt tài khoản →
        </a>
        <p style="margin-top:20px;color:#64748b;font-size:13px;line-height:1.6">
          Hoặc truy cập trực tiếp: <a href="https://app.biznoco.com/activate" style="color:#2563eb">app.biznoco.com/activate</a><br />
          Mã chỉ dùng được <strong>1 lần</strong> và gắn với tài khoản của bạn.
        </p>
        <hr style="margin:28px 0;border:none;border-top:1px solid #e2e8f0" />
        <p style="color:#94a3b8;font-size:12px">
          Biznoco · app.biznoco.com<br />
          Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.
        </p>
      </div>
    `,
  });
}

/**
 * Gửi email chào mừng khi user đăng ký lần đầu.
 */
export async function sendWelcomeEmail(to: string, name?: string) {
  return sendEmail({
    to,
    subject: "Chào mừng bạn đến với Biznoco! 🎉",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <img src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
             alt="Biznoco" style="height:36px;width:auto;margin-bottom:24px" />
        <h2 style="color:#0f172a;margin:0 0 12px">
          Xin chào${name ? ` ${name}` : ""}! 👋
        </h2>
        <p style="color:#475569;line-height:1.6">
          Cảm ơn bạn đã đăng ký <strong>Biznoco Creative Analytics</strong>.
          Bạn có thể bắt đầu phân tích Hook Rate, Hold Rate và ROAS cho
          các Facebook Ads creative của mình ngay bây giờ.
        </p>
        <a href="https://app.biznoco.com/creatives"
           style="display:inline-block;margin-top:20px;padding:12px 24px;
                  background:#2563eb;color:#fff;border-radius:8px;
                  text-decoration:none;font-weight:600">
          Vào Dashboard →
        </a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0" />
        <p style="color:#94a3b8;font-size:13px">
          Biznoco · app.biznoco.com<br />
          Bạn nhận email này vì đã đăng ký tài khoản tại Biznoco.
        </p>
      </div>
    `,
  });
}

/**
 * Gửi email thông báo khi kết nối Meta Ads thành công.
 */
export async function sendMetaConnectedEmail(to: string, accountName: string) {
  return sendEmail({
    to,
    subject: "✅ Kết nối Meta Ads thành công",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <img src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
             alt="Biznoco" style="height:36px;width:auto;margin-bottom:24px" />
        <h2 style="color:#0f172a;margin:0 0 12px">
          Tài khoản Meta Ads đã kết nối!
        </h2>
        <p style="color:#475569;line-height:1.6">
          Tài khoản <strong>${accountName}</strong> đã được kết nối thành công.
          Dữ liệu creative sẽ được đồng bộ tự động.
        </p>
        <a href="https://app.biznoco.com/creatives"
           style="display:inline-block;margin-top:20px;padding:12px 24px;
                  background:#2563eb;color:#fff;border-radius:8px;
                  text-decoration:none;font-weight:600">
          Xem Creatives →
        </a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0" />
        <p style="color:#94a3b8;font-size:13px">Biznoco · app.biznoco.com</p>
      </div>
    `,
  });
}

/**
 * Gửi email cảnh báo khi creative có hiệu suất kém.
 */
export async function sendPerformanceAlertEmail(
  to: string,
  creativeName: string,
  metric: string,
  value: string,
) {
  return sendEmail({
    to,
    subject: `⚠️ Cảnh báo hiệu suất: ${creativeName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <img src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
             alt="Biznoco" style="height:36px;width:auto;margin-bottom:24px" />
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:20px">
          <h3 style="color:#991b1b;margin:0 0 8px">⚠️ Cảnh báo hiệu suất</h3>
          <p style="color:#7f1d1d;margin:0">
            Creative <strong>${creativeName}</strong> có <strong>${metric}</strong> = <strong>${value}</strong>
            — thấp hơn ngưỡng khuyến nghị.
          </p>
        </div>
        <a href="https://app.biznoco.com/creatives"
           style="display:inline-block;padding:12px 24px;
                  background:#dc2626;color:#fff;border-radius:8px;
                  text-decoration:none;font-weight:600">
          Kiểm tra ngay →
        </a>
        <hr style="margin:32px 0;border:none;border-top:1px solid #e2e8f0" />
        <p style="color:#94a3b8;font-size:13px">Biznoco · app.biznoco.com</p>
      </div>
    `,
  });
}
