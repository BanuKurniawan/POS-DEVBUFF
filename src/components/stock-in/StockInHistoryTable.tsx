import React from "react";
import { ArrowDownLeft, ArrowUpRight, Search, Package } from "lucide-react";
import { StockMovementDTO } from "@/types";
import { formatDate, formatTime } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
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

interface StockInHistoryTableProps {
  movements: StockMovementDTO[];
  totalMovementsCount: number;
  pageSize?: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  movementFilter: "ALL" | "IN" | "OUT";
  onMovementFilterChange: (val: "ALL" | "IN" | "OUT") => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const StockInHistoryTable: React.FC<StockInHistoryTableProps> = ({
  movements,
  totalMovementsCount,
  pageSize = 5,
  searchQuery,
  onSearchChange,
  movementFilter,
  onMovementFilterChange,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="lg:col-span-7 bg-surface border border-border rounded-md p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="text-sm font-bold text-text tracking-tight">
            Riwayat Keluar / Masuk Barang
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Audit log pergerakan stok toko secara transparan.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex items-center p-0.5 bg-surface-subtle border border-border rounded-md self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onMovementFilterChange("ALL")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-colors ${
              movementFilter === "ALL"
                ? "bg-surface text-text shadow-2xs font-bold"
                : "text-text-muted hover:text-text"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => onMovementFilterChange("IN")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-colors ${
              movementFilter === "IN"
                ? "bg-surface text-positive shadow-2xs font-bold"
                : "text-text-muted hover:text-text"
            }`}
          >
            Masuk (IN)
          </button>
          <button
            type="button"
            onClick={() => onMovementFilterChange("OUT")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-colors ${
              movementFilter === "OUT"
                ? "bg-surface text-text shadow-2xs font-bold"
                : "text-text-muted hover:text-text"
            }`}
          >
            Keluar (OUT)
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <Input
        placeholder="Cari berdasarkan nama produk, SKU, atau catatan..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
      />

      {/* Table */}
      {movements.length === 0 ? (
        <EmptyState
          title="Tidak Ada Riwayat"
          description="Belum ada pencatatan pergerakan stok yang cocok dengan kriteria filter."
          icon={<Package className="w-5 h-5" />}
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead alignRight>Jumlah</TableHead>
                <TableHead alignRight>Stok Akhir</TableHead>
                <TableHead>Catatan / Petugas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => {
                const isIncoming = m.type === "IN";

                return (
                  <TableRow key={m.id}>
                    <TableCell className="text-text-muted font-mono num text-xs whitespace-nowrap">
                      {formatDate(m.createdAt)} {formatTime(m.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-text leading-tight">{m.productName}</div>
                      <span className="text-[11px] text-text-muted font-mono num">{m.sku}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isIncoming ? "success" : "neutral"}
                        size="sm"
                      >
                        <span className="flex items-center gap-1">
                          {isIncoming ? (
                            <ArrowDownLeft className="w-3 h-3 text-positive" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-text-muted" />
                          )}
                          <span>{isIncoming ? "MASUK" : "KELUAR"}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell
                      numeric
                      className={`font-mono num font-bold ${
                        isIncoming ? "text-positive" : "text-text"
                      }`}
                    >
                      {isIncoming ? `+${m.quantity}` : `-${m.quantity}`} {m.unit}
                    </TableCell>
                    <TableCell numeric className="font-mono num font-semibold text-text">
                      {m.stockAfter} {m.unit}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-text">{m.notes || "-"}</div>
                      <span className="text-[10px] text-text-muted block">Oleh: {m.userName}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalMovementsCount > 5 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalMovementsCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
