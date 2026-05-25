"use client";

import { AlertCircle, RotateCw, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CreativesErrorStateProps {
  error: Error;
  onRetry: () => void;
  /** Hint hiển thị khi nghi ngờ env / RLS issue */
  isConfigured?: boolean;
}

export function CreativesErrorState({
  error,
  onRetry,
  isConfigured = true,
}: CreativesErrorStateProps) {
  const message = error.message || "Kết nối Supabase thất bại";
  const isAuthIssue =
    /jwt|auth|permission|rls|policy|unauthorized/i.test(message);
  const isNetworkIssue = /fetch|network|cors|timeout/i.test(message);

  return (
    <Card className="border-destructive/30">
      <CardContent className="p-8 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-destructive/15">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">Không tải được dữ liệu</h2>
        <p className="mt-1.5 max-w-md mx-auto text-sm text-muted-foreground">
          {message}
        </p>

        {!isConfigured && (
          <Hint
            title="Thiếu biến môi trường"
            body="Thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY vào .env.local rồi restart dev server."
          />
        )}
        {isConfigured && isAuthIssue && (
          <Hint
            title="Có thể do RLS / xác thực"
            body="Đảm bảo người dùng đã đăng nhập (Supabase Auth) HOẶC tạm tắt RLS cho creative_stats khi demo."
          />
        )}
        {isConfigured && isNetworkIssue && (
          <Hint
            title="Vấn đề mạng"
            body="Kiểm tra kết nối internet và xem URL Supabase có chính xác (bao gồm https://)."
          />
        )}

        <div className="mt-5 flex items-center justify-center gap-2">
          <Button onClick={onRetry}>
            <RotateCw className="h-4 w-4" /> Thử lại
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mở Supabase <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Hint({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto mt-4 max-w-md rounded-lg border border-warning/30 bg-warning/5 p-3 text-left text-xs">
      <div className="font-semibold text-warning">{title}</div>
      <div className="mt-0.5 text-muted-foreground">{body}</div>
    </div>
  );
}
