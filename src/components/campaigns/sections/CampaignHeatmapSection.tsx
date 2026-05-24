"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "./CampaignOverviewSection";
import { fmtCompact, fmtCompactVND, fmtPct } from "@/lib/creative-aggregator";
import type { MockBreakdown } from "@/mock/dilinh-campaign";

interface Props {
  rows: MockBreakdown[];
}

const AGE_BUCKETS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

export function CampaignHeatmapSection({ rows }: Props) {
  const maxCtr = Math.max(...rows.map((r) => r.ctr_link));

  // Build matrix
  const matrix: Record<string, { male?: MockBreakdown; female?: MockBreakdown }> = {};
  for (const age of AGE_BUCKETS) {
    matrix[age] = {};
  }
  for (const r of rows) {
    if (r.age_range && r.gender) {
      if (!matrix[r.age_range]) matrix[r.age_range] = {};
      if (r.gender === "male") matrix[r.age_range].male = r;
      if (r.gender === "female") matrix[r.age_range].female = r;
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <SectionHeader
          title="MA TRẬN TUỔI × GIỚI TÍNH — CTR HEATMAP"
          subtitle="Xanh đậm = CTR cao = nhóm cần ưu tiên ngân sách"
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="border-b border-border/40 px-2 py-2 text-left">Tuổi</th>
                <th className="border-b border-border/40 px-2 py-2 text-right" colSpan={3}>
                  NAM
                </th>
                <th className="border-b border-border/40 px-2 py-2 text-right" colSpan={3}>
                  NỮ
                </th>
              </tr>
              <tr className="text-[10px] text-muted-foreground/70">
                <th className="px-2 py-1"></th>
                <th className="px-2 py-1 text-right">Imp</th>
                <th className="px-2 py-1 text-right">Spend</th>
                <th className="px-2 py-1 text-right">CTR</th>
                <th className="px-2 py-1 text-right">Imp</th>
                <th className="px-2 py-1 text-right">Spend</th>
                <th className="px-2 py-1 text-right">CTR</th>
              </tr>
            </thead>
            <tbody>
              {AGE_BUCKETS.map((age) => {
                const m = matrix[age]?.male;
                const f = matrix[age]?.female;
                return (
                  <tr key={age} className="border-t border-border/40">
                    <td className="px-2 py-2 font-bold">{age}</td>
                    <Cell value={m?.impressions} format={fmtCompact} />
                    <Cell value={m?.spend} format={fmtCompactVND} />
                    <HeatCell ctr={m?.ctr_link} maxCtr={maxCtr} />
                    <Cell value={f?.impressions} format={fmtCompact} />
                    <Cell value={f?.spend} format={fmtCompactVND} />
                    <HeatCell ctr={f?.ctr_link} maxCtr={maxCtr} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          💡 Nhóm có CTR ≥ 5% thường là target audience chất lượng — nên tách ra Ad Set
          riêng để scale.
        </p>
      </CardContent>
    </Card>
  );
}

function Cell({ value, format }: { value?: number; format: (n: number) => string }) {
  return (
    <td className="px-2 py-2 text-right text-xs tabular-nums">
      {value !== undefined ? format(value) : <span className="text-muted-foreground">—</span>}
    </td>
  );
}

function HeatCell({ ctr, maxCtr }: { ctr?: number; maxCtr: number }) {
  if (ctr === undefined) {
    return (
      <td className="px-2 py-2 text-right text-xs text-muted-foreground">—</td>
    );
  }
  const intensity = maxCtr > 0 ? ctr / maxCtr : 0;
  const bg =
    ctr === 0
      ? "bg-secondary/20 text-muted-foreground"
      : intensity >= 0.8
        ? "bg-success/30 text-success"
        : intensity >= 0.55
          ? "bg-success/20 text-success"
          : intensity >= 0.35
            ? "bg-primary/20 text-primary"
            : intensity >= 0.18
              ? "bg-warning/15 text-warning"
              : "bg-destructive/10 text-destructive";

  return (
    <td className="px-1 py-1 text-right">
      <span
        className={`inline-block rounded-md px-2 py-1 text-xs font-bold tabular-nums ${bg}`}
      >
        {fmtPct(ctr, 2)}
      </span>
    </td>
  );
}
