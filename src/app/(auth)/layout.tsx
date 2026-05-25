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

      {/* Right: marketing */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 via-background to-teal-950 lg:block">
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
              <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
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
            <li>✓ Mã hoá end-to-end · SOC 2 ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
