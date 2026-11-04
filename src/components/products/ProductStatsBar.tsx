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
    <div className="grid grid-cols-2 sm:grid-cols-4 bg-surface border border-border rounded-md divide-x divide-border">
      <div className="p-3.5">
        <span className="text-xs text-text-muted block">Total Produk</span>
        <span className="text-xl font-bold text-text font-mono num mt-0.5 block">
          {totalCount}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block">Item terdaftar</span>
      </div>

      <div className="p-3.5">
        <span className="text-xs text-text-muted block">Stok Aman</span>
        <span className="text-xl font-bold text-positive font-mono num mt-0.5 block">
          {safeCount}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block">Stok mencukupi</span>
      </div>

      <div className="p-3.5">
        <span className="text-xs text-text-muted block">Stok Menipis</span>
        <span className="text-xl font-bold text-warning font-mono num mt-0.5 block">
          {lowStockCount}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block">Perlu ditambah</span>
      </div>

      <div className="p-3.5">
        <span className="text-xs text-text-muted block">Stok Habis</span>
        <span className="text-xl font-bold text-negative font-mono num mt-0.5 block">
          {outOfStockCount}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block">Segera restock</span>
      </div>
    </div>
  );
};

