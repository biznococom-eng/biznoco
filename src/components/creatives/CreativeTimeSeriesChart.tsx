"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtCompact, fmtCompactVND, fmtPct } from "@/lib/creative-aggregator";

export interface DailyPoint {
  date: string;
  spend: number;
  impressions: number;
  ctr_link: number;
  hook_rate: number;
  hold_rate: number;
  roas: number;
}

interface Props {
  data: DailyPoint[];
}

export function CreativeTimeSeriesChart({ data }: Props) {
  // Slice date "YYYY-MM-DD" → "DD/MM" for axis
  const ticks = data.map((d) => ({
    ...d,
    label: d.date.slice(5).split("-").reverse().join("/"),
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Spend + impressions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Chi phí & Impressions theo ngày</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] px-3 pb-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ticks} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(248 84% 70%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(248 84% 70%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(290 84% 65%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(290 84% 65%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="spend" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCompactVND(v)} />
              <YAxis yAxisId="imp" orientation="right" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtCompact(v)} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, key) => {
                  const val = Number(value ?? 0);
                  return key === "spend"
                    ? ([fmtCompactVND(val), "Chi phí"] as [string, string])
                    : ([fmtCompact(val), "Impressions"] as [string, string]);
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Area yAxisId="spend" type="monotone" dataKey="spend" stroke="hsl(248 84% 70%)" strokeWidth={2} fill="url(#spendGrad)" name="Chi phí" />
              <Area yAxisId="imp" type="monotone" dataKey="impressions" stroke="hsl(290 84% 65%)" strokeWidth={2} fill="url(#impGrad)" name="Impressions" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hook + Hold + CTR */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Hook / Hold / CTR theo ngày (%)</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] px-3 pb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ticks} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, key) =>
                  [fmtPct(Number(value ?? 0), 2), keyLabel(String(key))] as [string, string]
                }
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="hook_rate" stroke="hsl(248 84% 70%)" strokeWidth={2} dot={false} name="Hook" />
              <Line type="monotone" dataKey="hold_rate" stroke="hsl(152 60% 55%)" strokeWidth={2} dot={false} name="Hold" />
              <Line type="monotone" dataKey="ctr_link" stroke="hsl(38 92% 60%)" strokeWidth={2} dot={false} name="CTR" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  padding: "6px 10px",
};

function keyLabel(k: string) {
  return k === "hook_rate" ? "Hook" : k === "hold_rate" ? "Hold" : k === "ctr_link" ? "CTR" : k;
}
