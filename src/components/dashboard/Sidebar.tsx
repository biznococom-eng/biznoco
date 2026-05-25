"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Megaphone,
  Wallet2,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MAIN: NavItem[] = [
  { href: "/campaigns", label: "Chiến dịch", icon: Megaphone },
  { href: "/creatives", label: "Creative Analytics", icon: LayoutGrid },
];

const SETTINGS: NavItem[] = [
  { href: "/accounts", label: "Ad Accounts", icon: Wallet2 },
];

export function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(href + "/");

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-background/60 px-3 py-5 backdrop-blur-md md:flex">
      <Link href="/" className="mb-6 flex flex-col gap-1 px-2">
        <img
          src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
          alt="Biznoco"
          className="h-8 w-auto"
        />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Creative Analytics
        </span>
      </Link>

      <SectionLabel>Dashboard</SectionLabel>
      {MAIN.map((it) => (
        <NavLink key={it.href} {...it} active={isActive(it.href)} />
      ))}

      <SectionLabel className="mt-4">Cài đặt</SectionLabel>
      {SETTINGS.map((it) => (
        <NavLink key={it.href} {...it} active={isActive(it.href)} />
      ))}

      <div className="mt-auto rounded-lg border border-border/40 bg-card/40 p-3">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
          <Settings2 className="h-3.5 w-3.5 text-primary" />
          Mẹo nhanh
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Sort theo <b>ROAS</b> để spot creative ngon, theo <b>Spend</b> để tìm
          ad đốt ngân sách.
        </p>
      </div>
    </aside>
  );
}

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: NavItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]"
          : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          active ? "text-primary" : "text-muted-foreground/80 group-hover:text-foreground",
        )}
      />
      {label}
    </Link>
  );
}
