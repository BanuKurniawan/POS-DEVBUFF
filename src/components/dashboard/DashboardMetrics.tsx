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
  const items = [
    {
      title: "Penjualan Hari Ini",
      value: formatRupiah(todaySales),
      subtitle: "Total omset masuk",
      color: "text-text",
    },
    {
      title: "Jumlah Transaksi",
      value: String(todayTransactions),
      subtitle: "Struk belanja selesai",
      color: "text-accent",
    },
    {
      title: "Estimasi Laba Kotor",
      value: formatRupiah(estimatedProfit),
      subtitle: "Omset dikurangi modal",
      color: "text-positive",
    },
    {
      title: "Rata-rata Belanja",
      value: formatRupiah(avgBasket),
      subtitle: "Per transaksi pelanggan",
      color: "text-text",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-0 bg-transparent sm:bg-surface sm:border sm:border-border sm:rounded-md sm:divide-x divide-border">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="p-3 sm:p-4 bg-surface sm:bg-transparent border sm:border-0 border-border rounded-md sm:rounded-none flex flex-col justify-between"
        >
          <span className="text-[11px] sm:text-xs text-text-muted font-medium truncate">
            {item.title}
          </span>
          <div className="mt-1.5 sm:mt-2">
            <span
              className={`text-base sm:text-lg lg:text-2xl font-bold font-mono num tracking-tight block truncate ${item.color}`}
            >
              {item.value}
            </span>
            <span className="text-[10px] sm:text-[11px] text-text-muted block mt-0.5 truncate">
              {item.subtitle}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};