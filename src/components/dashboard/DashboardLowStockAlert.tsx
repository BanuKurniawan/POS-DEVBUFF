import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah } from "@/utils/format";

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  unit: string;
}

interface DashboardLowStockAlertProps {
  products: LowStockItem[];
}

export const DashboardLowStockAlert: React.FC<DashboardLowStockAlertProps> = ({ products }) => {
  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">
      <div className="p-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <h2 className="text-xs font-bold text-text uppercase tracking-tight">
            Peringatan Stok Menipis
          </h2>
        </div>
        <Link
          href="/stock-in"
          className="text-xs font-semibold text-text hover:underline flex items-center gap-1"
        >
          <span>Tambah Stok</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {products.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">
            Semua stok barang sembako aman.
          </div>
        ) : (
          products.map((p) => {
            const isZero = p.stock === 0;
            return (
              <div
                key={p.id}
                className="p-3 flex items-center justify-between hover:bg-surface-subtle transition-colors text-xs"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-semibold text-text truncate">{p.name}</p>
                  <p className="text-[10px] text-text-muted font-mono num mt-0.5">
                    {p.sku} &bull; {formatRupiah(p.price)}
                  </p>
                </div>

                {isZero ? (
                  <Badge variant="danger" size="sm" showDefaultIcon>
                    Habis
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm" showDefaultIcon>
                    Sisa {p.stock} {p.unit}
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

