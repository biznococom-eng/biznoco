import Link from "next/link";
import {
  Eye,
  Target,
  TrendingUp,
  PlayCircle,
  Zap,
  ShieldCheck,
  ArrowRight,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Biznoco — Creative Analytics cho Facebook Ads",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-violet-500/40">
              B
            </div>
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text font-extrabold tracking-tight text-transparent">
              Biznoco
            </span>
          </Link>
          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground">
              Tính năng
            </a>
            <a href="#metrics" className="text-muted-foreground hover:text-foreground">
              Chỉ số
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">
              Bảng giá
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">
                Dùng thử miễn phí
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-pink-500/30 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
          <Badge variant="default" className="mb-5 bg-primary/15 text-primary">
            <Zap className="mr-1 h-3 w-3" /> Live data từ Meta Marketing API
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
            Biết ngay creative nào{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
              đáng scale
            </span>
            , cái nào đang đốt ngân sách
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Phân tích Hook Rate, Hold Rate, CTR, ROAS cho từng video/hình ảnh
            Facebook Ads. Retention curve trực quan — quyết định nhanh, đốt ngân
            sách ít hơn.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="text-base">
              <Link href="/signup">
                Bắt đầu miễn phí
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="/creatives">Xem demo dashboard</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Không cần thẻ tín dụng
            </span>
            <span>•</span>
            <span>Setup 2 phút</span>
            <span>•</span>
            <span>Bảo mật cấp Meta Business</span>
          </div>
        </div>
      </section>

      {/* ── Metric showcase ──────────────────────────────────────────── */}
      <section id="metrics" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            3 chỉ số quyết định{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
              creative thắng hay thua
            </span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Vượt qua chỉ "spend" và "CTR" — phân tích đúng cách dân pro làm.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={Eye}
            title="Hook Rate"
            formula="3-sec view ÷ Impressions"
            desc="Phần trăm khán giả không lướt qua. Hook < 25%? Đổi thumbnail / 3 giây đầu ngay."
            tone="from-blue-500/30 to-cyan-500/20"
          />
          <MetricCard
            icon={Target}
            title="Hold Rate"
            formula="25% view ÷ 3-sec view"
            desc="Người đã dừng có ở lại không. Hold thấp = thumbnail clickbait, video nội dung dở."
            tone="from-emerald-500/30 to-teal-500/20"
          />
          <MetricCard
            icon={TrendingUp}
            title="ROAS"
            formula="Doanh thu ÷ Chi phí"
            desc="Bài toán cuối cùng. Biznoco group theo creative, không chỉ campaign — biết video nào thật sự bán hàng."
            tone="from-pink-500/30 to-rose-500/20"
          />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="border-y border-border/40 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Retention curve cho{" "}
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                  mọi video
                </span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Xem chính xác khán giả rớt ở mốc nào — 3s, 25%, 50%, 75%, hay 100%.
                Mỗi đường gãy là một insight để cắt cảnh, đổi script, scale nội dung.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Stacked funnel: 3s → 25% → 50% → 75% → 100%",
                  "So sánh retention curve giữa creative cùng campaign",
                  "Phát hiện creative bị fatigue (retention giảm theo thời gian)",
                  "Export báo cáo PDF cho client / sếp",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl border border-border/60 bg-gradient-to-br from-violet-950/40 via-card to-fuchsia-950/40 p-1 shadow-2xl shadow-violet-500/20">
              <div className="grid h-full place-items-center rounded-xl bg-card/40 backdrop-blur">
                <FakeRetentionChart />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Bảng giá đơn giản
          </h2>
          <p className="mt-3 text-muted-foreground">
            Bắt đầu miễn phí. Trả phí khi shop bạn lớn lên.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <PricingCard
            tier="Free"
            price="0"
            features={[
              "1 ad account",
              "Up to 30 days history",
              "Hook/Hold/ROAS dashboard",
              "Mock data trial",
            ]}
            cta="Bắt đầu"
            href="/signup"
          />
          <PricingCard
            tier="Pro"
            price="499K"
            popular
            features={[
              "5 ad accounts",
              "12 tháng lịch sử",
              "Auto sync hourly",
              "Alert creative giảm hiệu suất",
              "Export PDF",
            ]}
            cta="Dùng thử 14 ngày"
            href="/signup"
          />
          <PricingCard
            tier="Enterprise"
            price="Liên hệ"
            features={[
              "Unlimited accounts",
              "Multi-team workspace",
              "API access",
              "Dedicated support",
              "Custom integrations",
            ]}
            cta="Liên hệ sale"
            href="mailto:sales@biznoco.com"
          />
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border/40 bg-gradient-to-b from-background to-violet-950/20">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Sẵn sàng tối ưu spend chưa?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Kết nối Facebook Ad Account trong 2 phút — Biznoco tự động phân tích.
          </p>
          <Button asChild size="lg" className="mt-6 text-base">
            <Link href="/signup">
              Bắt đầu miễn phí
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>© 2026 Biznoco. Built for Vietnamese marketers.</div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-foreground">Đăng nhập</Link>
              <Link href="/signup" className="hover:text-foreground">Đăng ký</Link>
              <a
                href="https://github.com/biznococom-eng/biznoco"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Code2 className="h-3.5 w-3.5" /> Source
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  formula,
  desc,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  formula: string;
  desc: string;
  tone: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm transition-colors hover:border-border">
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${tone} blur-2xl opacity-60`}
      />
      <div className="relative">
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-secondary/60">
          <Icon className="h-5 w-5 text-foreground/80" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        <code className="mt-1 inline-block rounded bg-secondary/40 px-2 py-0.5 text-xs text-muted-foreground">
          {formula}
        </code>
        <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function PricingCard({
  tier,
  price,
  features,
  cta,
  href,
  popular,
}: {
  tier: string;
  price: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border bg-card/80 p-6 backdrop-blur-sm ${
        popular
          ? "border-primary/60 shadow-lg shadow-primary/20"
          : "border-border/60"
      }`}
    >
      {popular && (
        <Badge variant="default" className="absolute -top-3 right-6">
          Phổ biến
        </Badge>
      )}
      <h3 className="text-lg font-bold tracking-tight">{tier}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold">{price}</span>
        {price !== "Liên hệ" && (
          <span className="text-sm text-muted-foreground">đ/tháng</span>
        )}
      </div>
      <ul className="mt-5 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-muted-foreground">
            <span className="text-primary">✓</span> {f}
          </li>
        ))}
      </ul>
      <Button
        asChild
        variant={popular ? "default" : "outline"}
        className="mt-6 w-full"
      >
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}

