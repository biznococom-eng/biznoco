import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer, isSupabaseConfiguredServer } from "@/lib/supabase/server";
import {
  BarChart3,
  TrendingUp,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Eye,
  Target,
  DollarSign,
  Flame,
} from "lucide-react";

export const metadata = {
  title: "Biznoco — Dashboard báo cáo Facebook Ads cho chủ doanh nghiệp",
  description:
    "Phân tích Hook Rate, Hold Rate, CTR, ROAS theo từng creative. Biết ngay đâu đang lãng phí tiền, AI đề xuất tối ưu ngay hôm nay.",
};

export default async function LandingPage() {
  if (isSupabaseConfiguredServer) {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/creatives");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070b16] text-white antialiased">
      {/* ─── Navbar ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#070b16]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
              alt="Biznoco"
              className="h-7 w-auto sm:h-8"
            />
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-white/55 md:flex">
            <a href="#how" className="transition-colors hover:text-white">Cách dùng</a>
            <a href="#features" className="transition-colors hover:text-white">Tính năng</a>
            <a href="#pricing" className="transition-colors hover:text-white">Bảng giá</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-white/65 transition-colors hover:text-white sm:block"
            >
              Đăng nhập
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 sm:px-4 sm:py-2.5"
            >
              Dùng miễn phí
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-12 pt-10 sm:pb-20 sm:pt-16 lg:pb-28 lg:pt-20">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px] sm:h-[700px] sm:w-[700px]" />
          <div className="absolute right-[-20%] top-[10%] h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[100px]" />
          <div className="absolute bottom-0 left-[-10%] h-[350px] w-[350px] rounded-full bg-violet-600/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-10">
            {/* ─ Hero copy ─ */}
            <div className="text-center lg:text-left">
              {/* Live badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-sm sm:mb-6 sm:text-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live · Meta Marketing API
              </div>

              <h1 className="mx-auto max-w-xl text-[2.25rem] font-black leading-[1.05] tracking-tight sm:text-5xl lg:mx-0 lg:text-6xl">
                Báo cáo{" "}
                <span className="relative inline-block">
                  <span className="relative bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                    Facebook Ads
                  </span>
                </span>
                <br />
                tự động, dễ hiểu
              </h1>

              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/55 sm:mt-6 sm:text-lg lg:mx-0">
                Không cần biết marketing. Biznoco chỉ ra đâu đang lãng phí tiền và AI đề xuất hành động tối ưu ngay hôm nay.
              </p>

              {/* CTA */}
              <div className="mt-7 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:gap-4 lg:items-start">
                <Link
                  href="/signup"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 text-base font-bold text-white shadow-2xl shadow-blue-600/40 transition-all hover:shadow-blue-500/60 sm:w-auto sm:py-3.5"
                >
                  Bắt đầu miễn phí
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#how"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-6 py-4 text-base font-semibold text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white sm:w-auto sm:py-3.5"
                >
                  Xem cách dùng
                </Link>
              </div>

              {/* Quick proof */}
              <div className="mt-8 flex items-center justify-center gap-5 text-xs text-white/45 sm:mt-10 sm:justify-start sm:gap-6 sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Không cần thẻ
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Setup 2 phút
                </div>
              </div>
            </div>

            {/* ─ Hero visual ─ */}
            <div className="relative">
              <HeroCard />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust strip ─────────────────────────────────────── */}
      <section className="border-y border-white/[0.05] bg-white/[0.015] py-5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 sm:text-xs">
            Dữ liệu từ Meta Marketing API chính chủ
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 opacity-50 sm:gap-x-8">
            {["Meta Business", "Facebook Ads", "Instagram Ads", "Messenger Ads"].map((p) => (
              <span key={p} className="text-xs font-bold tracking-wide text-white/55 sm:text-sm">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ────────────────────────────────────── */}
      <section id="how" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400 sm:text-sm">
              Cách hoạt động
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Báo cáo pro,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                trong 3 bước
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/50 sm:mt-4 sm:max-w-lg sm:text-base">
              Không cần Excel. Không cần agency. Biznoco tự làm tất cả.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Kết nối Meta",
                desc: "Đăng nhập Meta Business, cấp quyền — Biznoco tự kéo toàn bộ dữ liệu chiến dịch trong 2 phút.",
                accent: "blue" as const,
              },
              {
                step: "02",
                title: "AI phân tích",
                desc: "Tự tính Hook Rate, Hold Rate, CTR, CPC, ROAS theo từng creative video & hình ảnh. Real-time.",
                accent: "violet" as const,
              },
              {
                step: "03",
                title: "Hành động",
                desc: "Biết creative nào nên scale, cái nào nên tắt. AI đưa gợi ý cụ thể — bạn chỉ cần click.",
                accent: "emerald" as const,
              },
            ].map((item) => (
              <StepCard key={item.step} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features (metrics) ──────────────────────────────── */}
      <section id="features" className="relative py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400 sm:text-sm">
              Phân tích sâu
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              4 chỉ số quyết định
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                creative thắng hay thua
              </span>
            </h2>
          </div>

          <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Eye,
                metric: "Hook Rate",
                value: "72%",
                delta: "+12%",
                desc: "% người không lướt qua 3 giây đầu",
                color: "emerald",
              },
              {
                icon: Target,
                metric: "Hold Rate",
                value: "45%",
                delta: "+8%",
                desc: "% giữ chân đến mốc 25% video",
                color: "blue",
              },
              {
                icon: TrendingUp,
                metric: "CTR",
                value: "4,6%",
                delta: "4× ngành",
                desc: "Click-through rate trên link CTA",
                color: "cyan",
              },
              {
                icon: DollarSign,
                metric: "ROAS",
                value: "3,8×",
                delta: "+0,6×",
                desc: "Doanh thu / chi phí quảng cáo",
                color: "violet",
              },
            ].map((f) => (
              <MetricCard key={f.metric} {...f} />
            ))}
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid gap-3.5 sm:mt-12 sm:gap-4 md:grid-cols-2">
            <FeatureRow
              icon={BarChart3}
              title="Funnel retention chi tiết"
              desc="Drop-off tại mỗi mốc 3s → 25% → 50% → 75% → 100% cho từng creative."
              color="blue"
            />
            <FeatureRow
              icon={Sparkles}
              title="AI tối ưu real-time"
              desc="Phát hiện creative đang waste budget, đề xuất scale, tăng bid hoặc tắt ngay."
              color="violet"
            />
            <FeatureRow
              icon={Flame}
              title="Audience insights"
              desc="CTR theo độ tuổi & giới tính — biết nhóm nào đang phản hồi tốt nhất."
              color="amber"
            />
            <FeatureRow
              icon={Zap}
              title="Multi-account & PDF"
              desc="Quản lý nhiều Ad Account, xuất báo cáo PDF chuyên nghiệp cho team/khách hàng."
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* ─── Demo report showcase ────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12">
            <div className="text-center lg:text-left">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400 sm:text-sm">
                Ví dụ thực tế
              </p>
              <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Báo cáo rõ ràng,{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  quyết định nhanh
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/55 sm:text-base lg:mx-0">
                Nhìn dashboard là biết: chiến dịch nào hiệu quả, nhóm tuổi nào convert tốt, scale hay tắt creative nào.
              </p>

              <ul className="mx-auto mt-6 max-w-sm space-y-2.5 text-left sm:mt-8 lg:mx-0 lg:max-w-none">
                {[
                  ["CTR 4,60%", "gấp 4× chuẩn ngành ~1%"],
                  ["CPC 2.192đ", "tiết kiệm 56% so thị trường"],
                  ["Nhóm 65+", "CTR cao nhất 10,53%"],
                  ["10 hội thoại", "19.948đ / cuộc Messenger"],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white">{k}</span>{" "}
                      <span className="text-white/55">— {v}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:shadow-blue-500/50"
              >
                Tạo báo cáo của tôi
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="relative">
              <DetailReport />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-x-0 bg-gradient-to-b from-transparent via-blue-500/[0.03] to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-14">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400 sm:text-sm">
              Bảng giá
            </p>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Bắt đầu miễn phí,
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                nâng cấp khi cần
              </span>
            </h2>
          </div>

          <div className="mx-auto grid max-w-md gap-4 sm:gap-5 md:max-w-none md:grid-cols-3 md:items-stretch">
            {[
              {
                name: "Free",
                price: "0₫",
                period: "mãi mãi",
                highlight: false,
                features: ["1 chiến dịch", "Dashboard cơ bản", "Báo cáo 7 ngày"],
                cta: "Bắt đầu miễn phí",
                href: "/signup",
              },
              {
                name: "Base",
                price: "$29",
                period: "/tháng",
                highlight: true,
                badge: "Phổ biến",
                features: ["10 chiến dịch", "Lưu lịch sử 12 tháng", "Xuất PDF", "AI gợi ý", "Hỗ trợ email"],
                cta: "Dùng thử 14 ngày",
                href: "/signup",
              },
              {
                name: "Ultra",
                price: "$79",
                period: "/tháng",
                highlight: false,
                features: ["Không giới hạn", "Multi-account", "API access", "White-label", "Hỗ trợ ưu tiên"],
                cta: "Liên hệ",
                href: "mailto:hello@biznoco.com",
              },
            ].map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────── */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-cyan-500/10 to-violet-600/20 px-6 py-12 text-center sm:rounded-[2rem] sm:px-10 sm:py-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/30 blur-[100px]" />
              <div className="absolute bottom-0 right-0 h-[200px] w-[200px] rounded-full bg-violet-500/30 blur-[80px]" />
            </div>

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-semibold text-white/75 sm:text-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                Miễn phí · Không cần thẻ tín dụng
              </div>
              <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Phân tích Facebook Ads
                <br />
                <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                  ngay hôm nay
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-white/55 sm:text-base">
                Tham gia cùng các chủ doanh nghiệp đang dùng Biznoco để tối ưu ngân sách.
              </p>

              <div className="mt-7 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/signup"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-blue-600/50 transition-all hover:shadow-blue-500/70 sm:w-auto"
                >
                  Tạo tài khoản miễn phí
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium text-white/55 transition-colors hover:text-white"
                >
                  Đã có tài khoản? Đăng nhập →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <Link href="/" className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
                alt="Biznoco"
                className="h-7 w-auto opacity-70"
              />
            </Link>
            <p className="text-xs text-white/35 sm:text-sm">
              © 2026 Biznoco · Dashboard Facebook Ads
            </p>
            <div className="flex items-center gap-4 text-xs text-white/45 sm:text-sm">
              <a href="mailto:hello@biznoco.com" className="hover:text-white">hello@biznoco.com</a>
              <Link href="/login" className="hover:text-white">Đăng nhập</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Sub-components                                               */
/* ─────────────────────────────────────────────────────────── */

function HeroCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 -m-6 rounded-[2rem] bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-violet-500/15 blur-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] shadow-2xl backdrop-blur-md">
        {/* Browser-like header */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <div className="ml-2 flex flex-1 items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 text-[10px] text-white/40">
            <span className="text-emerald-400">●</span>
            biznoco.com/dashboard
          </div>
        </div>

        {/* Campaign title */}
        <div className="px-5 pb-2 pt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300/80">
            Chiến dịch · 22–24/05
          </p>
          <h3 className="mt-1.5 text-xl font-black leading-tight text-white sm:text-2xl">
            BĐS Di Linh — Video Hook
          </h3>
        </div>

        {/* Hero KPI */}
        <div className="mx-5 mt-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/80">
                CTR
              </p>
              <p className="mt-0.5 text-4xl font-black tabular-nums text-emerald-300 sm:text-5xl">
                4,60<span className="text-2xl sm:text-3xl">%</span>
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
              ↑ 4× ngành
            </div>
          </div>
          <p className="mt-2 text-[11px] text-white/45">
            Chuẩn ngành ~1% · bạn đang ở top performer
          </p>
        </div>

        {/* 3 mini metrics */}
        <div className="mx-5 mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "Chi tiêu", value: "199K", color: "text-blue-300" },
            { label: "CPC", value: "2.192đ", color: "text-cyan-300" },
            { label: "Mess", value: "10", color: "text-violet-300" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-2.5"
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                {m.label}
              </p>
              <p className={`mt-0.5 text-sm font-black tabular-nums ${m.color} sm:text-base`}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* CTR by age — beautiful bars */}
        <div className="m-5 mt-4 rounded-2xl border border-white/[0.06] bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              CTR theo độ tuổi
            </p>
            <Flame className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="space-y-2">
            {[
              { age: "18–24", pct: 2.9, bar: 28, hot: false },
              { age: "25–34", pct: 2.85, bar: 27, hot: false },
              { age: "35–44", pct: 3.29, bar: 31, hot: false },
              { age: "45–54", pct: 6.18, bar: 59, hot: true },
              { age: "55–64", pct: 4.41, bar: 42, hot: false },
              { age: "65+", pct: 10.53, bar: 100, hot: true, top: true },
            ].map((r) => (
              <div key={r.age} className="flex items-center gap-2.5">
                <span
                  className={`w-10 shrink-0 text-[10px] font-bold tabular-nums ${
                    r.top ? "text-amber-300" : r.hot ? "text-amber-200/80" : "text-white/45"
                  }`}
                >
                  {r.age}
                </span>
                <div className="relative flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className={`h-1.5 rounded-full ${
                      r.top
                        ? "bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400"
                        : r.hot
                        ? "bg-gradient-to-r from-amber-400 to-amber-300"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500"
                    }`}
                    style={{ width: `${r.bar}%` }}
                  />
                </div>
                <span
                  className={`w-12 text-right text-[10px] font-bold tabular-nums ${
                    r.top ? "text-emerald-300" : "text-white/55"
                  }`}
                >
                  {r.pct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI insight */}
        <div className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-500/5 p-3">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-500/20 text-sm">
            ✨
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
              AI gợi ý
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-white/65">
              Nhóm 65+ convert mạnh — scale ngân sách ×2 cho audience này ngay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
  accent,
}: {
  step: string;
  title: string;
  desc: string;
  accent: "blue" | "violet" | "emerald";
}) {
  const colorMap = {
    blue: {
      border: "border-blue-500/25 hover:border-blue-400/40",
      bg: "from-blue-500/15 to-blue-500/[0.02]",
      text: "text-blue-300",
      glow: "shadow-blue-500/10",
    },
    violet: {
      border: "border-violet-500/25 hover:border-violet-400/40",
      bg: "from-violet-500/15 to-violet-500/[0.02]",
      text: "text-violet-300",
      glow: "shadow-violet-500/10",
    },
    emerald: {
      border: "border-emerald-500/25 hover:border-emerald-400/40",
      bg: "from-emerald-500/15 to-emerald-500/[0.02]",
      text: "text-emerald-300",
      glow: "shadow-emerald-500/10",
    },
  };
  const c = colorMap[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-xl transition-all sm:p-7 ${c.border} ${c.bg} ${c.glow}`}
    >
      <div className={`mb-4 text-5xl font-black tabular-nums ${c.text} opacity-80 sm:text-6xl`}>
        {step}
      </div>
      <h3 className="text-lg font-bold text-white sm:text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/55 sm:text-[15px]">{desc}</p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  metric,
  value,
  delta,
  desc,
  color,
}: {
  icon: typeof Eye;
  metric: string;
  value: string;
  delta: string;
  desc: string;
  color: string;
}) {
  const colors: Record<string, { border: string; bg: string; text: string; chip: string }> = {
    emerald: {
      border: "border-emerald-500/20",
      bg: "from-emerald-500/10 to-emerald-500/[0.02]",
      text: "text-emerald-300",
      chip: "bg-emerald-500/15 text-emerald-300",
    },
    blue: {
      border: "border-blue-500/20",
      bg: "from-blue-500/10 to-blue-500/[0.02]",
      text: "text-blue-300",
      chip: "bg-blue-500/15 text-blue-300",
    },
    cyan: {
      border: "border-cyan-500/20",
      bg: "from-cyan-500/10 to-cyan-500/[0.02]",
      text: "text-cyan-300",
      chip: "bg-cyan-500/15 text-cyan-300",
    },
    violet: {
      border: "border-violet-500/20",
      bg: "from-violet-500/10 to-violet-500/[0.02]",
      text: "text-violet-300",
      chip: "bg-violet-500/15 text-violet-300",
    },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div className={`relative rounded-2xl border bg-gradient-to-br p-5 ${c.border} ${c.bg}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${c.chip}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.chip}`}>
          {delta}
        </span>
      </div>
      <p className={`text-3xl font-black tabular-nums ${c.text} sm:text-4xl`}>{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/35">
        {metric}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-white/50">{desc}</p>
    </div>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: typeof Eye;
  title: string;
  desc: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    violet: "bg-violet-500/15 text-violet-300 border-violet-500/20",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.04]">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${c}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-white sm:text-lg">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/55">{desc}</p>
      </div>
    </div>
  );
}

function DetailReport() {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <div className="pointer-events-none absolute inset-0 -m-6 rounded-[2rem] bg-gradient-to-br from-violet-500/15 via-blue-500/10 to-cyan-500/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] shadow-2xl backdrop-blur-md">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Creative · Tháng 5/2026
              </p>
              <p className="mt-0.5 truncate text-base font-bold text-white sm:text-lg">
                Video Hook · BĐS Di Linh
              </p>
            </div>
            <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
              ● LIVE
            </span>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="mx-5 mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Hook", value: "72%", color: "text-emerald-300", bg: "from-emerald-500/15" },
            { label: "Hold", value: "45%", color: "text-blue-300", bg: "from-blue-500/15" },
            { label: "Done", value: "12%", color: "text-violet-300", bg: "from-violet-500/15" },
          ].map((k) => (
            <div
              key={k.label}
              className={`rounded-xl bg-gradient-to-br to-transparent p-3 text-center ${k.bg}`}
            >
              <p className={`text-2xl font-black tabular-nums sm:text-3xl ${k.color}`}>
                {k.value}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
                {k.label}
              </p>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <div className="m-5 rounded-2xl border border-white/[0.06] bg-black/30 p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
            Retention Funnel
          </p>
          <div className="space-y-2">
            {[
              { label: "Impressions", pct: 100, color: "from-white/30 to-white/10" },
              { label: "3s View", pct: 72, color: "from-emerald-500 to-emerald-400" },
              { label: "25% View", pct: 45, color: "from-blue-500 to-blue-400" },
              { label: "50% View", pct: 31, color: "from-violet-500 to-violet-400" },
              { label: "75% View", pct: 19, color: "from-amber-500 to-amber-400" },
              { label: "100% View", pct: 12, color: "from-red-500 to-red-400" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-2.5">
                <span className="w-20 shrink-0 text-[10px] text-white/45">{r.label}</span>
                <div className="relative flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${r.color}`}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <span className="w-9 text-right text-[10px] font-bold tabular-nums text-white/65">
                  {r.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI insight */}
        <div className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-violet-500/[0.02] p-3">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-500/25 text-sm">
            ✨
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
              AI gợi ý tối ưu
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-white/65">
              Hook 72% xuất sắc — scale ngân sách ×2. ROAS 3,8× đang rất tốt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  highlight,
  badge,
  features,
  cta,
  href,
}: {
  name: string;
  price: string;
  period?: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
  cta: string;
  href: string;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-6 sm:p-7 ${
        highlight
          ? "border-blue-400/50 bg-gradient-to-br from-blue-600/15 via-cyan-500/8 to-blue-600/10 shadow-2xl shadow-blue-500/20 ring-1 ring-blue-400/30 md:scale-[1.03]"
          : "border-white/[0.08] bg-white/[0.025]"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/40">
            {badge}
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            {price}
          </span>
          {period && <span className="text-sm text-white/40">{period}</span>}
        </div>
      </div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
            <CheckCircle2
              className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? "text-blue-300" : "text-emerald-400"}`}
            />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`rounded-2xl py-3.5 text-center text-sm font-bold transition-all ${
          highlight
            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60"
            : "border border-white/15 text-white/80 hover:bg-white/8 hover:text-white"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
