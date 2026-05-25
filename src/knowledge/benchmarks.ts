/**
 * 📚 Knowledge Base — Ad Benchmarks (cập nhật Q2 2026)
 *
 * Nguồn:
 * - WordStream Google Ads & Facebook benchmark reports 2025
 * - Hootsuite Social Media Industry Report 2025
 * - Statista Facebook Ads benchmark Vietnam 2025
 * - Internal data từ user portfolio (anonymized)
 *
 * Cách thêm: chỉ cần insert vào `INDUSTRY_BENCHMARKS` hoặc `OBJECTIVE_BENCHMARKS`.
 * Rule engine tự pickup.
 */

export type BenchmarkTier = "excellent" | "good" | "average" | "poor";

export interface MetricThresholds {
  /** Lower bound for "excellent" tier (above this = excellent) */
  excellent: number;
  /** Lower bound for "good" tier */
  good: number;
  /** Lower bound for "average" tier (below this = poor) */
  average: number;
  unit: string;
  better: "higher" | "lower";
}

/**
 * Industry-agnostic benchmarks cho Facebook Ads.
 * Áp dụng khi không có industry-specific data.
 */
export const GENERAL_BENCHMARKS = {
  ctr_link: {
    excellent: 3.0,
    good: 1.5,
    average: 0.9,
    unit: "%",
    better: "higher",
  } as MetricThresholds,
  cpc_link_vnd: {
    excellent: 2_000,
    good: 5_000,
    average: 10_000,
    unit: "₫",
    better: "lower",
  } as MetricThresholds,
  cpm_vnd: {
    excellent: 30_000,
    good: 60_000,
    average: 100_000,
    unit: "₫",
    better: "lower",
  } as MetricThresholds,
  frequency: {
    excellent: 1.5,
    good: 2.0,
    average: 3.0,
    unit: "×",
    better: "lower",
  } as MetricThresholds,
  hook_rate: {
    excellent: 50.0,
    good: 35.0,
    average: 25.0,
    unit: "%",
    better: "higher",
  } as MetricThresholds,
  hold_rate: {
    excellent: 75.0,
    good: 60.0,
    average: 45.0,
    unit: "%",
    better: "higher",
  } as MetricThresholds,
  cost_per_conversation_vnd: {
    excellent: 15_000,
    good: 30_000,
    average: 50_000,
    unit: "₫",
    better: "lower",
  } as MetricThresholds,
};

/**
 * Industry-specific benchmarks — overrides GENERAL.
 * Key = industry code (mapped from Meta `vertical` hoặc tự nhận diện từ ad text).
 */
export const INDUSTRY_BENCHMARKS: Record<
  string,
  Partial<Record<keyof typeof GENERAL_BENCHMARKS, MetricThresholds>>
> = {
  // BĐS — Real estate
  real_estate: {
    ctr_link: { excellent: 2.5, good: 1.3, average: 0.7, unit: "%", better: "higher" },
    cpc_link_vnd: { excellent: 3_000, good: 8_000, average: 15_000, unit: "₫", better: "lower" },
    cpm_vnd: { excellent: 40_000, good: 80_000, average: 150_000, unit: "₫", better: "lower" },
    cost_per_conversation_vnd: { excellent: 25_000, good: 50_000, average: 100_000, unit: "₫", better: "lower" },
  },
  // E-commerce / shop online
  ecommerce: {
    ctr_link: { excellent: 3.5, good: 2.0, average: 1.2, unit: "%", better: "higher" },
    cpc_link_vnd: { excellent: 1_500, good: 4_000, average: 8_000, unit: "₫", better: "lower" },
    cpm_vnd: { excellent: 25_000, good: 50_000, average: 90_000, unit: "₫", better: "lower" },
  },
  // Mỹ phẩm / Beauty
  beauty: {
    ctr_link: { excellent: 4.0, good: 2.5, average: 1.5, unit: "%", better: "higher" },
    cpc_link_vnd: { excellent: 1_200, good: 3_500, average: 7_000, unit: "₫", better: "lower" },
  },
  // F&B
  fnb: {
    ctr_link: { excellent: 3.0, good: 1.8, average: 1.0, unit: "%", better: "higher" },
    cpc_link_vnd: { excellent: 800, good: 2_500, average: 5_000, unit: "₫", better: "lower" },
  },
  // Education
  education: {
    ctr_link: { excellent: 3.5, good: 2.0, average: 1.2, unit: "%", better: "higher" },
    cpc_link_vnd: { excellent: 2_500, good: 6_000, average: 12_000, unit: "₫", better: "lower" },
  },
};

/**
 * Objective-specific overrides (CONVERSIONS, MESSAGES, TRAFFIC...).
 */
export const OBJECTIVE_BENCHMARKS: Record<
  string,
  Partial<Record<keyof typeof GENERAL_BENCHMARKS, MetricThresholds>>
> = {
  MESSAGES: {
    // Messenger campaigns thường có CTR thấp hơn nhưng cost-per-convo là KPI chính
    ctr_link: { excellent: 2.0, good: 1.0, average: 0.5, unit: "%", better: "higher" },
  },
  TRAFFIC: {
    ctr_link: { excellent: 3.5, good: 2.0, average: 1.2, unit: "%", better: "higher" },
  },
  BRAND_AWARENESS: {
    cpm_vnd: { excellent: 20_000, good: 40_000, average: 70_000, unit: "₫", better: "lower" },
    frequency: { excellent: 2.0, good: 3.0, average: 4.5, unit: "×", better: "lower" },
  },
};

/**
 * Resolve threshold: industry > objective > general
 */
export function resolveThreshold(
  metric: keyof typeof GENERAL_BENCHMARKS,
  industry?: string,
  objective?: string,
): MetricThresholds {
  if (industry && INDUSTRY_BENCHMARKS[industry]?.[metric]) {
    return INDUSTRY_BENCHMARKS[industry][metric]!;
  }
  if (objective && OBJECTIVE_BENCHMARKS[objective]?.[metric]) {
    return OBJECTIVE_BENCHMARKS[objective][metric]!;
  }
  return GENERAL_BENCHMARKS[metric];
}

/**
 * Classify value vào tier (excellent/good/average/poor) dựa theo threshold.
 */
export function classifyMetric(value: number, threshold: MetricThresholds): BenchmarkTier {
  if (!Number.isFinite(value)) return "poor";
  if (threshold.better === "higher") {
    if (value >= threshold.excellent) return "excellent";
    if (value >= threshold.good) return "good";
    if (value >= threshold.average) return "average";
    return "poor";
  } else {
    // lower is better
    if (value <= threshold.excellent) return "excellent";
    if (value <= threshold.good) return "good";
    if (value <= threshold.average) return "average";
    return "poor";
  }
}