function FakeRetentionChart() {
  // CSS-only mini retention chart cho hero
  return (
    <svg viewBox="0 0 320 180" className="w-full max-w-md">
      <defs>
        <linearGradient id="hero-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(248 84% 70%)" />
          <stop offset="100%" stopColor="hsl(290 84% 65%)" />
        </linearGradient>
        <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(290 84% 65% / 0.4)" />
          <stop offset="100%" stopColor="hsl(290 84% 65% / 0)" />
        </linearGradient>
      </defs>
      <g stroke="hsl(var(--border) / 0.4)" strokeDasharray="3 3">
        <line x1="0" y1="40" x2="320" y2="40" />
        <line x1="0" y1="90" x2="320" y2="90" />
        <line x1="0" y1="140" x2="320" y2="140" />
      </g>
      <path
        d="M 20,20 L 90,55 L 160,95 L 230,125 L 290,150 L 290,170 L 20,170 Z"
        fill="url(#hero-fill)"
      />
      <path
        d="M 20,20 L 90,55 L 160,95 L 230,125 L 290,150"
        stroke="url(#hero-line)"
        strokeWidth="2.5"
        fill="none"
      />
      {[
        [20, 20],
        [90, 55],
        [160, 95],
        [230, 125],
        [290, 150],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === 0 ? 5 : 3.5}
          fill={i === 0 ? "hsl(248 84% 70%)" : "hsl(290 84% 65%)"}
          stroke="hsl(var(--background))"
          strokeWidth="2"
        />
      ))}
      <g fill="hsl(var(--muted-foreground))" fontSize="10" textAnchor="middle">
        <text x="20" y="175">3s</text>
        <text x="90" y="175">25%</text>
        <text x="160" y="175">50%</text>
        <text x="230" y="175">75%</text>
        <text x="290" y="175">100%</text>
      </g>
    </svg>
  );
}
