import React from "react";
import { PackagePlus } from "lucide-react";
import { ProductStockSelectDTO } from "@/types";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface StockInFormProps {
  products: ProductStockSelectDTO[];
  selectedProductId: string;
  onSelectProduct: (id: string) => void;
  quantity: string;
  onQuantityChange: (val: string) => void;
  onQuickAddQty: (val: number) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export const StockInForm: React.FC<StockInFormProps> = ({
  products,
  selectedProductId,
  onSelectProduct,
  quantity,
  onQuantityChange,
  onQuickAddQty,
  notes,
  onNotesChange,
  onSubmit,
  isPending,
}) => {
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="lg:col-span-5 bg-surface border border-border rounded-md p-4 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <PackagePlus className="w-4 h-4 text-text" />
        <h3 className="text-sm font-bold text-text tracking-tight">Formulir Tambah Stok</h3>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Product Select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text tracking-tight">
            Pilih Produk
          </label>
          <Select
            value={selectedProductId}
            onChange={(e) => onSelectProduct(e.target.value)}
            required
          >
            <option value="">-- Pilih Barang Sembako --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Stok: {p.stock} {p.unit})
              </option>
            ))}
          </Select>
        </div>

        {/* Selected Product Info Preview */}
        {selectedProduct && (
          <div className="p-3 bg-surface-subtle border border-border rounded-md text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">Kode SKU:</span>
              <span className="font-mono num font-semibold text-text">
                {selectedProduct.sku}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Kategori:</span>
              <span className="text-text">{selectedProduct.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Stok Fisik Saat Ini:</span>
              <span className="font-bold text-text font-mono num">
                {selectedProduct.stock} {selectedProduct.unit}
              </span>
            </div>
            {quantity && parseInt(quantity, 10) > 0 && (
              <div className="flex justify-between pt-1 border-t border-border font-semibold text-positive">
                <span>Estimasi Stok Baru:</span>
                <span className="font-mono num">
                  {selectedProduct.stock + parseInt(quantity, 10)} {selectedProduct.unit}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quantity Field */}
        <div className="space-y-2">
          <Input
            label="Jumlah Masuk"
            type="number"
            min="1"
            required
            placeholder="Ketik jumlah item yang datang..."
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            tabular
          />

          {/* Quick buttons */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-text-muted">Tambah Cepat:</span>
            {[5, 10, 20, 50, 100].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onQuickAddQty(val)}
                className="px-2 py-0.5 text-xs bg-surface-subtle hover:bg-surface border border-border rounded-sm text-text font-mono num font-medium transition-colors"
              >
                +{val}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Input */}
        <Input
          label="Catatan Pengadaan / Supplier"
          placeholder="Misal: Dari Distributor Jaya Abadi, PO-002"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isPending}
            disabled={!selectedProductId || !quantity || isPending}
            className="w-full"
            leftIcon={<PackagePlus className="w-4 h-4" />}
          >
            Simpan Stok Masuk
          </Button>
        </div>
      </form>
    </div>
  );
};

