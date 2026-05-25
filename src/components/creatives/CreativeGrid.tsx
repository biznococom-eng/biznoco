"use client";

import { useMemo } from "react";
import { CreativeCard } from "./CreativeCard";
import { sortAggregated, type CreativeAggregated, type SortKey } from "@/lib/creative-aggregator";
import { Card } from "@/components/ui/card";
import { SearchX } from "lucide-react";

interface CreativeGridProps {
  data: CreativeAggregated[];
  sortBy: SortKey;
  totalSpend: number;
}

export function CreativeGrid({ data, sortBy, totalSpend }: CreativeGridProps) {
  const sorted = useMemo(() => sortAggregated(data, sortBy), [data, sortBy]);

  if (sorted.length === 0) {
    return (
      <Card className="grid place-items-center py-16 text-center">
        <SearchX className="mb-3 h-10 w-10 text-muted-foreground/60" />
        <div className="text-base font-semibold">Không có quảng cáo nào khớp bộ lọc</div>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Thử nới khoảng ngày hoặc xoá từ khoá tìm kiếm để xem thêm creative.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sorted.map((c) => (
        <CreativeCard
          key={c.ad_id}
          c={c}
          spendShare={totalSpend > 0 ? (c.spend / totalSpend) * 100 : 0}
        />
      ))}
    </div>
  );
}
