"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
} from "recharts";
import { fmtCompact } from "@/lib/creative-aggregator";

interface RetentionChartProps {
  v3: number;
  p25: number;
  p50: number;
  p75: number;
  p100: number;
  /** Optional baseline (impressions) — if provided each point is shown as % of impressions */
  baseline?: number;
}

export function RetentionChart({ v3, p25, p50, p75, p100, baseline }: RetentionChartProps) {
  const data = [
    { stage: "3s", viewers: v3 },
    { stage: "25%", viewers: p25 },
    { stage: "50%", viewers: p50 },
    { stage: "75%", viewers: p75 },
    { stage: "100%", viewers: p100 },
  ];

  // Percent labels relative to 3s view (industry standard for retention curve).
  const pct = (n: number) => (v3 > 0 ? ((n / v3) * 100).toFixed(0) + "%" : "—");

  return (
    <div className="h-[120px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -28 }}>
          <defs>
            <linearGradient id="retLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(248 84% 70%)" />
              <stop offset="100%" stopColor="hsl(290 84% 65%)" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => fmtCompact(v)}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
              padding: "6px 10px",
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: 2 }}
            formatter={(value, _name, item) => {
              const val = Number(value ?? 0);
              const stage = (item?.payload?.stage ?? "") as string;
              const ratio =
                baseline && baseline > 0
                  ? ` (${((val / baseline) * 100).toFixed(1)}% impr)`
                  : v3 > 0
                    ? ` (${pct(val)} of 3s)`
                    : "";
              return [fmtCompact(val) + ratio, stage] as [string, string];
            }}
          />
          <Line
            type="monotone"
            dataKey="viewers"
            stroke="url(#retLine)"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: "hsl(290 84% 65%)" }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          {v3 > 0 && (
            <ReferenceDot
              x="3s"
              y={v3}
              r={4}
              fill="hsl(248 84% 70%)"
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
