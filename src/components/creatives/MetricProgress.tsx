"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MetricProgressProps {
  label: string;
  value: number; // raw value (e.g. 55.4 for 55.4%)
  max?: number; // upper bound for the bar (default 100 for %)
  unit?: string;
  hint?: string;
  tone?: "default" | "success" | "warning" | "destructive";
}

const TONE_MAP: Record<NonNullable<MetricProgressProps["tone"]>, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

export function MetricProgress({
  label,
  value,
  max = 100,
  unit = "%",
  hint,
  tone = "default",
}: MetricProgressProps) {
  const ratio = Math.max(0, Math.min(100, (value / max) * 100));
  const display = Number.isFinite(value) ? value.toFixed(1) : "—";

  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-muted-foreground">{label}</span>
          {hint && <span className="text-muted-foreground/70">{hint}</span>}
        </div>
        <span className="font-semibold tabular-nums text-foreground">
          {display}
          <span className="text-muted-foreground"> {unit}</span>
        </span>
      </div>
      <Progress
        value={ratio}
        className="mt-1.5 h-1.5 bg-secondary/40"
        indicatorClassName={cn(TONE_MAP[tone])}
      />
    </div>
  );
}
