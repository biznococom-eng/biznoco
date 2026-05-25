import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex items-center">
            <img
              src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
              alt="Biznoco"
              className="h-9 w-auto"
            />
          </Link>
          {children}
        </div>
      </div>

      {/* Right: marketing panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0d0f1a] via-[#0f1320] to-[#0d1428] lg:block">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[-5%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[100px]" />
          <div className="absolute left-[40%] top-[50%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          {/* ── TOP: Badge + Headline ── */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live data từ Meta Marketing API
            </div>

            <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-white">
              Phân tích Creative<br />Facebook Ads{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                thông minh hơn
              </span>
            </h2>
            <p className="mt-2.5 text-sm text-white/50">
              Hook Rate · Hold Rate · ROAS — biết ngay creative nào đáng scale, cái nào đốt ngân sách.
            </p>
          </div>

          {/* ── MIDDLE: Dashboard preview card ── */}
          <div className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="text-xs font-semibold text-white/80">Di Linh Coffee — Tháng 5/2026</span>
              </div>
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-300">
                Đang chạy
              </span>
            </div>

            {/* Metric cards row */}
            <div className="grid grid-cols-4 gap-px bg-white/5">
              {[
                { label: "Hook Rate", value: "72%", delta: "+12%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "Hold Rate", value: "45%", delta: "+8%", color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "ROAS", value: "3.8×", delta: "+0.6×", color: "text-violet-400", bg: "bg-violet-500/10" },
                { label: "CTR", value: "4.6%", delta: "+1.2%", color: "text-cyan-400", bg: "bg-cyan-500/10" },
              ].map((m) => (
                <div key={m.label} className={`flex flex-col items-center gap-0.5 px-2 py-3 ${m.bg}`}>
                  <span className={`text-xl font-extrabold tabular-nums ${m.color}`}>{m.value}</span>
                  <span className="text-[10px] text-white/50">{m.label}</span>
                  <span className="text-[10px] font-medium text-emerald-400">{m.delta}</span>
                </div>
              ))}
            </div>

            {/* Retention funnel bars */}
            <div className="px-4 py-4">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Retention Funnel</span>
                <span className="text-[10px] text-white/30">Impression → 100%</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: "Impressions", pct: 100, color: "bg-white/20" },
                  { label: "3s View (Hook)", pct: 72, color: "bg-emerald-500" },
                  { label: "25% View (Hold)", pct: 45, color: "bg-blue-500" },
                  { label: "50% View", pct: 31, color: "bg-violet-500" },
                  { label: "75% View", pct: 19, color: "bg-amber-500" },
                  { label: "100% View", pct: 12, color: "bg-red-500" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className="w-28 shrink-0 text-[10px] text-white/40">{row.label}</span>
                    <div className="flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-2 rounded-full ${row.color} transition-all`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[10px] font-medium tabular-nums text-white/60">{row.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI recommendation box */}
            <div className="mx-4 mb-4 flex items-start gap-3 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
              <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-500/30 text-xs">
                🤖
              </div>
              <div>
                <div className="mb-0.5 text-[11px] font-semibold text-violet-300">AI Gợi ý tối ưu</div>
                <p className="text-[11px] leading-relaxed text-white/50">
                  Hook rate 72% xuất sắc. Scale ngân sách ×2 cho creative này — ROAS 3.8× đang rất tốt.
                </p>
              </div>
            </div>
          </div>

          {/* ── BOTTOM: Feature checklist ── */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              "Sync tự động từ Meta API",
              "Retention curve mỗi creative",
              "Cảnh báo hiệu suất real-time",
              "AI phân tích & gợi ý",
              "Đa tài khoản (Multi-account)",
              "Mã hoá end-to-end",
            ].map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-white/50">
                <svg className="h-3.5 w-3.5 shrink-0 text-emerald-400" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
