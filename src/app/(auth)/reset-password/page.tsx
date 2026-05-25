import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Đặt lại mật khẩu · Biznoco",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Đang tải…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
