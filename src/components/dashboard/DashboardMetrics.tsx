import React from "react";
import { formatRupiah } from "@/utils/format";

interface DashboardMetricsProps {
  todaySales: number;
  todayTransactions: number;
  estimatedProfit: number;
  avgBasket: number;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  todaySales,
  todayTransactions,
  estimatedProfit,
  avgBasket,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 bg-surface border border-border rounded-md divide-x divide-y lg:divide-y-0 divide-border">
      <div className="p-4 flex flex-col justify-between">
        <span className="text-xs text-text-muted font-medium">Penjualan Hari Ini</span>
        <div className="mt-2">
          <span className="text-2xl font-bold text-text font-mono num tracking-tight">
            {formatRupiah(todaySales)}
          </span>
          <span className="text-[11px] text-text-muted block mt-0.5">Total omset masuk</span>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between">
        <span className="text-xs text-text-muted font-medium">Jumlah Transaksi</span>
        <div className="mt-2">
          <span className="text-2xl font-bold text-text font-mono num tracking-tight">
            {todayTransactions}
          </span>
          <span className="text-[11px] text-text-muted block mt-0.5">Struk belanja selesai</span>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between">
        <span className="text-xs text-text-muted font-medium">Estimasi Laba Kotor</span>
        <div className="mt-2">
          <span className="text-2xl font-bold text-text font-mono num tracking-tight">
            {formatRupiah(estimatedProfit)}
          </span>
          <span className="text-[11px] text-text-muted block mt-0.5">Omset dikurangi modal</span>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between">
        <span className="text-xs text-text-muted font-medium">Rata-rata Belanja</span>
        <div className="mt-2">
          <span className="text-2xl font-bold text-text font-mono num tracking-tight">
            {formatRupiah(avgBasket)}
          </span>
          <span className="text-[11px] text-text-muted block mt-0.5">Per transaksi pelanggan</span>
        </div>
      </div>
    </div>
  );
};

