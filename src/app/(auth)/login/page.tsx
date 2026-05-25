import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Đăng nhập · Biznoco",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Đang tải…</div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
