"use client";

import { useMemo, useRef, useState } from "react";
import { parseCSV, toCSV, downloadCSV } from "@/lib/csv";
import {
  aggregateAdsCSV,
  DEMO_ADS_CSV,
  type AdsParseResult,
} from "@/lib/fb-ads";
import { fmtCompact, fmtMoney, fmtNumber, fmtPct } from "@/lib/format";

type SortKey =
  | "spend"
  | "impressions"
  | "clicks"
  | "ctr"
  | "cpc"
  | "cpm"
  | "conversions"
  | "roas";

export default function AdsPage() {
  const [result, setResult] = useState<AdsParseResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [search, setSearch] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function ingestText(text: string, name: string) {
    const { headers, rows } = parseCSV(text);
    if (rows.length === 0) {
      alert("File rỗng hoặc không phải CSV hợp lệ.");
      return;
    }
    const r = aggregateAdsCSV(headers, rows);
    setResult(r);
    setFileName(name);
  }

  function onFile(f: File | undefined | null) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => ingestText(String(reader.result || ""), f.name);
    reader.readAsText(f, "utf-8");
  }

  function loadDemo() {
    ingestText(DEMO_ADS_CSV, "demo-ads.csv");
  }

  const filtered = useMemo(() => {
    if (!result) return [];
    const q = search.trim().toLowerCase();
    let list = q
      ? result.campaigns.filter((c) => c.name.toLowerCase().includes(q))
      : result.campaigns.slice();
    list = list.sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));
    return list;
  }, [result, sortKey, search]);

  const maxBar = useMemo(() => {
    if (!result) return 1;
    return Math.max(1, ...result.campaigns.map((c) => c.spend));
  }, [result]);

  function exportSummary() {
    if (!result) return;
    const cols = [
      "Tên chiến dịch",
      "Impressions",
      "Reach",
      "Clicks",
      "Chi phí",
      "Chuyển đổi",
      "Doanh thu",
      "CTR (%)",
      "CPC",
      "CPM",
      "CPR",
      "ROAS",
    ];
    const rows = filtered.map((c) => ({
      "Tên chiến dịch": c.name,
      Impressions: String(c.impressions),
      Reach: String(c.reach),
      Clicks: String(c.clicks),
      "Chi phí": String(Math.round(c.spend)),
      "Chuyển đổi": String(c.conversions),
      "Doanh thu": String(Math.round(c.conversionValue)),
      "CTR (%)": c.ctr.toFixed(2),
      CPC: String(Math.round(c.cpc)),
      CPM: String(Math.round(c.cpm)),
      CPR: String(Math.round(c.cpr)),
      ROAS: c.roas.toFixed(2),
    }));
    downloadCSV("biznoco-ads-summary.csv", toCSV(rows, cols));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Báo cáo Facebook Ads</h1>
          <p className="page-sub">
            Tải file CSV xuất từ Ads Manager (Reports → Export) — Biznoco tự động tổng hợp,
            tính CTR/CPC/CPM/ROAS và xếp hạng chiến dịch.
          </p>
        </div>
        <div className="row">
          {result && (
            <>
              <span className="tag tag-ok">● {result.totalRows} dòng</span>
              <button className="btn btn-ghost btn-sm" onClick={exportSummary}>
                ⤓ Xuất CSV tóm tắt
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setResult(null);
                  setFileName("");
                }}
              >
                ✕ Xoá báo cáo
              </button>
            </>
          )}
        </div>
      </div>

      {!result && (
        <div className="card">
          <div
            className={`dropzone${drag ? " drag" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              onFile(e.dataTransfer.files?.[0]);
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 6 }}>📊</div>
            <div className="dropzone-title">Kéo file CSV vào đây hoặc bấm để chọn</div>
            <div className="dropzone-sub">
              Hỗ trợ cột tiếng Anh (Ads Manager) hoặc tiếng Việt. Dữ liệu xử lý 100% trên trình
              duyệt — không upload lên server.
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
          <div className="row" style={{ marginTop: 18, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={loadDemo}>
              ✨ Dùng dữ liệu demo
            </button>
          </div>

          <div className="divider" />

          <div className="grid grid-2">
            <Tip
              title="📥 Cách export từ Ads Manager"
              body={
                <ol style={{ paddingLeft: 20, color: "var(--text-1)", fontSize: 13 }}>
                  <li>Vào Ads Manager → tab “Campaigns”.</li>
                  <li>Chọn khoảng thời gian + các chiến dịch cần xem.</li>
                  <li>Bấm “Reports” → “Export table data” → CSV.</li>
                  <li>Tải file CSV vừa export vào đây.</li>
                </ol>
              }
            />
            <Tip
              title="📐 Các chỉ số Biznoco tính"
              body={
                <ul style={{ paddingLeft: 20, color: "var(--text-1)", fontSize: 13 }}>
                  <li><b>CTR</b> = Clicks ÷ Impressions × 100%</li>
                  <li><b>CPC</b> = Chi phí ÷ Clicks</li>
                  <li><b>CPM</b> = Chi phí ÷ Impressions × 1.000</li>
                  <li><b>CPR</b> = Chi phí ÷ Chuyển đổi</li>
                  <li><b>ROAS</b> = Doanh thu ÷ Chi phí</li>
                </ul>
              }
            />
          </div>
        </div>
      )}

      {result && (
        <>
          <div className="grid grid-stats">
            <Stat label="Tổng chi phí" value={fmtMoney(result.totals.spend)} />
            <Stat label="Impressions" value={fmtCompact(result.totals.impressions)} />
            <Stat label="Clicks" value={fmtCompact(result.totals.clicks)} />
            <Stat label="CTR trung bình" value={fmtPct(result.totals.ctr)} />
            <Stat label="CPC trung bình" value={fmtMoney(result.totals.cpc)} />
            <Stat label="Chuyển đổi" value={fmtNumber(result.totals.conversions)} />
            <Stat
              label="ROAS"
              value={result.totals.roas.toFixed(2) + "×"}
              tone={
                result.totals.roas >= 3 ? "ok" : result.totals.roas >= 1.5 ? "warn" : "bad"
              }
            />
            <Stat label="Doanh thu ước tính" value={fmtMoney(result.totals.conversionValue)} />
          </div>

          <div className="card" style={{ marginTop: 18 }}>
            <div className="card-head">
              <div className="card-title">Chi phí theo chiến dịch</div>
              <span className="tag">{fileName}</span>
            </div>
            <div className="barchart">
              {result.campaigns.map((c, i) => {
                const h = (c.spend / maxBar) * 100;
                return (
                  <div
                    key={i}
                    className="bar"
                    style={{ height: `${Math.max(h, 2)}%` }}
                    title={`${c.name}: ${fmtMoney(c.spend)}`}
                  >
                    <div className="tip">
                      <b>{c.name}</b>
                      <br />
                      {fmtMoney(c.spend)} · ROAS {c.roas.toFixed(2)}×
                    </div>
                    <div className="label">
                      {c.name.length > 10 ? c.name.slice(0, 10) + "…" : c.name}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 26 }} />
          </div>

          <div className="card" style={{ marginTop: 18 }}>
            <div className="card-head">
              <div className="card-title">Chi tiết chiến dịch</div>
              <div className="row">
                <input
                  type="text"
                  placeholder="Tìm theo tên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 220 }}
                />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  style={{ width: 200 }}
                >
                  <option value="spend">Sắp xếp: Chi phí ↓</option>
                  <option value="impressions">Impressions ↓</option>
                  <option value="clicks">Clicks ↓</option>
                  <option value="ctr">CTR ↓</option>
                  <option value="cpc">CPC ↓</option>
                  <option value="cpm">CPM ↓</option>
                  <option value="conversions">Chuyển đổi ↓</option>
                  <option value="roas">ROAS ↓</option>
                </select>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Chiến dịch</th>
                    <th className="num">Impr.</th>
                    <th className="num">Clicks</th>
                    <th className="num">CTR</th>
                    <th className="num">CPC</th>
                    <th className="num">CPM</th>
                    <th className="num">Chi phí</th>
                    <th className="num">CĐ</th>
                    <th className="num">CPR</th>
                    <th className="num">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td className="num">{fmtCompact(c.impressions)}</td>
                      <td className="num">{fmtCompact(c.clicks)}</td>
                      <td className="num">{fmtPct(c.ctr)}</td>
                      <td className="num">{fmtMoney(c.cpc)}</td>
                      <td className="num">{fmtMoney(c.cpm)}</td>
                      <td className="num">{fmtMoney(c.spend)}</td>
                      <td className="num">{fmtNumber(c.conversions)}</td>
                      <td className="num">{c.cpr > 0 ? fmtMoney(c.cpr) : "—"}</td>
                      <td className="num">
                        <span
                          className={`tag ${
                            c.roas >= 3 ? "tag-ok" : c.roas >= 1.5 ? "tag-warn" : "tag-bad"
                          }`}
                        >
                          {c.roas.toFixed(2)}×
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="help" style={{ marginTop: 12 }}>
              Cột phát hiện được: {Object.entries(result.detectedColumns)
                .filter(([, v]) => v)
                .map(([k, v]) => `${k}=“${v}”`)
                .join(" · ") || "không có"}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad";
}) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div
        className="stat-value"
        style={
          tone === "ok"
            ? { color: "#6ee7b7" }
            : tone === "bad"
              ? { color: "#fca5a5" }
              : tone === "warn"
                ? { color: "#fde68a" }
                : undefined
        }
      >
        {value}
      </div>
    </div>
  );
}

function Tip({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bg-2)",
        padding: 18,
        borderRadius: 12,
        border: "1px solid var(--border)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {body}
    </div>
  );
}
