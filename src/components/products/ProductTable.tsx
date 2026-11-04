import React from "react";
import { Package, Pencil, Trash2, Barcode } from "lucide-react";
import { ProductDTO } from "@/types";
import { formatRupiah } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

interface ProductTableProps {
  products: ProductDTO[];
  onEditProduct: (p: ProductDTO) => void;
  onDeleteProduct: (p: ProductDTO) => void;
  onResetFilter: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
  onResetFilter,
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-md overflow-hidden">
        <EmptyState
          title="Tidak Ada Produk"
          description="Tidak ditemukan produk yang cocok dengan pencarian atau filter yang dipilih."
          icon={<Package className="w-5 h-5" />}
          actionLabel="Reset Filter"
          onAction={onResetFilter}
        />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">No</TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Kode / SKU</TableHead>
            <TableHead alignRight>Harga Modal</TableHead>
            <TableHead alignRight>Harga Jual</TableHead>
            <TableHead alignRight>Stok Fisik</TableHead>
            <TableHead>Status</TableHead>
            <TableHead alignRight className="w-24">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p, idx) => {
            const isOutOfStock = p.stock <= 0;
            const isLowStock = p.stock > 0 && p.stock <= (p.minStock ?? 5);

            return (
              <TableRow key={p.id}>
                <TableCell className="text-text-muted font-mono num text-xs">
                  {idx + 1}
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-text leading-tight">{p.name}</div>
                  {p.barcode && (
                    <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5 font-mono">
                      <Barcode className="w-3 h-3 text-text-faint" />
                      <span>{p.barcode}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-text-muted bg-surface-subtle px-1.5 py-0.5 rounded-sm border border-border">
                    {p.category}
                  </span>
                </TableCell>
                <TableCell className="font-mono num text-xs text-text-muted">
                  {p.sku}
                </TableCell>
                <TableCell numeric className="text-text-muted">
                  {formatRupiah(p.costPrice)}
                </TableCell>
                <TableCell numeric className="font-bold text-text">
                  {formatRupiah(p.price)}
                </TableCell>
                <TableCell numeric>
                  <span className="font-bold text-text">
                    {p.stock} {p.unit}
                  </span>
                  <span className="text-[11px] text-text-muted block">
                    Min. {p.minStock ?? 5}
                  </span>
                </TableCell>
                <TableCell>
                  {isOutOfStock ? (
                    <Badge variant="danger" size="sm" showDefaultIcon>
                      Habis
                    </Badge>
                  ) : isLowStock ? (
                    <Badge variant="warning" size="sm" showDefaultIcon>
                      Menipis
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm" showDefaultIcon>
                      Tersedia
                    </Badge>
                  )}
                </TableCell>
                <TableCell alignRight>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEditProduct(p)}
                      className="p-1.5 text-text-muted hover:text-text hover:bg-surface-subtle rounded-sm transition-colors"
                      title="Edit produk"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p)}
                      className="p-1.5 text-text-muted hover:text-negative hover:bg-negative-bg rounded-sm transition-colors"
                      title="Hapus produk"
                      aria-label={`Hapus ${p.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

