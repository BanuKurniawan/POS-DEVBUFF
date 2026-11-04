import React from "react";
import { formatRupiah } from "@/utils/format";
import { TransactionSummaryDTO } from "@/app/actions/transactions";

interface TransactionFinancialKpiProps {
  summary: TransactionSummaryDTO;
}

export const TransactionFinancialKpi: React.FC<TransactionFinancialKpiProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 bg-surface border border-border rounded-md divide-x divide-y lg:divide-y-0 divide-border">
      <div className="p-3.5">
        <span className="text-xs text-text-muted block font-medium">Total Omset Penjualan</span>
        <span className="text-xl font-bold text-text font-mono num mt-0.5 block">
          {formatRupiah(summary.totalRevenue)}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block">Total penerimaan kotor</span>
      </div>

      <div className="p-3.5">
        <span className="text-xs text-text-muted block font-medium">Total Modal (HPP)</span>
        <span className="text-xl font-bold text-text font-mono num mt-0.5 block">
          {formatRupiah(summary.totalCost)}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block">Harga modal barang keluar</span>
      </div>

      <div className="p-3.5">
        <span className="text-xs text-text-muted block font-medium">Laba Kotor</span>
        <span className="text-xl font-bold text-positive font-mono num mt-0.5 block">
          {formatRupiah(summary.grossProfit)}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block">Omset dikurangi modal</span>
      </div>

      <div className="p-3.5">
        <span className="text-xs text-text-muted block font-medium">Total Struk Selesai</span>
        <span className="text-xl font-bold text-text font-mono num mt-0.5 block">
          {summary.transactionCount}
        </span>
        <span className="text-[11px] text-text-muted mt-0.5 block">Transaksi berhasil</span>
      </div>
    </div>
  );
};

