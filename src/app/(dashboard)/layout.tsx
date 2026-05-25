import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getSupabaseServer,
  isSupabaseConfiguredServer,
} from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt + suspenders cho middleware: nếu user vào (dashboard) mà chưa activate
  // (có thể do middleware bị bypass tạm thời), redirect lại /activate ở server.
  if (isSupabaseConfiguredServer) {
    try {
      const supabase = await getSupabaseServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect("/login");
      }

      const { data: profile } = await supabase
        .from("users")
        .select("is_activated")
        .eq("id", user.id)
        .maybeSingle();

      const isActivated =
        (profile as { is_activated?: boolean } | null)?.is_activated ?? false;

      if (!isActivated) {
        redirect("/activate");
      }
    } catch (err) {
      // Lỗi DB (vd: chưa chạy migration activation.sql) → cho qua
      // để không khoá kẹt user khi schema chưa sẵn sàng.
      // Có thể log ở đây nếu cần.
      void err;
    }
  }

  return <DashboardShell>{children}</DashboardShell>;
}
