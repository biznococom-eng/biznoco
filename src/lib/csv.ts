// Minimal CSV parser — handles quoted cells, escaped quotes, newlines inside quotes.
// No external deps; good enough for Facebook Ads / Lead Ads exports.

export type CSVRow = Record<string, string>;

export function parseCSV(text: string): { headers: string[]; rows: CSVRow[] } {
  const cleaned = text.replace(/^﻿/, ""); // strip BOM
  const records = splitRecords(cleaned);
  if (records.length === 0) return { headers: [], rows: [] };

  const headers = records[0].map((h) => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < records.length; i++) {
    const cells = records[i];
    if (cells.length === 1 && cells[0] === "") continue;
    const row: CSVRow = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (cells[j] ?? "").trim();
    }
    rows.push(row);
  }
  return { headers, rows };
}

function splitRecords(text: string): string[][] {
  const records: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      cur.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      cur.push(field);
      records.push(cur);
      cur = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  // last field
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    records.push(cur);
  }
  return records;
}

export function toCSV(rows: CSVRow[], headers?: string[]): string {
  const cols = headers ?? Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (v: string) => {
    if (/[",\r\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
    return v;
  };
  const out: string[] = [cols.map(escape).join(",")];
  for (const r of rows) {
    out.push(cols.map((c) => escape(r[c] ?? "")).join(","));
  }
  return out.join("\r\n");
}

export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 0);
}

export function parseNumberLoose(v: string | undefined | null): number {
  if (v == null) return NaN;
  const s = String(v).replace(/[^0-9.,\-]/g, "").replace(/,(?=\d{3}(\D|$))/g, "");
  // Vietnamese style might use "," as decimal — handle if exactly one comma and no dot
  const dot = s.indexOf(".");
  const comma = s.indexOf(",");
  let normalized = s;
  if (comma !== -1 && dot === -1) {
    normalized = s.replace(",", ".");
  }
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}
