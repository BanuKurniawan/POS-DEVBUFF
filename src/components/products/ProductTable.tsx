import React from "react";
import { Package, Pencil, Trash2, Barcode } from "lucide-react";
import { ProductDTO } from "@/types";
import { formatRupiah } from "@/utils/format";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "./ProductImage";
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
    <>
      {/* Mobile Card List (sm:hidden) */}
      <div className="sm:hidden space-y-2.5">
        {products.map((p) => {
          const isOutOfStock = p.stock <= 0;
          const isLowStock = p.stock > 0 && p.stock <= (p.minStock ?? 5);

          return (
            <div
              key={p.id}
              className="bg-surface border border-border rounded-md p-3.5 space-y-2.5 shadow-2xs"
            >
              {/* Card Top: Thumbnail + Title & Badges */}
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-md border border-border bg-surface-subtle overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <ProductImage
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-contain"
                    iconClassName="w-6 h-6 text-text-faint"
                    showFallbackText={false}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className="font-semibold text-text text-sm leading-tight line-clamp-2">
                      {p.name}
                    </h3>
                    <span className="text-[10px] text-text-muted bg-surface-subtle px-1.5 py-0.2 rounded border border-border shrink-0">
                      {p.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono truncate">
                      <span>{p.sku}</span>
                      {p.barcode && (
                        <>
                          <span>&bull;</span>
                          <span className="flex items-center gap-0.5 truncate">
                            <Barcode className="w-3 h-3 text-text-faint shrink-0" />
                            <span className="truncate">{p.barcode}</span>
                          </span>
                        </>
                      )}
                    </div>

                    <div className="shrink-0">
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Middle: Price & Stock Grid */}
              <div className="grid grid-cols-3 gap-2 py-2 px-2 bg-surface-subtle rounded border border-border text-center">
                <div>
                  <span className="text-[10px] text-text-muted block">Harga Modal</span>
                  <span className="text-xs font-semibold text-text-muted font-mono num block truncate">
                    {formatRupiah(p.costPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Harga Jual</span>
                  <span className="text-xs font-bold text-text font-mono num block truncate">
                    {formatRupiah(p.price)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Sisa Stok</span>
                  <span
                    className={`text-xs font-bold font-mono num block truncate ${
                      isOutOfStock ? "text-negative" : isLowStock ? "text-warning" : "text-positive"
                    }`}
                  >
                    {p.stock} {p.unit}
                  </span>
                </div>
              </div>

              {/* Card Bottom: Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-[11px] text-text-muted">
                  Batas Min:{" "}
                  <span className="font-semibold text-text font-mono">
                    {p.minStock ?? 5} {p.unit}
                  </span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditProduct(p)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-surface hover:bg-surface-subtle text-text border border-border transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-text-muted" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteProduct(p)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-surface hover:bg-negative-bg text-negative border border-border hover:border-negative/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (hidden sm:block) */}
      <div className="hidden sm:block bg-surface border border-border rounded-md overflow-hidden">
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
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border border-border bg-surface-subtle overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                        <ProductImage
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          iconClassName="w-5 h-5 text-text-faint"
                          showFallbackText={false}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-text leading-tight truncate max-w-[260px] lg:max-w-xs">{p.name}</div>
                        {p.barcode && (
                          <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5 font-mono">
                            <Barcode className="w-3 h-3 text-text-faint" />
                            <span>{p.barcode}</span>
                          </div>
                        )}
                      </div>
                    </div>
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
    </>
  );
};

