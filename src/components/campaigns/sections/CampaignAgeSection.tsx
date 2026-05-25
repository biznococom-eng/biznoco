"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "./CampaignOverviewSection";
import { fmtCompact, fmtCompactVND, fmtPct } from "@/lib/creative-aggregator";
import type { MockBreakdown } from "@/mock/dilinh-campaign";
import { Flame, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  rows: MockBreakdown[];
}

export function CampaignAgeSection({ rows }: Props) {
  const maxCtr = Math.max(...rows.map((r) => r.ctr_link));
  const maxSpend = Math.max(...rows.map((r) => r.spend));
  const topCtrAge = rows.reduce((a, b) => (a.ctr_link > b.ctr_link ? a : b));
  const secondTopAge = [...rows]
    .filter((r) => r !== topCtrAge)
    .reduce((a, b) => (a.ctr_link > b.ctr_link ? a : b));

  return (
    <Card>
      <CardContent className="p-6">
        <SectionHeader
          title="NHÂN KHẨU HỌC — ĐỘ TUỔI"
          subtitle="Hiệu suất theo 6 nhóm tuổi"
        />

        {/* Bar visualization */}
        <div className="space-y-2.5">
          {rows.map((r) => {
            const isTop = r === topCtrAge;
            const isSecond = r === secondTopAge;
            const widthSpend = (r.spend / maxSpend) * 100;
            const widthCtr = (r.ctr_link / maxCtr) * 100;

            return (
              <div
                key={r.value}
                className={cn(
                  "rounded-lg border bg-card/40 p-3",
                  isTop
                    ? "border-success/40 bg-success/5"
                    : isSecond
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/40",
                )}
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-bold">
                    {isTop && <Crown className="h-4 w-4 text-warning" />}
                    {isSecond && <Flame className="h-4 w-4 text-primary" />}
                    <span>{r.value}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">
                      Imp: <span className="font-semibold text-foreground tabular-nums">{fmtCompact(r.impressions)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      CPC: <span className="font-semibold text-foreground tabular-nums">{fmtCompactVND(r.cpc_link)}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Spend</div>
                    <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-secondary/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${widthSpend}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] tabular-nums text-muted-foreground">
                      {fmtCompactVND(r.spend)} ({r.spend_share.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <div className="text-[10px] text-muted-foreground">CTR</div>
                    <div
                      className={cn(
                        "mt-0.5 text-lg font-extrabold tabular-nums",
                        isTop ? "text-success" : "",
                      )}
                    >
                      {fmtPct(r.ctr_link, 1)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-lg border border-success/30 bg-success/5 p-4 text-sm">
          <p>
            <Crown className="mr-1 inline-block h-4 w-4 text-warning" />
            <b>{topCtrAge.value}</b> CTR cao nhất ({fmtPct(topCtrAge.ctr_link, 2)}) với CPC thấp nhất ({fmtCompactVND(topCtrAge.cpc_link)}).
            <Flame className="ml-2 mr-1 inline-block h-4 w-4 text-primary" />
            <b>{secondTopAge.value}</b> đứng thứ 2 với CTR {fmtPct(secondTopAge.ctr_link, 2)}.
          </p>
          <p className="mt-1 text-muted-foreground">
            → Ưu tiên tăng budget cho 2 nhóm này, đặc biệt {topCtrAge.value}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
