import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Biznoco — Creative Analytics cho Facebook Ads",
    template: "%s · Biznoco",
  },
  description:
    "Phân tích Hook Rate, Hold Rate, ROAS theo từng creative Facebook Ads. SaaS dành cho marketer & chủ doanh nghiệp Việt.",
  icons: {
    icon: "https://biznoco.com/wp-content/uploads/2026/04/Biznoco-1.png",
    apple: "https://biznoco.com/wp-content/uploads/2026/04/Biznoco-1.png",
  },
  openGraph: {
    title: "Biznoco — Creative Analytics cho Facebook Ads",
    description:
      "Hook Rate, Hold Rate, ROAS — biết ngay creative nào đáng scale.",
    locale: "vi_VN",
    type: "website",
    images: ["https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
