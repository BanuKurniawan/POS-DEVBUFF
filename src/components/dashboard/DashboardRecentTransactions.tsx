import React from "react";
import Link from "next/link";
import { Receipt, ArrowRight } from "lucide-react";
import { formatRupiah, formatTime } from "@/utils/format";

interface RecentTransactionItem {
  id: string;
  invoiceNumber: string;
  paymentMethod: string;
  cashierName: string;
  finalAmount: number;
  createdAt: Date;
}

interface DashboardRecentTransactionsProps {
  transactions: RecentTransactionItem[];
}

export const DashboardRecentTransactions: React.FC<DashboardRecentTransactionsProps> = ({
  transactions,
}) => {
  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">
      <div className="p-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-text-muted" />
          <h2 className="text-xs font-bold text-text uppercase tracking-tight">
            Penjualan Terbaru Hari Ini
          </h2>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-text hover:underline flex items-center gap-1"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">
            Belum ada transaksi yang tercatat hari ini.
          </div>
        ) : (
          transactions.map((trx) => (
            <div
              key={trx.id}
              className="p-3 flex items-center justify-between hover:bg-surface-subtle transition-colors text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text font-mono text-[11px]">
                    {trx.invoiceNumber}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-surface-subtle text-text-muted border border-border">
                    {trx.paymentMethod}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  {trx.cashierName} &bull; {formatTime(trx.createdAt)}
                </p>
              </div>

              <span className="font-bold text-text font-mono num text-sm">
                {formatRupiah(trx.finalAmount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};