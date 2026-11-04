import React from "react";
import { Barcode } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CategoryDTO, ProductDTO } from "@/types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: ProductDTO | null;
  formName: string;
  onFormNameChange: (val: string) => void;
  formSku: string;
  onFormSkuChange: (val: string) => void;
  formBarcode: string;
  onFormBarcodeChange: (val: string) => void;
  formCategoryId: string;
  onFormCategoryIdChange: (val: string) => void;
  categories: CategoryDTO[];
  formUnit: string;
  onFormUnitChange: (val: string) => void;
  formCostPrice: number;
  onFormCostPriceChange: (val: number) => void;
  formPrice: number;
  onFormPriceChange: (val: number) => void;
  formStock: number;
  onFormStockChange: (val: number) => void;
  formMinStock: number;
  onFormMinStockChange: (val: number) => void;
  isPending: boolean;
  onSave: (e: React.FormEvent) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  formName,
  onFormNameChange,
  formSku,
  onFormSkuChange,
  formBarcode,
  onFormBarcodeChange,
  formCategoryId,
  onFormCategoryIdChange,
  categories,
  formUnit,
  onFormUnitChange,
  formCostPrice,
  onFormCostPriceChange,
  formPrice,
  onFormPriceChange,
  formStock,
  onFormStockChange,
  formMinStock,
  onFormMinStockChange,
  isPending,
  onSave,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? "Ubah Data Produk" : "Tambah Produk Baru"}
      description="Pastikan data harga dan stok terisi dengan benar."
      maxWidth="lg"
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSave}
            isLoading={isPending}
          >
            {editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
          </Button>
        </>
      }
    >
      <form onSubmit={onSave} className="space-y-4">
        <Input
          label="Nama Produk"
          required
          placeholder="Contoh: Beras Ramos Wangi 5kg"
          value={formName}
          onChange={(e) => onFormNameChange(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Kode Barang (SKU)"
            placeholder="PRD-001"
            value={formSku}
            onChange={(e) => onFormSkuChange(e.target.value)}
            tabular
          />

          <Input
            label="Barcode (Opsional)"
            placeholder="Scan barcode fisik"
            value={formBarcode}
            onChange={(e) => onFormBarcodeChange(e.target.value)}
            leftIcon={<Barcode className="w-4 h-4" />}
            tabular
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Kategori"
            value={formCategoryId}
            onChange={(e) => onFormCategoryIdChange(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Input
            label="Satuan Barang"
            placeholder="pcs, kg, liter, bks..."
            value={formUnit}
            onChange={(e) => onFormUnitChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border-subtle">
          <Input
            label="Harga Modal / Beli (Rp)"
            type="number"
            min="0"
            value={formCostPrice}
            onChange={(e) => onFormCostPriceChange(Math.max(0, Number(e.target.value)))}
            tabular
            hint="Harga perolehan untuk menghitung laba kotor"
          />

          <Input
            label="Harga Jual Konsumen (Rp)"
            type="number"
            min="0"
            required
            value={formPrice}
            onChange={(e) => onFormPriceChange(Math.max(0, Number(e.target.value)))}
            tabular
            hint="Harga yang dibayar pembeli di POS kasir"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border-subtle">
          <Input
            label="Stok Awal Fisik"
            type="number"
            min="0"
            required
            value={formStock}
            onChange={(e) => onFormStockChange(Math.max(0, Number(e.target.value)))}
            tabular
          />

          <Input
            label="Batas Minimum Peringatan Stok"
            type="number"
            min="1"
            required
            value={formMinStock}
            onChange={(e) => onFormMinStockChange(Math.max(1, Number(e.target.value)))}
            tabular
            hint="Peringatan muncul jika stok mencapai angka ini"
          />
        </div>
      </form>
    </Dialog>
  );
};

