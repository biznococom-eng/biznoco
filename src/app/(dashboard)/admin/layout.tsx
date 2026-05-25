import { redirect } from "next/navigation";
import {
  getSupabaseServer,
  isSupabaseConfiguredServer,
} from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export const metadata = { title: "Admin Panel · Biznoco" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock mode → cho phép truy cập admin (dev/demo)
  if (!isSupabaseConfiguredServer) {
    return <>{children}</>;
  }

  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    if (!isAdminEmail(user.email)) {
      redirect("/creatives");
    }
  } catch {
    redirect("/creatives");
  }

  return <>{children}</>;
}
