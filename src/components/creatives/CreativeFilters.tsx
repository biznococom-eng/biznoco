"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarIcon,
  Search,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SortKey } from "@/lib/creative-aggregator";

interface CreativeFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  range: DateRange | undefined;
  onRangeChange: (r: DateRange | undefined) => void;
  sortBy: SortKey;
  onSortByChange: (k: SortKey) => void;
  onReset: () => void;
  resultCount: number;
}

const SORT_LABEL: Record<SortKey, string> = {
  spend: "Spend (cao → thấp)",
  hook_rate: "Hook Rate",
  hold_rate: "Hold Rate",
  roas: "ROAS",
  ctr_link: "CTR (link)",
  impressions: "Impressions",
};

export function CreativeFilters({
  search,
  onSearchChange,
  range,
  onRangeChange,
  sortBy,
  onSortByChange,
  onReset,
  resultCount,
}: CreativeFiltersProps) {
  const dateLabel = range?.from
    ? range.to
      ? `${format(range.from, "dd/MM/yyyy", { locale: vi })} → ${format(range.to, "dd/MM/yyyy", { locale: vi })}`
      : format(range.from, "dd/MM/yyyy", { locale: vi })
    : "Chọn khoảng ngày";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur-sm md:flex-row md:items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên chiến dịch / quảng cáo..."
          className="pl-9"
        />
      </div>

      {/* Date Range */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[240px] justify-start font-normal",
              !range?.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {dateLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={onRangeChange}
            numberOfMonths={2}
            defaultMonth={range?.from}
            locale={vi}
          />
        </PopoverContent>
      </Popover>

      {/* Sort */}
      <Select value={sortBy} onValueChange={(v) => onSortByChange(v as SortKey)}>
        <SelectTrigger className="min-w-[200px]">
          <ArrowUpDown className="mr-2 h-4 w-4 opacity-70" />
          <SelectValue placeholder="Sắp xếp theo" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
            <SelectItem key={k} value={k}>
              {SORT_LABEL[k]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset + count */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {resultCount} ad{resultCount === 1 ? "" : "s"}
        </Badge>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
