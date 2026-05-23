"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Play, Image as ImageIcon, Layers, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MetricProgress } from "./MetricProgress";
import { RetentionChart } from "./RetentionChart";
import {
  fmtCompact,
  fmtCompactVND,
  fmtPct,
  type CreativeAggregated,
} from "@/lib/creative-aggregator";
import { cn } from "@/lib/utils";

interface CreativeCardProps {
  c: CreativeAggregated;
  spendShare: number; // % of total spend (0-100)
}

export function CreativeCard({ c, spendShare }: CreativeCardProps) {
  const isVideo = c.creative_type === "video" && c.video_url;
  const isCarousel = c.creative_type === "carousel";
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  // ROAS tone for badge
  const roasTone =
    c.roas >= 3 ? "success" : c.roas >= 1.5 ? "warning" : "destructive";

  // Hook/Hold tone based on industry benchmarks
  const hookTone =
    c.hook_rate >= 40 ? "success" : c.hook_rate >= 25 ? "warning" : "destructive";
  const holdTone =
    c.hold_rate >= 70 ? "success" : c.hold_rate >= 50 ? "warning" : "destructive";

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Media zone */}
      <div className="relative aspect-square w-full overflow-hidden bg-black/50">
        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={c.video_url ?? undefined}
              poster={c.thumbnail_url ?? undefined}
              className="h-full w-full object-cover"
              preload="metadata"
              muted
              playsInline
              controls={playing}
              onEnded={() => setPlaying(false)}
              onPause={() => setPlaying(false)}
            />
            {!playing && (
              <button
                aria-label="Play preview"
                onClick={handlePlay}
                className="group absolute inset-0 grid place-items-center bg-black/30 transition-colors hover:bg-black/45"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 transition-transform group-hover:scale-110">
                  <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                </span>
              </button>
            )}
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.thumbnail_url ?? "/placeholder.png"}
            alt={c.ad_name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}

        {/* Format badge */}
        <div className="absolute left-2 top-2 flex gap-1.5">
          <Badge variant="outline" className="border-white/30 bg-black/60 text-white backdrop-blur">
            {isVideo ? (
              <>
                <Play className="mr-1 h-3 w-3 fill-current" /> Video
              </>
            ) : isCarousel ? (
              <>
                <Layers className="mr-1 h-3 w-3" /> Carousel
              </>
            ) : (
              <>
                <ImageIcon className="mr-1 h-3 w-3" /> Image
              </>
            )}
          </Badge>
        </div>

        {/* ROAS badge */}
        <div className="absolute right-2 top-2">
          <Badge
            variant={roasTone}
            className="text-xs backdrop-blur shadow-sm"
          >
            ROAS {c.roas.toFixed(2)}×
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Title + campaign */}
        <div>
          <h3
            className="line-clamp-1 text-sm font-semibold tracking-tight"
            title={c.ad_name}
          >
            {c.ad_name}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground" title={c.campaign_name ?? ""}>
            {c.campaign_name || "—"}
          </p>
        </div>

        {/* Quick stat row */}
        <div className="grid grid-cols-3 gap-2 rounded-md border border-border/50 bg-secondary/30 p-2">
          <Stat label="Chi phí" value={fmtCompactVND(c.spend)} />
          <Stat label="Impr." value={fmtCompact(c.impressions)} />
          <Stat label="CTR" value={fmtPct(c.ctr_link, 2)} />
        </div>

        {/* Progress bars */}
        <div className="space-y-2.5">
          {isVideo ? (
            <>
              <MetricProgress
                label="Hook Rate"
                hint="3s / Impr"
                value={c.hook_rate}
                tone={hookTone}
              />
              <MetricProgress
                label="Hold Rate"
                hint="25% / 3s"
                value={c.hold_rate}
                tone={holdTone}
              />
            </>
          ) : (
            <div className="rounded-md border border-dashed border-border/50 px-3 py-2 text-xs text-muted-foreground">
              Quảng cáo {isCarousel ? "Carousel" : "Hình ảnh"} — không có chỉ số video.
            </div>
          )}
          <MetricProgress
            label="Spend Share"
            hint="% ngân sách tài khoản"
            value={spendShare}
            tone={spendShare >= 25 ? "warning" : "default"}
          />
        </div>

        {/* Retention curve */}
        {isVideo ? (
          <>
            <Separator className="my-1" />
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Retention Curve</span>
                <span className="text-muted-foreground/70">
                  Hoàn thành: <span className="font-semibold text-foreground">{fmtPct(c.completion_rate, 0)}</span>
                </span>
              </div>
              <RetentionChart
                v3={c.v3}
                p25={c.p25}
                p50={c.p50}
                p75={c.p75}
                p100={c.p100}
              />
            </div>
          </>
        ) : null}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <span className="line-clamp-1" title={c.adset_name ?? ""}>
            {c.adset_name || "—"}
          </span>
          <Link
            href={`/creatives/${c.ad_id}`}
            className="inline-flex items-center gap-1 font-medium text-primary/90 hover:text-primary"
          >
            Chi tiết <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
