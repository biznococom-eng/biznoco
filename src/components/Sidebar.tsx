"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: string };

const MAIN: NavItem[] = [
  { href: "/", label: "Tổng quan", icon: "■" },
];

const TOOLS: NavItem[] = [
  { href: "/ads", label: "Báo cáo Ads", icon: "▲" },
  { href: "/dataset", label: "Trích xuất Data", icon: "◆" },
  { href: "/chatbot", label: "AI Sales Bot", icon: "●" },
];

export function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <div className="brand-mark">B</div>
        <div className="brand-text">
          <div className="brand-name">Biznoco</div>
          <div className="brand-tag">AI Marketing Suite</div>
        </div>
      </Link>

      <div className="nav-section">Bảng điều khiển</div>
      {MAIN.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={`nav-item${isActive(it.href) ? " active" : ""}`}
        >
          <span className="nav-icon">{it.icon}</span>
          {it.label}
        </Link>
      ))}

      <div className="nav-section">Công cụ</div>
      {TOOLS.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={`nav-item${isActive(it.href) ? " active" : ""}`}
        >
          <span className="nav-icon">{it.icon}</span>
          {it.label}
        </Link>
      ))}

      <div style={{ flex: 1 }} />
      <div
        style={{
          padding: "12px",
          fontSize: "11px",
          color: "var(--text-3)",
          borderTop: "1px solid var(--border)",
          marginTop: "12px",
        }}
      >
        v0.1.0 · Build for biznoco.com
      </div>
    </aside>
  );
}
