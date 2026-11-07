import React from "react";
import { Plus, Package } from "lucide-react";
import { ProductDTO } from "@/types";
import { formatRupiah } from "@/utils/format";
import { ProductImage } from "@/components/products";

interface PosProductCatalogProps {
  products: ProductDTO[];
  isLoading: boolean;
  onAddToCart: (product: ProductDTO) => void;
  searchQuery: string;
}

export const PosProductCatalog: React.FC<PosProductCatalogProps> = ({
  products,
  isLoading,
  onAddToCart,
  searchQuery,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="p-3 rounded-md border border-border bg-surface animate-pulse h-28 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="h-2.5 bg-surface-subtle rounded w-1/3" />
              <div className="h-3.5 bg-surface-subtle rounded w-3/4" />
            </div>
            <div className="h-4 bg-surface-subtle rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-text-muted">
        <Package className="w-10 h-10 mb-2 text-text-muted stroke-1" />
        <p className="text-xs font-bold text-text uppercase tracking-tight">Produk Tidak Ditemukan</p>
        <p className="text-xs text-text-muted mt-1 max-w-xs">
          {searchQuery
            ? `Tidak ada produk dengan kata kunci "${searchQuery}".`
            : "Belum ada produk terdaftar dalam kategori ini."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
      {products.map((p) => {
        const isOutOfStock = p.stock <= 0;
        const isLowStock = p.stock > 0 && p.stock <= p.minStock;

        return (
          <button
            key={p.id}
            type="button"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(p)}
            className={`group text-left rounded-lg border bg-surface flex flex-col justify-between transition-all relative overflow-hidden select-none active:scale-[0.98] ${
              isOutOfStock
                ? "border-border-subtle bg-surface/50 opacity-60 cursor-not-allowed"
                : "border-border hover:border-text hover:shadow-xs hover:bg-surface-subtle/50 cursor-pointer"
            }`}
          >
            {/* Image Thumbnail */}
            <div className="w-full h-28 bg-surface-subtle relative overflow-hidden flex items-center justify-center p-2 border-b border-border-subtle">
              <ProductImage
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                iconClassName="w-7 h-7 text-text-faint"
              />
              <span className="absolute top-1.5 left-1.5 text-[9px] uppercase font-semibold bg-surface/90 text-text px-1.5 py-0.2 rounded border border-border/60">
                {p.category}
              </span>
              <span
                className={`absolute top-1.5 right-1.5 font-mono num text-[9px] px-1 py-0.2 rounded font-bold ${
                  isOutOfStock
                    ? "text-negative bg-negative-bg border border-negative-border"
                    : isLowStock
                    ? "text-warning bg-warning-bg border border-warning-border"
                    : "text-text-muted bg-surface/90 border border-border"
                }`}
              >
                {isOutOfStock ? "Habis" : `${p.stock} ${p.unit}`}
              </span>
            </div>

            <div className="p-2.5 space-y-1 w-full flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-text line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                  {p.name}
                </h3>
                {p.barcode && (
                  <p className="text-[9px] font-mono text-text-faint truncate mt-0.5">{p.barcode}</p>
                )}
              </div>

              <div className="pt-2 mt-2 border-t border-border-subtle flex items-center justify-between w-full">
                <span className="text-xs font-bold text-text font-mono num">
                  {formatRupiah(p.price)}
                </span>

                <div
                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                    isOutOfStock
                      ? "bg-transparent text-text-faint"
                      : "bg-surface-subtle border border-border text-text group-hover:bg-text group-hover:text-ground group-hover:border-text"
                  }`}
                >
                  {isOutOfStock ? (
                    <span className="text-[10px]">&times;</span>
                  ) : (
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
