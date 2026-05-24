"use client";

import { MapPin, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "./CampaignOverviewSection";
import { fmtCompactVND, fmtPct, fmtCompact } from "@/lib/creative-aggregator";
import type { MockBreakdown } from "@/mock/dilinh-campaign";
import { cn } from "@/lib/utils";

interface Props {
  rows: MockBreakdown[];
}

export function CampaignGeoSection({ rows }: Props) {
  const maxCtr = Math.max(...rows.map((r) => r.ctr_link));
  const wasteRows = rows.filter((r) => r.spend > 1000 && r.link_clicks === 0);
  const wasteTotal = wasteRows.reduce((s, r) => s + r.spend, 0);

  return (
    <Card>
      <CardContent className="p-6">
        <SectionHeader
          title="NHÂN KHẨU HỌC — ĐỊA LÝ"
          subtitle={`Top ${rows.length} tỉnh/thành theo chi tiêu`}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="border-b border-border/40 px-2 py-2 text-left">#</th>
                <th className="border-b border-border/40 px-2 py-2 text-left">Tỉnh / Thành phố</th>
                <th className="border-b border-border/40 px-2 py-2 text-right">Spend</th>
                <th className="border-b border-border/40 px-2 py-2 text-right">Impr.</th>
                <th className="border-b border-border/40 px-2 py-2 text-right">Clicks</th>
                <th className="border-b border-border/40 px-2 py-2 text-right">CTR</th>
                <th className="border-b border-border/40 px-2 py-2 text-right">CPC</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isWaste = r.spend > 1000 && r.link_clicks === 0;
                const isTopCtr = r.ctr_link === maxCtr && r.ctr_link > 0;
                const ctrIntensity = maxCtr > 0 ? r.ctr_link / maxCtr : 0;

                return (
                  <tr
                    key={r.value}
                    className={cn(
                      "border-t border-border/40 transition-colors hover:bg-secondary/30",
                      isWaste && "bg-destructive/5",
                      isTopCtr && "bg-success/5",
                    )}
                  >
                    <td className="px-2 py-2 text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-semibold">{r.value}</span>
                        {isWaste && (
                          <span className="rounded bg-destructive/15 px-1 py-0.5 text-[9px] font-bold uppercase text-destructive">
                            CẮT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {fmtCompactVND(r.spend)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {fmtCompact(r.impressions)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {r.link_clicks}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-0.5 text-xs font-bold tabular-nums",
                          ctrIntensity >= 0.7
                            ? "bg-success/20 text-success"
                            : ctrIntensity >= 0.4
                              ? "bg-primary/15 text-primary"
                              : ctrIntensity > 0
                                ? "bg-warning/15 text-warning"
                                : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {fmtPct(r.ctr_link, 2)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {r.cpc_link > 0 ? fmtCompactVND(r.cpc_link) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {wasteRows.length > 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">
                Cần cắt {wasteRows.length} tỉnh không hiệu quả
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {wasteRows.map((r) => r.value).join(", ")} đã tiêu{" "}
                <b className="text-foreground">{fmtCompactVND(wasteTotal)}</b> nhưng không có link
                click nào. Loại khỏi targeting để tái phân bổ ngân sách.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
