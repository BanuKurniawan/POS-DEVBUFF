import React from "react";
import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export type FilterPeriodType = "all" | "today" | "week" | "month" | "custom";

interface TransactionFilterToolbarProps {
  filterType: FilterPeriodType;
  onFilterChange: (type: FilterPeriodType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  startDate: string;
  onStartDateChange: (d: string) => void;
  endDate: string;
  onEndDateChange: (d: string) => void;
  onApplyCustomDate: () => void;
  isPending: boolean;
}

export const TransactionFilterToolbar: React.FC<TransactionFilterToolbarProps> = ({
  filterType,
  onFilterChange,
  searchQuery,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onApplyCustomDate,
  isPending,
}) => {
  const filterOptions: { id: FilterPeriodType; label: string }[] = [
    { id: "all", label: "Semua" },
    { id: "today", label: "Hari Ini" },
    { id: "week", label: "7 Hari" },
    { id: "month", label: "Bulan Ini" },
    { id: "custom", label: "Kustom Tanggal" },
  ];

  return (
    <div className="bg-surface p-3.5 rounded-md border border-border space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Time Filter Pills */}
        <div className="inline-flex items-center p-0.5 bg-surface-subtle border border-border rounded-md shrink-0 flex-wrap">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-sm transition-colors ${
                filterType === f.id
                  ? "bg-surface text-text shadow-2xs font-bold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Cari no faktur, kasir, atau catatan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {filterType === "custom" && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-text-muted font-medium">Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="px-2.5 py-1 bg-surface border border-border rounded-md text-xs font-mono num focus:border-text focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-text-muted font-medium">Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="px-2.5 py-1 bg-surface border border-border rounded-md text-xs font-mono num focus:border-text focus:outline-hidden"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onApplyCustomDate}
            isLoading={isPending}
          >
            Terapkan
          </Button>
        </div>
      )}
    </div>
  );
};

