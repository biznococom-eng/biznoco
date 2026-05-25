"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Activity, Sparkles, FileDown, Lock } from "lucide-react";
import {
  MOCK_DILINH_BUNDLE,
  MOCK_CAMPAIGNS_LIST,
  MOCK_CAMPAIGNS_OVERVIEW,
  type MockCampaignBundle,
} from "@/mock/dilinh-campaign";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CampaignOverviewSection } from "./sections/CampaignOverviewSection";
import { CampaignGenderSection } from "./sections/CampaignGenderSection";
import { CampaignAgeSection } from "./sections/CampaignAgeSection";
import { CampaignHeatmapSection } from "./sections/CampaignHeatmapSection";
import { CampaignGeoSection } from "./sections/CampaignGeoSection";
import { CampaignDeviceSection } from "./sections/CampaignDeviceSection";
import { CampaignFunnelSection } from "./sections/CampaignFunnelSection";
import { CampaignRecommendationsSection } from "./sections/CampaignRecommendationsSection";
import { usePlan } from "@/hooks/usePlan";

interface Props {
  campaignId: string;
}

export function CampaignReport({ campaignId }: Props) {
  // Look up bundle — chỉ Di Linh có full data, các campaign khác show "no data yet"
  const isDilinh = campaignId === MOCK_DILINH_BUNDLE.campaign.id;
  const campaign = MOCK_CAMPAIGNS_LIST.find((c) => c.id === campaignId);

  if (!campaign) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-8">
        <BackLink />
        <Card className="mt-6">
          <CardContent className="grid place-items-center py-16 text-center">
            <h2 className="text-lg font-semibold">Không tìm thấy chiến dịch</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Campaign ID không tồn tại hoặc đã bị xoá.
            </p>
            <Button asChild className="mt-4">
              <Link href="/campaigns">Quay về danh sách</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isDilinh) {
    // Demo campaigns khác — show placeholder báo bạn cần sync data
    const overview = MOCK_CAMPAIGNS_OVERVIEW[campaignId];
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
        <div className="mb-3"><BackLink /></div>
        <Card className="mt-4 overflow-hidden">
          <ReportCover campaign={campaign} />
        </Card>
        <Card className="mt-4">
          <CardContent className="grid place-items-center py-16 text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary/15">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Demo data chỉ có cho 1 chiến dịch</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Chiến dịch này chỉ có overview KPIs (
              {overview ? `Spend ${overview.total_spend.toLocaleString("vi-VN")}₫` : "—"})
              nhưng không có demographics breakdown đầy đủ trong demo.
            </p>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Kết nối Meta API token tại{" "}
              <Link href="/accounts" className="font-semibold text-primary hover:underline">
                /accounts
              </Link>{" "}
              để app tự sync data thật từ Facebook, hoặc xem{" "}
              <Link
                href={`/campaigns/${MOCK_DILINH_BUNDLE.campaign.id}`}
                className="font-semibold text-primary hover:underline"
              >
                báo cáo Di Linh (demo đầy đủ)
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <FullReport bundle={MOCK_DILINH_BUNDLE} />;
}

function PdfExportButton({ hasPdf }: { hasPdf: boolean }) {
  if (!hasPdf) {
    return (
      <Link href="/pricing">
        <Button variant="outline" size="sm" className="gap-1.5 opacity-60" data-no-print>
          <Lock className="h-3.5 w-3.5" />
          Xuất PDF · BASE+
        </Button>
      </Link>
    );
  }
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      data-no-print
      onClick={() => window.print()}
    >
      <FileDown className="h-3.5 w-3.5" />
      Xuất PDF
    </Button>
  );
}

