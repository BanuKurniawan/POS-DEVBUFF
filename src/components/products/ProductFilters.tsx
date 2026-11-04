import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CategoryDTO } from "@/types";

export type StockFilterType = "all" | "available" | "low" | "out";

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: CategoryDTO[];
  stockFilter: StockFilterType;
  onStockFilterChange: (filter: StockFilterType) => void;
  lowStockCount: number;
  outOfStockCount: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  stockFilter,
  onStockFilterChange,
  lowStockCount,
  outOfStockCount,
}) => {
  return (
    <div className="bg-surface p-3 sm:p-3.5 rounded-md border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
      <div className="flex-1 w-full sm:max-w-xs">
        <Input
          placeholder="Cari nama, SKU, atau barcode..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none">
        <div className="w-full xs:w-40 shrink-0">
          <Select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="inline-flex items-center p-0.5 bg-surface-subtle border border-border rounded-md shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => onStockFilterChange("all")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-colors whitespace-nowrap ${
              stockFilter === "all"
                ? "bg-surface text-text shadow-2xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => onStockFilterChange("available")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-colors whitespace-nowrap ${
              stockFilter === "available"
                ? "bg-surface text-text shadow-2xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            Aman
          </button>
          <button
            type="button"
            onClick={() => onStockFilterChange("low")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-colors whitespace-nowrap ${
              stockFilter === "low"
                ? "bg-surface text-text shadow-2xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            Menipis ({lowStockCount})
          </button>
          <button
            type="button"
            onClick={() => onStockFilterChange("out")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-colors whitespace-nowrap ${
              stockFilter === "out"
                ? "bg-surface text-text shadow-2xs"
                : "text-text-muted hover:text-text"
            }`}
          >
            Habis ({outOfStockCount})
          </button>
        </div>
      </div>
    </div>
  );
};

