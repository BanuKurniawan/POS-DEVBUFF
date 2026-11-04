import React from "react";
import { Receipt } from "lucide-react";
import { TransactionDTO } from "@/app/actions/transactions";
import { formatRupiah, formatDate, formatTime } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

interface TransactionTableProps {
  transactions: TransactionDTO[];
  totalItems: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  totalItems,
  pageSize,
  currentPage,
  totalPages,
  onPageChange,
  isPending,
}) => {
  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">
      {isPending ? (
        <div className="p-8 text-center text-xs text-text-muted">
          Memuat data transaksi...
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="Tidak Ada Transaksi"
          description="Tidak ditemukan riwayat transaksi pada rentang waktu atau pencarian yang dipilih."
          icon={<Receipt className="w-5 h-5" />}
        />
      ) : (
        <>
          <Table containerClassName="border-0 rounded-none">
            <TableHeader>
              <TableRow>
                <TableHead>No. Faktur</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead alignRight>Item</TableHead>
                <TableHead alignRight>Total Transaksi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono num text-xs font-semibold text-text">
                    {t.invoiceNumber}
                    {t.notes && (
                      <span className="block text-[11px] text-text-muted font-sans font-normal italic truncate max-w-[180px]">
                        {t.notes}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-text-muted font-mono num text-xs whitespace-nowrap">
                    {formatDate(t.createdAt)}
                    <span className="block text-[10px]">
                      {formatTime(t.createdAt)}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs text-text font-medium">
                    {t.cashierName}
                  </TableCell>

                  <TableCell>
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-surface-subtle text-text border border-border">
                      {t.paymentMethod}
                    </span>
                  </TableCell>

                  <TableCell numeric className="text-text-muted">
                    {t.itemCount} item
                  </TableCell>

                  <TableCell numeric className="font-bold text-text">
                    {formatRupiah(t.finalAmount)}
                  </TableCell>

                  <TableCell>
                    <Badge variant="success" size="sm" showDefaultIcon>
                      Selesai
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalItems > pageSize && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

