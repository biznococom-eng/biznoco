import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Quên mật khẩu · Biznoco",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Đang tải…</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
