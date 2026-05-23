import { Suspense } from "react";
import { AuthCallbackInner } from "@/components/auth/AuthCallbackInner";

export const metadata = { title: "Đang xác thực · Biznoco" };
export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <div className="text-sm text-muted-foreground">Đang xác thực…</div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
