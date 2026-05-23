import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">
            Chào mừng đến <span style={{
              background: "var(--grad-brand)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}>Biznoco</span> 👋
          </h1>
          <p className="page-sub">
            Bộ công cụ AI Marketing tất-cả-trong-một: phân tích chiến dịch Facebook Ads,
            trích xuất dữ liệu khách hàng từ dataset, và chatbot AI chốt sale tự động.
          </p>
        </div>
        <div className="row">
          <span className="tag tag-brand">● Đang hoạt động</span>
          <span className="tag">v0.1.0</span>
        </div>
      </div>

      <div className="grid grid-stats">
        <Stat label="Chiến dịch theo dõi" value="—" hint="Tải báo cáo để bắt đầu" />
        <Stat label="Bản ghi đã trích xuất" value="—" hint="Upload dataset để xem" />
        <Stat label="Hội thoại AI" value="0" hint="Bot sẵn sàng" />
        <Stat label="API key đã cấu hình" value="—" hint="Vào trang AI Sales Bot" />
      </div>

      <div className="hub-grid">
        <Link href="/ads" className="hub-card">
          <div className="hub-icon">▲</div>
          <div className="hub-title">Báo cáo Facebook Ads</div>
          <div className="hub-desc">
            Tải file CSV xuất từ Ads Manager, xem ngay dashboard hiệu suất với biểu đồ trực quan.
          </div>
          <ul className="hub-list">
            <li>Phân tích Impressions, Reach, CTR, CPC, CPM</li>
            <li>So sánh hiệu quả giữa các chiến dịch</li>
            <li>Tính ROAS và doanh thu ước tính</li>
            <li>Xếp hạng và lọc chiến dịch theo metric</li>
          </ul>
          <div className="hub-cta">Vào báo cáo →</div>
        </Link>

        <Link href="/dataset" className="hub-card alt">
          <div className="hub-icon">◆</div>
          <div className="hub-title">Trích xuất Dataset Facebook</div>
          <div className="hub-desc">
            Parse dữ liệu khách hàng, lead, conversion từ file CSV/JSON xuất từ Facebook.
          </div>
          <ul className="hub-list">
            <li>Phát hiện email, số điện thoại tự động</li>
            <li>Lọc theo nguồn, ngày, sự kiện</li>
            <li>Khử trùng lặp (dedupe) thông minh</li>
            <li>Export ra CSV chuẩn import Excel/CRM</li>
          </ul>
          <div className="hub-cta">Bắt đầu trích xuất →</div>
        </Link>

        <Link href="/chatbot" className="hub-card alt2">
          <div className="hub-icon">●</div>
          <div className="hub-title">AI Sales Chatbot</div>
          <div className="hub-desc">
            Chatbot AI đa nền tảng (OpenAI, Anthropic, Gemini) để tư vấn sản phẩm và chốt sale.
          </div>
          <ul className="hub-list">
            <li>Kết nối OpenAI · Anthropic · Gemini</li>
            <li>Knowledge base sản phẩm của bạn</li>
            <li>Kịch bản chốt sale tích hợp sẵn</li>
            <li>Lưu lịch sử hội thoại để học tập</li>
          </ul>
          <div className="hub-cta">Mở chatbot →</div>
        </Link>
      </div>

      <div style={{ marginTop: 32 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Bắt đầu nhanh trong 3 bước</div>
          </div>
          <div className="grid grid-2">
            <Step n={1} title="Phân tích chiến dịch hiện có" body="Vào Ads Manager → Export → tải file CSV vào trang “Báo cáo Ads” của Biznoco." />
            <Step n={2} title="Tổng hợp lead từ Facebook" body="Tải dataset (CSV/JSON) từ Lead Ads / Events Manager vào trang “Trích xuất Data”." />
            <Step n={3} title="Triển khai chatbot bán hàng" body="Vào “AI Sales Bot”, dán API key, mô tả sản phẩm — chatbot tự động tư vấn 24/7." />
            <Step n={4} title="Tinh chỉnh & lặp lại" body="Mỗi tuần đối chiếu hiệu quả Ads với số lead chốt được từ chatbot, tối ưu ngân sách." />
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-delta">{hint}</div>}
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "var(--grad-brand)",
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
        <div style={{ color: "var(--text-2)", fontSize: 13 }}>{body}</div>
      </div>
    </div>
  );
}
