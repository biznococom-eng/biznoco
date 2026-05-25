"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, User, ChevronDown, Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/admin";
import { usePlan } from "@/hooks/usePlan";
import { useMobileNav } from "./DashboardShell";

interface UserMeta {
  email: string | null;
  full_name: string | null;
  isAdmin?: boolean;
}

export function Topbar() {
  const [user, setUser] = useState<UserMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const { tier } = usePlan();
  const { open: openMobileNav } = useMobileNav();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const sb = getSupabase();
    sb.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email ?? null,
          full_name:
            (data.user.user_metadata?.full_name as string | undefined) ?? null,
          isAdmin: isAdminEmail(data.user.email),
        });
      }
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? null,
          full_name:
            (session.user.user_metadata?.full_name as string | undefined) ?? null,
        });
      } else {
        setUser(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const initial = (user?.full_name?.[0] || user?.email?.[0] || "?").toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <button
          className="rounded-md border border-border/40 p-1.5 hover:bg-accent/40 transition-colors"
          onClick={openMobileNav}
          aria-label="Mở menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <Link href="/" className="flex items-center">
          <img
            src="https://biznoco.com/wp-content/uploads/2026/04/Logo-biznoco-ngang-1.png"
            alt="Biznoco"
            className="h-7 w-auto"
          />
        </Link>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        {!isSupabaseConfigured && (
          <Badge variant="warning" className="hidden sm:inline-flex">
            Mock mode
          </Badge>
        )}

        {loading ? (
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted/40" />
        ) : user ? (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 rounded-md border border-border/40 bg-card/50 px-2 py-1.5 transition-colors hover:bg-accent/40">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white">
                  {initial}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-semibold">
                    {user.full_name || user.email}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-1.5">
              <div className="px-2.5 py-2 text-xs">
                <div className="font-semibold">
                  {user.full_name || "Người dùng"}
                </div>
                <div className="truncate text-muted-foreground">{user.email}</div>
                <Link href="/pricing" className="mt-1.5 inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary hover:bg-primary/20">
                  Gói {tier.toUpperCase()}
                </Link>
              </div>
              <div className="my-1 h-px bg-border/60" />
              <PopoverItem href="/accounts" icon={User}>
                Ad Accounts
              </PopoverItem>
              {user.isAdmin && (
                <PopoverItem href="/admin" icon={Shield}>
                  Admin Panel
                </PopoverItem>
              )}
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Đăng xuất
                </button>
              </form>
            </PopoverContent>
          </Popover>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Đăng ký</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function PopoverItem({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-sm transition-colors hover:bg-accent/40"
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {children}
    </Link>
  );
}
