"use client";

import { Smartphone, Tablet, Monitor, Apple, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "./CampaignOverviewSection";
import { fmtCompact, fmtCompactVND, fmtPct } from "@/lib/creative-aggregator";
import type { MockBreakdown } from "@/mock/dilinh-campaign";

interface Props {
  devices: MockBreakdown[];
  platforms: MockBreakdown[];
}

export function CampaignDeviceSection({ devices, platforms }: Props) {
  const iphone = devices.find((d) => /iphone|ios/i.test(d.value));
  const android = devices.find((d) => /android.+phone/i.test(d.value));
  const showInsight = iphone && android && android.ctr_link > 0;
  const ratio = showInsight ? iphone.ctr_link / android.ctr_link : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <SectionHeader
          title="NHÂN KHẨU HỌC — THIẾT BỊ & NỀN TẢNG"
          subtitle="Phân bổ traffic theo device + Facebook/Instagram"
        />

        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          {/* Devices table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="border-b border-border/40 px-2 py-2 text-left">Thiết bị</th>
                  <th className="border-b border-border/40 px-2 py-2 text-right">Impr.</th>
                  <th className="border-b border-border/40 px-2 py-2 text-right">Spend</th>
                  <th className="border-b border-border/40 px-2 py-2 text-right">CTR</th>
                  <th className="border-b border-border/40 px-2 py-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.value} className="border-t border-border/40">
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2 font-semibold">
                        <DeviceIcon name={d.value} />
                        {d.value}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {fmtCompact(d.impressions)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {fmtCompactVND(d.spend)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {d.ctr_link > 0 ? fmtPct(d.ctr_link, 2) : "—"}
                    </td>
                    <td className="px-2 py-2 text-right text-xs text-muted-foreground tabular-nums">
                      {fmtPct(d.spend_share, 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Platform breakdown */}
          <div className="rounded-lg border border-border/40 bg-secondary/30 p-4">
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Nền tảng phân phối
            </h4>
            <div className="space-y-3">
              {platforms.map((p) => (
                <div key={p.value}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold">{p.value}</span>
                    <span className="font-bold tabular-nums">
                      {fmtPct(p.spend_share, 1)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary/50">
                    <div
                      className={`h-full rounded-full ${
                        /instagram/i.test(p.value)
                          ? "bg-gradient-to-r from-fuchsia-500 to-pink-500"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500"
                      }`}
                      style={{ width: `${p.spend_share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showInsight && ratio > 1.4 && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
            <Apple className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">
                iPhone CTR {fmtPct(iphone!.ctr_link, 2)} — gấp {ratio.toFixed(1)}× Android
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Audience iOS thường có tài chính cao hơn → tạo creative 9:16 dọc tối ưu
                Stories/Reels cho iOS, tăng bid riêng cho iPhone audience.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DeviceIcon({ name }: { name: string }) {
  const cls = "h-3.5 w-3.5";
  if (/iphone/i.test(name)) return <Apple className={cls} />;
  if (/android.+phone/i.test(name)) return <Bot className={cls} />;
  if (/tablet/i.test(name)) return <Tablet className={cls} />;
  if (/desktop/i.test(name)) return <Monitor className={cls} />;
  return <Smartphone className={cls} />;
}
