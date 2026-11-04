import React from "react";

interface ProductStatsBarProps {
  totalCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export const ProductStatsBar: React.FC<ProductStatsBarProps> = ({
  totalCount,
  lowStockCount,
  outOfStockCount,
}) => {
  const safeCount = Math.max(0, totalCount - lowStockCount - outOfStockCount);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-0 bg-transparent sm:bg-surface sm:border sm:border-border sm:rounded-md sm:divide-x divide-border">
      <div className="p-3 sm:p-3.5 bg-surface sm:bg-transparent border sm:border-0 border-border rounded-md sm:rounded-none">
        <span className="text-xs text-text-muted block truncate">Total Produk</span>
        <span className="text-lg sm:text-xl font-bold text-text font-mono num mt-0.5 block">
          {totalCount}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block truncate">Item terdaftar</span>
      </div>

      <div className="p-3 sm:p-3.5 bg-surface sm:bg-transparent border sm:border-0 border-border rounded-md sm:rounded-none">
        <span className="text-xs text-text-muted block truncate">Stok Aman</span>
        <span className="text-lg sm:text-xl font-bold text-positive font-mono num mt-0.5 block">
          {safeCount}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block truncate">Stok mencukupi</span>
      </div>

      <div className="p-3 sm:p-3.5 bg-surface sm:bg-transparent border sm:border-0 border-border rounded-md sm:rounded-none">
        <span className="text-xs text-text-muted block truncate">Stok Menipis</span>
        <span className="text-lg sm:text-xl font-bold text-warning font-mono num mt-0.5 block">
          {lowStockCount}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block truncate">Perlu ditambah</span>
      </div>

      <div className="p-3 sm:p-3.5 bg-surface sm:bg-transparent border sm:border-0 border-border rounded-md sm:rounded-none">
        <span className="text-xs text-text-muted block truncate">Stok Habis</span>
        <span className="text-lg sm:text-xl font-bold text-negative font-mono num mt-0.5 block">
          {outOfStockCount}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block truncate">Segera restock</span>
      </div>
    </div>
  );
};

