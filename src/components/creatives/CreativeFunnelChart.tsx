"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtCompact, fmtPct } from "@/lib/creative-aggregator";

interface FunnelStage {
  stage: string;
  viewers: number;
  pct_of_impressions: number;
  pct_of_3s: number;
}

interface Props {
  impressions: number;
  v3: number;
  p25: number;
  p50: number;
  p75: number;
  p100: number;
}

export function CreativeFunnelChart({ impressions, v3, p25, p50, p75, p100 }: Props) {
  const data: FunnelStage[] = [
    { stage: "Impressions", viewers: impressions, pct_of_impressions: 100, pct_of_3s: v3 > 0 ? (impressions / v3) * 100 : 0 },
    { stage: "3s view", viewers: v3, pct_of_impressions: impressions > 0 ? (v3 / impressions) * 100 : 0, pct_of_3s: 100 },
    { stage: "25% watched", viewers: p25, pct_of_impressions: impressions > 0 ? (p25 / impressions) * 100 : 0, pct_of_3s: v3 > 0 ? (p25 / v3) * 100 : 0 },
    { stage: "50% watched", viewers: p50, pct_of_impressions: impressions > 0 ? (p50 / impressions) * 100 : 0, pct_of_3s: v3 > 0 ? (p50 / v3) * 100 : 0 },
    { stage: "75% watched", viewers: p75, pct_of_impressions: impressions > 0 ? (p75 / impressions) * 100 : 0, pct_of_3s: v3 > 0 ? (p75 / v3) * 100 : 0 },
    { stage: "100% watched", viewers: p100, pct_of_impressions: impressions > 0 ? (p100 / impressions) * 100 : 0, pct_of_3s: v3 > 0 ? (p100 / v3) * 100 : 0 },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Funnel xem video (tổng kỳ)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] px-3 pb-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} layout="vertical">
            <defs>
              <linearGradient id="funnelGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(248 84% 65%)" />
                <stop offset="100%" stopColor="hsl(290 84% 60%)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCompact(v)} />
            <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} width={100} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(_value, _name, item) => {
                const d = (item?.payload ?? {}) as FunnelStage;
                return [
                  `${fmtCompact(d.viewers)} người (${fmtPct(d.pct_of_impressions, 1)} của impressions, ${fmtPct(d.pct_of_3s, 1)} của 3s view)`,
                  d.stage,
                ] as [string, string];
              }}
            />
            <Bar dataKey="viewers" fill="url(#funnelGrad)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  padding: "6px 10px",
};
