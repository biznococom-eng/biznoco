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
          <Link href="/" className="mb-8 inline-flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 font-bold text-white shadow-lg shadow-violet-500/40">
              B
            </div>
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
              Biznoco
            </span>
          </Link>
          {children}
        </div>
      </div>

      {/* Right: marketing */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-950 via-background to-fuchsia-950 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(800px_500px_at_30%_30%,hsl(290_84%_50%/0.35),transparent_60%),radial-gradient(600px_400px_at_70%_70%,hsl(248_84%_50%/0.3),transparent_60%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="grid h-1.5 w-1.5 place-items-center rounded-full bg-emerald-400">
                <span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
              </span>
              Live data từ Meta Marketing API
            </div>
            <h2 className="mt-8 max-w-md text-3xl font-bold leading-tight tracking-tight">
              Phân tích Creative Facebook Ads<br />
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                thông minh hơn
              </span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Hook Rate, Hold Rate, ROAS — biết ngay creative nào đáng scale,
              cái nào đốt ngân sách.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Tự sync data từ Meta Marketing API</li>
            <li>✓ Retention curve cho mỗi video creative</li>
            <li>✓ Cảnh báo creative giảm hiệu suất real-time</li>
            <li>✓ Phân tích đa tài khoản (Multi-account)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
