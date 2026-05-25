import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Đăng ký · Biznoco",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Đang tải…</div>}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
