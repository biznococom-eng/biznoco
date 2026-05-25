import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer, isSupabaseConfiguredServer } from "@/lib/supabase/server";
import {
  BarChart3,
  TrendingUp,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Play,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Biznoco — Dashboard báo cáo Facebook Ads cho chủ doanh nghiệp",
  description:
    "Phân tích Hook Rate, Hold Rate, CTR, ROAS theo từng creative. Biết ngay đâu đang lãng phí tiền, AI đề xuất tối ưu ngay hôm nay.",
};

export default async function LandingPage() {
  // Nếu đã đăng nhập → vào dashboard ngay
  if (isSupabaseConfiguredServer) {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/creatives");
  }

  return (
    <div className="min-h-screen bg-[#080c18] text-white overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#080c18]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
              alt="Biznoco"
              className="h-8 w-auto"
            />
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium text-white/60 md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-white">Cách dùng</a>
            <a href="#features" className="transition-colors hover:text-white">Tính năng</a>
            <a href="#pricing" className="transition-colors hover:text-white">Bảng giá</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white sm:block"
            >
              Đăng nhập
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 sm:px-4"
            >
              <span className="sm:hidden">Dùng miễn phí</span>
              <span className="hidden sm:inline">Dùng miễn phí →</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-15%] top-[-10%] h-[700px] w-[700px] rounded-full bg-blue-600/15 blur-[150px]" />
          <div className="absolute right-[-10%] top-[20%] h-[500px] w-[500px] rounded-full bg-violet-600/12 blur-[120px]" />
          <div className="absolute bottom-[-5%] left-[30%] h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left: text */}
            <div>
              {/* Live badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 sm:px-4 sm:py-2 sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Live data · Meta Marketing API · Real-time
              </div>

              <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
                Dashboard báo cáo
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                  Facebook Ads
                </span>
                <br />
                cho chủ doanh nghiệp
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-white/55">
                Không cần biết về marketing. Biznoco tự phân tích chiến dịch,
                chỉ ra đâu đang lãng phí tiền và AI đề xuất hành động tối ưu
                ngay hôm nay.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 hover:gap-3"
                >
                  Bắt đầu miễn phí
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
                >
                  Đăng nhập
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6">
                {[
                  { n: "10+", label: "Chiến dịch đã phân tích" },
                  { n: "4×", label: "CTR so chuẩn ngành" },
                  { n: "56%", label: "CPC thấp hơn thị trường" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-extrabold text-white">{s.n}</div>
                    <div className="mt-0.5 text-xs text-white/45">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Demo report card */}
            <div className="relative">
              <ReportCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── Logos / trust bar ──────────────────────────────────────────── */}
      <section className="border-y border-white/6 bg-white/[0.02] py-6">
        <div className="mx-auto max-w-7xl px-5">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-white/25">
            Dữ liệu từ Meta Marketing API
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {["Meta Business", "Facebook Ads", "Instagram Ads", "Messenger Ads"].map((p) => (
              <span key={p} className="text-sm font-bold text-white/60 tracking-wide">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Cách hoạt động
            </p>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
              3 bước để có báo cáo
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                chuyên nghiệp mỗi ngày
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/50">
              Không cần Excel. Không cần agency. Biznoco tự làm tất cả.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Kết nối tài khoản Meta",
                desc: "Đăng nhập Meta Business, cấp quyền cho Biznoco. Hệ thống tự kéo toàn bộ dữ liệu chiến dịch — chỉ mất 2 phút.",
                icon: Users,
                color: "from-blue-500/20 to-blue-600/10 border-blue-500/20",
                iconColor: "text-blue-400 bg-blue-500/15",
              },
              {
                step: "2",
                title: "Biznoco tự phân tích",
                desc: "Tự động tính CTR, CPC, CPM, Hook Rate, Hold Rate, ROAS — theo từng creative video & hình ảnh. Cập nhật real-time.",
                icon: BarChart3,
                color: "from-violet-500/20 to-violet-600/10 border-violet-500/20",
                iconColor: "text-violet-400 bg-violet-500/15",
              },
              {
                step: "3",
                title: "Báo cáo & tối ưu ngay",
                desc: "Nhận báo cáo rõ ràng: creative nào đang hiệu quả, cái nào đốt ngân sách. AI gợi ý hành động tối ưu tức thì.",
                icon: Zap,
                color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20",
                iconColor: "text-emerald-400 bg-emerald-500/15",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className={`relative rounded-2xl border bg-gradient-to-br p-7 ${item.color}`}
                >
                  <div className="mb-5 flex items-center gap-4">
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl font-extrabold ${item.iconColor}`}>
                      {item.step}
                    </div>
                    <div className={`grid h-9 w-9 place-items-center rounded-lg ${item.iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mb-2.5 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-white/55">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Tính năng nổi bật
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight">
              Phân tích sâu từng chỉ số
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/50">
              Không chỉ xem số — hiểu ý nghĩa từng metric và biết phải làm gì tiếp theo.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                metric: "Hook Rate",
                value: "72%",
                delta: "+12%",
                desc: "Tỷ lệ người xem video tới giây thứ 3. Đo lường sức hút của phần mở đầu creative.",
                color: "emerald",
              },
              {
                metric: "Hold Rate",
                value: "45%",
                delta: "+8%",
                desc: "Trong số người vượt 3s, bao nhiêu % xem đến mốc 25%. Đánh giá độ giữ chân nội dung.",
                color: "blue",
              },
              {
                metric: "CTR",
                value: "4.60%",
                delta: "4× ngành",
                desc: "Tỷ lệ click vào link. Chuẩn ngành ~1%, Biznoco giúp bạn đạt 4× so với đối thủ.",
                color: "cyan",
              },
              {
                metric: "ROAS",
                value: "3.8×",
                delta: "+0.6×",
                desc: "Return on Ad Spend — doanh thu trên mỗi đồng chi phí quảng cáo. Biết creative nào đáng scale.",
                color: "violet",
              },
            ].map((f) => (
              <MetricCard key={f.metric} {...f} />
            ))}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <FeatureHighlight
              icon={<TrendingUp className="h-5 w-5" />}
              title="Funnel Retention chi tiết"
              desc="Xem chính xác tỷ lệ drop-off tại mỗi mốc 3s → 25% → 50% → 75% → 100% cho từng creative video."
              color="blue"
            />
            <FeatureHighlight
              icon={<BarChart3 className="h-5 w-5" />}
              title="CTR theo độ tuổi & giới tính"
              desc="Phân tích audience nào đang phản hồi tốt nhất với creative của bạn — để target chính xác hơn."
              color="violet"
            />
            <FeatureHighlight
              icon={<Zap className="h-5 w-5" />}
              title="AI gợi ý tối ưu real-time"
              desc="Hệ thống tự phát hiện creative đang waste budget và đề xuất hành động cụ thể: tăng bid, scale, hay tắt."
              color="amber"
            />
            <FeatureHighlight
              icon={<Shield className="h-5 w-5" />}
              title="Multi-account & xuất PDF"
              desc="Quản lý nhiều Ad Account, xuất báo cáo PDF chuyên nghiệp để chia sẻ với team hoặc khách hàng."
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* ── Demo report showcase ────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
                Ví dụ báo cáo thực tế
              </p>
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
                Báo cáo rõ ràng,{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  quyết định nhanh
                </span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/55">
                Không cần chuyên gia marketing. Nhìn vào dashboard là biết ngay:
                chiến dịch nào hiệu quả, nhóm tuổi nào chuyển đổi tốt nhất,
                và nên scale hay tắt creative nào.
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  "CTR 4,60% — gấp 4× chuẩn ngành ~1%",
                  "CPC 2.192đ — tiết kiệm 56% so thị trường",
                  "Nhóm 65+ có CTR cao nhất: 10,53%",
                  "10 hội thoại Messenger với chi phí 19.948đ/cuộc",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-500"
              >
                Tạo báo cáo của tôi
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Detailed report card */}
            <div className="relative">
              <DetailedReportCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Bảng giá
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight">
              Bắt đầu miễn phí, nâng cấp khi cần
            </h2>
            <p className="mt-4 text-base text-white/50">
              Mọi gói đều có quyền truy cập dashboard & báo cáo cơ bản.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "Miễn phí",
                highlight: false,
                features: ["1 chiến dịch phân tích", "Dashboard cơ bản", "Báo cáo 7 ngày"],
                cta: "Bắt đầu miễn phí",
                href: "/signup",
              },
              {
                name: "Base",
                price: "$29",
                period: "/tháng",
                highlight: true,
                badge: "Phổ biến nhất",
                features: ["10 chiến dịch", "Lưu lịch sử", "Xuất PDF", "AI gợi ý", "Hỗ trợ email"],
                cta: "Dùng thử 14 ngày",
                href: "/signup",
              },
              {
                name: "Ultra",
                price: "$79",
                period: "/tháng",
                highlight: false,
                features: ["Không giới hạn", "Multi-account", "Hỗ trợ ưu tiên", "API access", "White-label"],
                cta: "Liên hệ",
                href: "mailto:hello@biznoco.com",
              },
            ].map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/15 via-cyan-500/8 to-violet-600/10 px-8 py-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[10%] top-[-20%] h-[300px] w-[300px] rounded-full bg-blue-500/20 blur-[80px]" />
              <div className="absolute right-[10%] bottom-[-20%] h-[250px] w-[250px] rounded-full bg-violet-500/15 blur-[70px]" />
            </div>

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/70">
                <Play className="h-3.5 w-3.5 fill-current text-blue-400" />
                Miễn phí · Không cần thẻ tín dụng
              </div>
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
                Bắt đầu phân tích
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                  Facebook Ads ngay hôm nay
                </span>
              </h2>
              <p className="mt-4 text-base text-white/50">
                Tham gia cùng các chủ doanh nghiệp đang dùng Biznoco để tối ưu ngân sách quảng cáo.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-blue-600/40 transition-all hover:bg-blue-500 hover:gap-3"
                >
                  Tạo tài khoản miễn phí
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                >
                  Đã có tài khoản? Đăng nhập →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-10">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
                alt="Biznoco"
                className="h-7 w-auto opacity-70"
              />
            </Link>
            <p className="text-xs text-white/30">
              © 2026 Biznoco. Dashboard báo cáo Facebook Ads cho chủ doanh nghiệp Việt.
            </p>
            <div className="flex items-center gap-5 text-xs text-white/40">
              <a href="mailto:hello@biznoco.com" className="hover:text-white transition-colors">
                hello@biznoco.com
              </a>
              <Link href="/login" className="hover:text-white transition-colors">Đăng nhập</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Đăng ký</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function ReportCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm md:max-w-none">
      <div className="pointer-events-none absolute inset-0 -m-8 rounded-3xl bg-blue-500/10 blur-[60px]" />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1220]/90 shadow-2xl backdrop-blur-sm">
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex shrink-0 gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500/60" />
              <div className="h-2 w-2 rounded-full bg-yellow-500/60" />
              <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
            </div>
            <span className="truncate text-[11px] font-semibold text-white/45">
              Biznoco · Báo cáo chiến dịch
            </span>
          </div>
          <span className="ml-2 flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Campaign info */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
            Ví dụ báo cáo thực tế
          </p>
          <h3 className="mt-0.5 text-base font-extrabold text-white sm:text-xl">
            Chiến dịch BĐS Di Linh
          </h3>
          <p className="text-xs font-semibold text-blue-400">22–24/05/2026</p>
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-2 gap-px bg-white/5 mx-4 overflow-hidden rounded-xl mb-3">
          {[
            { label: "CHI TIÊU", value: "199.483đ", sub: "100K/ngày", color: "text-blue-400" },
            { label: "CTR", value: "4,60%", sub: "↑ 4× ngành ~1%", color: "text-emerald-400" },
            { label: "CPC", value: "2.192đ", sub: "↓ 56% vs ttị", color: "text-cyan-400" },
            { label: "MESSENGER", value: "10", sub: "19.948đ / hội thoại", color: "text-violet-400" },
          ].map((m) => (
            <div key={m.label} className="bg-white/[0.03] p-3">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/35">{m.label}</p>
              <p className={`mt-0.5 text-lg font-extrabold tabular-nums sm:text-2xl ${m.color}`}>{m.value}</p>
              <p className="mt-0.5 text-[10px] text-white/40">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* CTR by age */}
        <div className="mx-4 mb-4 rounded-xl border border-white/8 bg-white/[0.02] p-3">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-white/35">
            CTR theo độ tuổi
          </p>
          <div className="space-y-2">
            {[
              { age: "18–24", pct: 2.90, bar: 28, special: false },
              { age: "25–34", pct: 2.85, bar: 27, special: false },
              { age: "35–44", pct: 3.29, bar: 31, special: false },
              { age: "45–54 🔥", pct: 6.18, bar: 59, special: true },
              { age: "55–64", pct: 4.41, bar: 42, special: false },
              { age: "65+ 👑", pct: 10.53, bar: 100, special: true },
            ].map((row) => (
              <div key={row.age} className="flex items-center gap-2">
                <span className={`w-16 shrink-0 text-[10px] tabular-nums ${row.special ? "font-bold text-amber-300" : "text-white/45"}`}>
                  {row.age}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-white/8 h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${row.special ? "bg-gradient-to-r from-amber-400 to-emerald-400" : "bg-blue-500/60"}`}
                    style={{ width: `${row.bar}%` }}
                  />
                </div>
                <span className={`w-10 text-right text-[10px] tabular-nums font-semibold ${row.special ? "text-emerald-400" : "text-white/50"}`}>
                  {row.pct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailedReportCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1220]/90 shadow-2xl">
      <div className="pointer-events-none absolute inset-0 -m-4 bg-violet-500/8 blur-[50px]" />
      <div className="relative">
        <div className="border-b border-white/8 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40">Chiến dịch · Tháng 5/2026</p>
              <p className="text-base font-bold text-white">BĐS Di Linh — Video Hook</p>
            </div>
            <span className="rounded-lg bg-blue-500/15 px-2.5 py-1 text-xs font-bold text-blue-400">ĐANG CHẠY</span>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-3 gap-px bg-white/5 mx-5 mt-4 overflow-hidden rounded-xl">
          {[
            { label: "Hook Rate", value: "72%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Hold Rate", value: "45%", color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Completion", value: "12%", color: "text-violet-400", bg: "bg-violet-500/10" },
          ].map((k) => (
            <div key={k.label} className={`${k.bg} py-4 text-center`}>
              <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
              <p className="mt-0.5 text-[10px] text-white/40">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Retention funnel */}
        <div className="m-5 rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/35">
            Retention Funnel
          </p>
          <div className="space-y-2">
            {[
              { label: "Impressions", pct: 100, color: "bg-white/20" },
              { label: "3s View (Hook)", pct: 72, color: "bg-emerald-500" },
              { label: "25% View", pct: 45, color: "bg-blue-500" },
              { label: "50% View", pct: 31, color: "bg-violet-500" },
              { label: "75% View", pct: 19, color: "bg-amber-500" },
              { label: "100% View", pct: 12, color: "bg-red-500" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2.5">
                <span className="w-28 shrink-0 text-[10px] text-white/40">{row.label}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-white/5 h-2">
                  <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                </div>
                <span className="w-8 text-right text-[10px] font-semibold tabular-nums text-white/60">{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI insight */}
        <div className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3.5">
          <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-500/30 text-sm">
            🤖
          </div>
          <div>
            <p className="text-[11px] font-bold text-violet-300">AI Gợi ý tối ưu</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">
              Hook rate 72% xuất sắc. Scale ngân sách ×2 cho creative này — ROAS 3.8× đang rất tốt. Nhóm 65+ đang convert mạnh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  metric, value, delta, desc, color,
}: {
  metric: string; value: string; delta: string; desc: string; color: string;
}) {
  const colors: Record<string, string> = {
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
    cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
    violet: "border-violet-500/20 bg-violet-500/5 text-violet-400",
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div className={`rounded-2xl border p-5 ${c.split(" ")[0]} bg-white/[0.03]`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">{metric}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.split(" ").slice(1).join(" ")}`}>
          {delta}
        </span>
      </div>
      <p className={`text-3xl font-extrabold tabular-nums ${c.split(" ")[2]}`}>{value}</p>
      <p className="mt-3 text-xs leading-relaxed text-white/45">{desc}</p>
    </div>
  );
}

function FeatureHighlight({
  icon, title, desc, color,
}: {
  icon: React.ReactNode; title: string; desc: string; color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/15",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/15",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/15",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div className="flex gap-5 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${c}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-white/50">{desc}</p>
      </div>
    </div>
  );
}

function PricingCard({
  name, price, period, highlight, badge, features, cta, href,
}: {
  name: string; price: string; period?: string; highlight?: boolean; badge?: string;
  features: string[]; cta: string; href: string;
}) {
  return (
    <div className={`relative flex flex-col rounded-2xl border p-7 ${
      highlight
        ? "border-blue-500/40 bg-blue-600/8 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20"
        : "border-white/10 bg-white/[0.03]"
    }`}>
      {badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
            {badge}
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <div className="mt-3 flex items-end gap-1">
          <span className="text-3xl font-extrabold text-white">{price}</span>
          {period && <span className="mb-1 text-sm text-white/40">{period}</span>}
        </div>
      </div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-white/65">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`rounded-xl py-3 text-center text-sm font-bold transition-all ${
          highlight
            ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30"
            : "border border-white/15 text-white/70 hover:bg-white/8 hover:text-white"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
