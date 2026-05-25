import { redirect } from "next/navigation";
import { getSupabaseServer, isSupabaseConfiguredServer } from "@/lib/supabase/server";
import { ActivationForm } from "@/components/auth/ActivationForm";

export const metadata = {
  title: "Kích hoạt tài khoản · Biznoco",
};

export const dynamic = "force-dynamic";

export default async function ActivatePage() {
  if (!isSupabaseConfiguredServer) {
    // Mock mode — không có DB, không cần activate
    redirect("/creatives");
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Chưa đăng nhập → /login
  if (!user) {
    redirect("/login?next=/activate");
  }

  // Đã activate rồi → /creatives
  const { data: profile } = await supabase
    .from("users")
    .select("is_activated")
    .eq("id", user.id)
    .maybeSingle();

  if ((profile as { is_activated?: boolean } | null)?.is_activated) {
    redirect("/creatives");
  }

  return <ActivationForm email={user.email ?? null} />;
}
