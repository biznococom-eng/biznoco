"use client";

import { useMemo, useRef, useState } from "react";
import { toCSV, downloadCSV } from "@/lib/csv";
import {
  extractFromCSV,
  extractFromJSON,
  DEMO_DATASET_CSV,
  type ExtractStats,
  type Lead,
} from "@/lib/fb-dataset";
import { fmtCompact, fmtNumber } from "@/lib/format";

type Result = { leads: Lead[]; stats: ExtractStats; headers: string[] };

export default function DatasetPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [fileName, setFileName] = useState("");
  const [filterSource, setFilterSource] = useState<string>("__all");
  const [filterCampaign, setFilterCampaign] = useState<string>("__all");
  const [filterContact, setFilterContact] = useState<"all" | "email" | "phone" | "both">("all");
  const [search, setSearch] = useState("");
  const [drag, setDrag] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function ingest(text: string, name: string) {
    const t = text.trim();
    if (!t) return;
    const isJson = t.startsWith("[") || t.startsWith("{");
    const r = isJson ? extractFromJSON(t) : extractFromCSV(t);
    if (r.leads.length === 0) {
      alert("Không trích xuất được bản ghi nào. Kiểm tra định dạng file.");
      return;
    }
    setResult(r);
    setFileName(name);
  }

  function onFile(f: File | undefined | null) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => ingest(String(reader.result || ""), f.name);
    reader.readAsText(f, "utf-8");
  }

  function loadDemo() {
    ingest(DEMO_DATASET_CSV, "demo-leads.csv");
  }

  const filtered = useMemo(() => {
    if (!result) return [];
    const q = search.trim().toLowerCase();
    return result.leads.filter((l) => {
      if (filterSource !== "__all" && l.source !== filterSource) return false;
      if (filterCampaign !== "__all" && l.campaign !== filterCampaign) return false;
      if (filterContact === "email" && !l.email) return false;
      if (filterContact === "phone" && !l.phone) return false;
      if (filterContact === "both" && !(l.email && l.phone)) return false;
      if (q) {
        const blob = `${l.name} ${l.email} ${l.phone} ${l.city} ${l.campaign}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [result, filterSource, filterCampaign, filterContact, search]);

  function exportClean() {
    if (!result) return;
    const cols = ["Họ tên", "Email", "Số điện thoại", "Thành phố", "Nguồn", "Chiến dịch", "Ngày"];
    const rows = filtered.map((l) => ({
      "Họ tên": l.name,
      Email: l.email,
      "Số điện thoại": l.phone,
      "Thành phố": l.city,
      Nguồn: l.source,
      "Chiến dịch": l.campaign,
      Ngày: l.createdAt,
    }));
    downloadCSV("biznoco-leads.csv", toCSV(rows, cols));
  }

  const maxBar = result ? Math.max(1, ...result.stats.byDate.map((d) => d.count)) : 1;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Trích xuất Dataset Facebook</h1>
          <p className="page-sub">
            Tải dataset Lead Ads / Conversions / Audiences (CSV hoặc JSON) — Biznoco tự
            động nhận diện email, số điện thoại, khử trùng lặp và sẵn sàng để import vào CRM.
          </p>
        </div>
        <div className="row">
          {result && (
            <>
              <span className="tag tag-ok">
                ● {fmtNumber(result.stats.total)} bản ghi
              </span>
              {result.stats.duplicates > 0 && (
                <span className="tag tag-warn">
                  ⊘ {result.stats.duplicates} trùng đã lọc
                </span>
              )}
              <button className="btn btn-primary btn-sm" onClick={exportClean}>
                ⤓ Xuất CSV ({filtered.length})
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setResult(null);
                  setFileName("");
                }}
              >
                ✕ Xoá
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
            <div style={{ fontSize: 40, marginBottom: 6 }}>📂</div>
            <div className="dropzone-title">Kéo file CSV / JSON vào đây hoặc bấm để chọn</div>
            <div className="dropzone-sub">
              Hỗ trợ: Lead Ads export (CSV), Graph API response (JSON), Events Manager,
              Custom Audiences, Insights.
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.json,text/csv,application/json"
              style={{ display: "none" }}
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>

          <div className="row" style={{ marginTop: 18, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={loadDemo}>
              ✨ Dùng dữ liệu demo
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setPasteOpen((v) => !v)}
            >
              {pasteOpen ? "▲ Đóng dán dữ liệu" : "▼ Dán dữ liệu thủ công"}
            </button>
          </div>

          {pasteOpen && (
            <div style={{ marginTop: 16 }}>
              <label className="label">Dán nội dung CSV hoặc JSON vào đây</label>
              <textarea
                rows={9}
                placeholder="Ví dụ: created_time,full_name,email,phone_number..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
              <div className="row" style={{ marginTop: 10 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => ingest(pasteText, "paste.txt")}
                  disabled={!pasteText.trim()}
                >
                  Trích xuất
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPasteText("")}
                >
                  Xoá
                </button>
              </div>
            </div>
          )}

          <div className="divider" />

          <div className="grid grid-2">
            <Tip
              title="🎯 Biznoco tự động phát hiện"
              body={
                <ul style={{ paddingLeft: 20, color: "var(--text-1)", fontSize: 13 }}>
                  <li><b>Email</b> — regex chuẩn RFC, normalize lowercase</li>
                  <li><b>Số điện thoại VN</b> — chuẩn hoá +84 → 0xx, bỏ ký tự thừa</li>
                  <li><b>Họ tên</b> — từ field <i>full_name</i>, <i>name</i>, <i>họ tên</i></li>
                  <li><b>Trùng lặp</b> — tự loại nếu trùng email/sđt/tên</li>
                </ul>
              }
            />
            <Tip
              title="📥 Nguồn dataset thường gặp"
              body={
                <ul style={{ paddingLeft: 20, color: "var(--text-1)", fontSize: 13 }}>
                  <li>Lead Ads → Forms Library → Download CSV</li>
                  <li>Graph API <code>/leads</code> → JSON response</li>
                  <li>Events Manager → Custom Conversion → Export</li>
                  <li>Audiences → Saved Audience → Export CSV</li>
                </ul>
              }
            />
          </div>
        </div>
      )}

      {result && (
        <>
          <div className="grid grid-stats">
            <Stat label="Tổng bản ghi" value={fmtNumber(result.stats.total)} />
            <Stat
              label="Có email"
              value={`${fmtNumber(result.stats.withEmail)} (${pct(
                result.stats.withEmail,
                result.stats.total,
              )}%)`}
            />
            <Stat
              label="Có SĐT"
              value={`${fmtNumber(result.stats.withPhone)} (${pct(
                result.stats.withPhone,
                result.stats.total,
              )}%)`}
            />
            <Stat
              label="Có họ tên"
              value={`${fmtNumber(result.stats.withName)} (${pct(
                result.stats.withName,
                result.stats.total,
              )}%)`}
            />
          </div>

          <div className="grid grid-2" style={{ marginTop: 18 }}>
            <div className="card">
              <div className="card-head">
                <div className="card-title">Lead theo ngày</div>
              </div>
              {result.stats.byDate.length > 0 ? (
                <div className="barchart">
                  {result.stats.byDate.map((d, i) => (
                    <div
                      key={i}
                      className="bar"
                      style={{ height: `${(d.count / maxBar) * 100}%` }}
                    >
                      <div className="tip">
                        <b>{d.name}</b>
                        <br />
                        {d.count} lead
                      </div>
                      <div className="label">{d.name.slice(5)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">Không có dữ liệu ngày</div>
              )}
              <div style={{ height: 26 }} />
            </div>
            <div className="card">
              <div className="card-head">
                <div className="card-title">Phân bổ theo nguồn</div>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nguồn</th>
                    <th className="num">Lead</th>
                    <th className="num">Tỉ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {result.stats.bySource.map((s) => (
                    <tr key={s.name}>
                      <td>{s.name}</td>
                      <td className="num">{fmtNumber(s.count)}</td>
                      <td className="num">{pct(s.count, result.stats.total)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ marginTop: 18 }}>
            <div className="card-head">
              <div className="card-title">
                Danh sách lead{" "}
                <span style={{ color: "var(--text-3)", fontWeight: 500, fontSize: 13 }}>
                  ({fmtNumber(filtered.length)}/{fmtNumber(result.stats.total)})
                </span>
              </div>
              <span className="tag">{fileName}</span>
            </div>
            <div className="row" style={{ marginBottom: 14 }}>
              <input
                placeholder="Tìm theo tên / email / SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 260 }}
              />
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                style={{ width: 180 }}
              >
                <option value="__all">Tất cả nguồn</option>
                {result.stats.bySource.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.count})
                  </option>
                ))}
              </select>
              <select
                value={filterCampaign}
                onChange={(e) => setFilterCampaign(e.target.value)}
                style={{ width: 220 }}
              >
                <option value="__all">Tất cả chiến dịch</option>
                {result.stats.byCampaign.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.count})
                  </option>
                ))}
              </select>
              <select
                value={filterContact}
                onChange={(e) => setFilterContact(e.target.value as typeof filterContact)}
                style={{ width: 180 }}
              >
                <option value="all">Tất cả</option>
                <option value="email">Có email</option>
                <option value="phone">Có SĐT</option>
                <option value="both">Có cả email & SĐT</option>
              </select>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>TP</th>
                    <th>Chiến dịch</th>
                    <th>Nguồn</th>
                    <th>Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 200).map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 600 }}>{l.name || "—"}</td>
                      <td>{l.email || <span style={{ color: "var(--text-3)" }}>—</span>}</td>
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>
                        {l.phone || <span style={{ color: "var(--text-3)" }}>—</span>}
                      </td>
                      <td>{l.city || "—"}</td>
                      <td>
                        <span className="tag">{l.campaign || "—"}</span>
                      </td>
                      <td>{l.source}</td>
                      <td style={{ color: "var(--text-2)" }}>{l.createdAt || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 200 && (
              <div className="help" style={{ marginTop: 8 }}>
                Hiển thị 200 dòng đầu — xuất CSV để xem toàn bộ {fmtCompact(filtered.length)} bản ghi.
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function pct(a: number, b: number): string {
  if (b === 0) return "0";
  return ((a / b) * 100).toFixed(0);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
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
