"use client";

import { User, Users, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "./CampaignOverviewSection";
import { fmtCompact, fmtCompactVND, fmtPct } from "@/lib/creative-aggregator";
import type { MockBreakdown } from "@/mock/dilinh-campaign";

interface Props {
  rows: MockBreakdown[];
}

export function CampaignGenderSection({ rows }: Props) {
  const male = rows.find((r) => r.gender === "male") ?? rows[0];
  const female = rows.find((r) => r.gender === "female") ?? rows[1];

  // Insight
  const winner = male.ctr_link >= female.ctr_link ? male : female;
  const loser = winner === male ? female : male;
  const wName = winner === male ? "Nam" : "Nữ";
  const lName = loser === male ? "Nam" : "Nữ";
  const ctrDiff = ((winner.ctr_link / loser.ctr_link - 1) * 100).toFixed(0);
  const cpcDiff = ((1 - winner.cpc_link / loser.cpc_link) * 100).toFixed(0);

  return (
    <Card>
      <CardContent className="p-6">
        <SectionHeader
          title="NHÂN KHẨU HỌC — GIỚI TÍNH"
          subtitle="Phân bổ ngân sách & hiệu suất theo giới"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <GenderCard
            type="male"
            row={male}
            iconBg="from-blue-500/30 to-cyan-500/20"
            iconColor="text-blue-300"
          />
          <GenderCard
            type="female"
            row={female}
            iconBg="from-teal-500/30 to-cyan-500/20"
            iconColor="text-teal-300"
          />
        </div>

        {/* Insight card */}
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warning/15">
            <Lightbulb className="h-5 w-5 text-warning" />
          </div>
          <div className="text-sm">
            <p>
              <b>{wName} CTR cao hơn {ctrDiff}%</b> và CPC thấp hơn {cpcDiff}% so với {lName}.
            </p>
            <p className="mt-1 text-muted-foreground">
              → Ưu tiên phân bổ ngân sách cho {wName}, test creative khác cho {lName}.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GenderCard({
  type,
  row,
  iconBg,
  iconColor,
}: {
  type: "male" | "female";
  row: MockBreakdown;
  iconBg: string;
  iconColor: string;
}) {
  const label = type === "male" ? "NAM (Male)" : "NỮ (Female)";
  const Icon = type === "male" ? User : Users;
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className="text-base font-bold">{label}</h3>
            <p className="text-xs text-muted-foreground">
              {row.spend_share.toFixed(1)}% chi tiêu
            </p>
          </div>
        </div>
        <Badge variant="secondary">{fmtPct(row.ctr_link, 2)} CTR</Badge>
      </div>

      <div className="mt-4 space-y-3">
        <Progress value={row.spend_share} className="h-2" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <StatBlock label="Chi tiêu" value={fmtCompactVND(row.spend)} />
          <StatBlock label="Impressions" value={fmtCompact(row.impressions)} />
          <StatBlock label="CTR" value={fmtPct(row.ctr_link, 2)} highlight />
          <StatBlock label="CPC" value={fmtCompactVND(row.cpc_link)} highlight />
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-0.5 font-bold tabular-nums ${highlight ? "text-primary" : ""}`}>
        {value}
      </div>
    </div>
  );
}