function FullReport({ bundle }: { bundle: MockCampaignBundle }) {
  const { plan } = usePlan();
  const hasAi = plan.ai;
  const hasPdf = plan.pdf;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-10">
      <div className="mb-3 flex items-center justify-between" data-no-print>
        <BackLink />
        <PdfExportButton hasPdf={hasPdf} />
      </div>

      {/* ── Slide 1: Cover ────────────────────────────────────────────── */}
      <div className="mt-2">
        <ReportCover campaign={bundle.campaign} />
      </div>

      {/* ── Slide 2: Overview 8 KPIs ──────────────────────────────────── */}
      <div className="mt-6">
        <CampaignOverviewSection overview={bundle.overview} />
      </div>

      {/* ── Slide 3: Gender ───────────────────────────────────────────── */}
      <div className="mt-6">
        <CampaignGenderSection rows={bundle.gender} />
      </div>

      {/* ── Slide 4: Age ──────────────────────────────────────────────── */}
      <div className="mt-6">
        <CampaignAgeSection rows={bundle.age} />
      </div>

      {/* ── Slide 5: Age × Gender Heatmap ─────────────────────────────── */}
      <div className="mt-6">
        <CampaignHeatmapSection rows={bundle.age_gender} />
      </div>

      {/* ── Slide 6: Geography ────────────────────────────────────────── */}
      <div className="mt-6">
        <CampaignGeoSection rows={bundle.region} />
      </div>

      {/* ── Slide 7: Device & Platform ────────────────────────────────── */}
      <div className="mt-6">
        <CampaignDeviceSection
          devices={bundle.device}
          platforms={bundle.platform}
        />
      </div>

      {/* ── Slide 8: Messenger Funnel ─────────────────────────────────── */}
      {bundle.overview.total_conversations > 0 && (
        <div className="mt-6">
          <CampaignFunnelSection overview={bundle.overview} />
        </div>
      )}

      {/* ── Slide 9: Recommendations (AI — gated BASE+) ───────────────── */}
      <div className="mt-6">
        {hasAi ? (
          <CampaignRecommendationsSection bundle={bundle} />
        ) : (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-wrap items-center gap-4 p-6">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">AI Phân tích &amp; Khuyến nghị</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rule engine phân tích 9 chiều dữ liệu (giới tính, độ tuổi, khu vực, thiết bị, funnel…)
                  và đưa ra khuyến nghị tối ưu chi phí. Tính năng này yêu cầu gói <b>BASE</b> trở lên.
                </p>
              </div>
              <Button asChild size="sm" data-no-print>
                <Link href="/pricing">Nâng cấp để mở khóa</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground" data-no-print>
        <span>
          Xuất ngày {new Date().toLocaleDateString("vi-VN")} · Biznoco Digital
        </span>
        <Button asChild variant="ghost" size="sm">
          <Link href="/campaigns">← Tất cả chiến dịch</Link>
        </Button>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/campaigns"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> Tất cả chiến dịch
    </Link>
  );
}

function ReportCover({ campaign }: { campaign: MockCampaignBundle["campaign"] }) {
  const start = new Date(campaign.start_time).toLocaleDateString("vi-VN");
  const end = campaign.stop_time
    ? new Date(campaign.stop_time).toLocaleDateString("vi-VN")
    : new Date().toLocaleDateString("vi-VN");

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-blue-950/50 via-card to-teal-950/40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_400px_at_20%_30%,hsl(290_84%_50%/0.25),transparent_60%),radial-gradient(600px_300px_at_80%_70%,hsl(248_84%_60%/0.22),transparent_60%)]" />
      <CardContent className="grid gap-8 p-8 md:grid-cols-[1fr_auto] md:p-12">
        <div>
          <Badge variant="default" className="mb-3 gap-1 bg-primary/15 text-primary">
            <Activity className="h-3 w-3" /> BIZNOCO · FACEBOOK ADS
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Báo cáo Chiến dịch Quảng cáo
          </h1>
          <p className="mt-2 text-lg font-bold tracking-tight text-primary">
            {campaign.name}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Phân tích Hiệu suất &amp; Nhân khẩu học toàn diện
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 self-end md:grid-cols-1 md:gap-2">
          <CoverField label="Chiến dịch" value={campaign.fb_campaign_id} />
          <CoverField label="Objective" value={campaign.objective ?? "—"} />
          <CoverField
            label="Kỳ báo cáo"
            value={
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {start} → {end}
              </span>
            }
          />
          <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs font-bold text-success">
            ● {campaign.effective_status}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CoverField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border/40 bg-card/60 px-3 py-2 backdrop-blur">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}
