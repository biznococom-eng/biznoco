"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Megaphone,
  Wallet2,
  Settings2,
  Shield,
  CreditCard,
  Zap,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/admin";
import { usePlan } from "@/hooks/usePlan";

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
  { href: "/pricing",  label: "Bảng giá",    icon: CreditCard },
];

const PLAN_STYLE = {
  free:  { label: "FREE",  className: "bg-muted text-muted-foreground",          Icon: null },
  base:  { label: "BASE",  className: "bg-blue-500/15 text-blue-600",             Icon: Zap },
  ultra: { label: "ULTRA", className: "bg-amber-500/15 text-amber-600",           Icon: Crown },
} as const;

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const path = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const { tier, plan } = usePlan();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const sb = getSupabase();
    sb.auth.getUser().then(({ data }) => {
      setIsAdmin(isAdminEmail(data.user?.email));
    });
  }, []);

  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(href + "/");

  return (
    <aside className={cn(
      "flex h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-background px-3 py-5",
      mobile ? "flex" : "sticky top-0 hidden md:flex",
    )}>
      <Link href="/" className="mb-6 flex flex-col gap-1 px-2" onClick={onClose}>
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
        <NavLink key={it.href} {...it} active={isActive(it.href)} onClick={onClose} />
      ))}

      <SectionLabel className="mt-4">Cài đặt</SectionLabel>
      {SETTINGS.map((it) => (
        <NavLink key={it.href} {...it} active={isActive(it.href)} onClick={onClose} />
      ))}

      {isAdmin && (
        <>
          <SectionLabel className="mt-4">Quản trị</SectionLabel>
          <NavLink
            href="/admin"
            label="Admin Panel"
            icon={Shield}
            active={isActive("/admin")}
            onClick={onClose}
          />
        </>
      )}

      <div className="mt-auto space-y-2">
        {/* Plan badge */}
        {(() => {
          const planStyle = PLAN_STYLE[tier];
          const PlanIcon = planStyle.Icon;
          return (
            <Link href="/pricing">
              <div className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-80",
                planStyle.className,
              )}>
                <span className="flex items-center gap-1.5">
                  {PlanIcon && <PlanIcon className="h-3.5 w-3.5" />}
                  Gói {planStyle.label}
                </span>
                {tier === "free" && (
                  <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                    NÂNG CẤP
                  </span>
                )}
                {tier === "base" && (
                  <span className="text-[9px] text-muted-foreground">
                    {plan.campaigns} CĐ
                  </span>
                )}
              </div>
            </Link>
          );
        })()}

        <div className="rounded-lg border border-border/40 bg-card/40 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
            <Settings2 className="h-3.5 w-3.5 text-primary" />
            Mẹo nhanh
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Sort theo <b>ROAS</b> để spot creative ngon, theo <b>Spend</b> để tìm
            ad đốt ngân sách.
          </p>
        </div>
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
  onClick,
}: NavItem & { active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
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
