export function fmtNumber(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("vi-VN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtMoney(n: number, currency = "VND"): string {
  if (!Number.isFinite(n)) return "—";
  if (currency === "VND") {
    return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";
  }
  return n.toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
}

export function fmtPct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits) + "%";
}

export function fmtCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " tỷ";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + " tr";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Math.round(n).toString();
}
