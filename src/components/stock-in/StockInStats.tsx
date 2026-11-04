import React from "react";

interface StockInStatsProps {
  totalIn: number;
  totalOut: number;
  totalCount: number;
}

export const StockInStats: React.FC<StockInStatsProps> = ({
  totalIn,
  totalOut,
  totalCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 bg-surface border border-border rounded-md divide-y sm:divide-y-0 sm:divide-x divide-border">
      <div className="p-3.5">
        <span className="text-xs text-text-muted block">Total Barang Masuk (IN)</span>
        <span className="text-xl font-bold text-positive font-mono num mt-0.5 block">
          +{totalIn} unit
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block">Dari pembelian/restock</span>
      </div>

      <div className="p-3.5">
        <span className="text-xs text-text-muted block">Total Barang Keluar (OUT)</span>
        <span className="text-xl font-bold text-text font-mono num mt-0.5 block">
          -{totalOut} unit
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block">Otomatis dari POS kasir</span>
      </div>

      <div className="p-3.5">
        <span className="text-xs text-text-muted block">Total Riwayat Pergerakan</span>
        <span className="text-xl font-bold text-text font-mono num mt-0.5 block">
          {totalCount} transaksi
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block">Paling baru dicatat</span>
      </div>
    </div>
  );
};

