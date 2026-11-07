"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Barcode,
  Link2,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CategoryDTO, ProductDTO } from "@/types";
import { ProductImage } from "./ProductImage";

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
  formImageUrl: string;
  onFormImageUrlChange: (val: string) => void;
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
  formImageUrl,
  onFormImageUrlChange,
  isPending,
  onSave,
}) => {
  const [imageMode, setImageMode] = useState<"link" | "upload">("link");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    message: string;
    type: "info" | "warning" | "success";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sesuaikan tab mode saat modal dibuka / data berubah
  useEffect(() => {
    if (formImageUrl.startsWith("/uploads/")) {
      setImageMode("upload");
    } else {
      setImageMode("link");
    }
    setUploadError(null);
    setNotice(null);
  }, [formImageUrl, isOpen]);

  const isLocalUpload = formImageUrl.startsWith("/uploads/");
  const isExternalLink = !!formImageUrl && !isLocalUpload;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input agar file yang sama bisa dipilih ulang bila diinginkan
    e.target.value = "";

    // Peringatan jika sebelumnya sudah ada foto dari link web
    if (isExternalLink) {
      const confirmReplace = window.confirm(
        "Produk ini sebelumnya menggunakan foto dari link URL. Mengunggah gambar baru akan menggantikan dan menghapus link tersebut. Lanjutkan?"
      );
      if (!confirmReplace) return;
    }

    setIsUploading(true);
    setUploadError(null);
    setNotice(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload-product-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal mengunggah foto.");
      }

      onFormImageUrlChange(data.imageUrl);
      setNotice({
        message: "File foto berhasil diunggah dan link lama telah dibersihkan.",
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah foto.";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLinkInput = (newUrl: string) => {
    if (isLocalUpload && newUrl.trim()) {
      setNotice({
        message: "Perhatian: Anda mengganti foto file lokal dengan link URL eksternal baru.",
        type: "warning",
      });
    } else {
      setNotice(null);
    }
    onFormImageUrlChange(newUrl);
  };

  const handleRemoveImage = () => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus foto produk ini?");
    if (!confirmDelete) return;

    onFormImageUrlChange("");
    setNotice({
      message: "Foto produk berhasil dihapus.",
      type: "info",
    });
    setUploadError(null);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? "Ubah Data Produk" : "Tambah Produk Baru"}
      description="Pastikan data nama, harga, stok, dan foto terisi dengan benar."
      maxWidth="lg"
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isPending || isUploading}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSave}
            isLoading={isPending}
            disabled={isUploading}
          >
            {editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
          </Button>
        </>
      }
    >
      <form onSubmit={onSave} className="space-y-4">
        {/* NAMA PRODUK */}
        <Input
          label="Nama Produk"
          required
          placeholder="Contoh: Beras Ramos Wangi 5kg"
          value={formName}
          onChange={(e) => onFormNameChange(e.target.value)}
        />

        {/* FOTO PRODUK (LINK / UPLOAD) */}
        <div className="p-3.5 bg-surface-subtle border border-border rounded-md space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-semibold text-text flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span>Foto Produk</span>
            </label>

            {/* Mode Switcher */}
            <div className="inline-flex items-center p-0.5 bg-surface border border-border rounded-md text-xs">
              <button
                type="button"
                onClick={() => {
                  setImageMode("link");
                  setUploadError(null);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                  imageMode === "link"
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <Link2 className="w-3 h-3" />
                <span>Link URL</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageMode("upload");
                  setUploadError(null);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                  imageMode === "upload"
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
              </button>
            </div>
          </div>

          {/* Preview Box & Remove Button */}
          {formImageUrl && (
            <div className="flex items-center gap-3 p-2.5 bg-surface border border-border rounded-md">
              <div className="w-16 h-16 rounded border border-border overflow-hidden shrink-0 bg-surface-subtle flex items-center justify-center">
                <ProductImage
                  src={formImageUrl}
                  alt={formName || "Preview Produk"}
                  className="w-full h-full object-contain"
                  iconClassName="w-6 h-6 text-text-faint"
                  showFallbackText={false}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded border font-mono ${
                      isLocalUpload
                        ? "bg-surface-subtle border-border text-text"
                        : "bg-accent-light/30 border-positive-border text-accent"
                    }`}
                  >
                    {isLocalUpload ? "File Terupload" : "Tautan URL"}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate font-mono">
                  {formImageUrl}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                title="Hapus Foto Produk"
                className="p-1.5 text-text-muted hover:text-negative hover:bg-surface-subtle rounded border border-transparent hover:border-negative-border transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mode 1: Tautan Link URL */}
          {imageMode === "link" && (
            <div className="space-y-1.5">
              <Input
                placeholder="Tempelkan link gambar produk (https://...)..."
                value={formImageUrl}
                onChange={(e) => handleLinkInput(e.target.value)}
                leftIcon={<Link2 className="w-4 h-4" />}
                hint="Gunakan link langsung gambar (JPEG, PNG, WebP). Pratinjau otomatis tampil di atas."
              />
            </div>
          )}

          {/* Mode 2: Upload File Lokal */}
          {imageMode === "upload" && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-border rounded-md p-4 text-center cursor-pointer transition-colors bg-surface hover:bg-surface-subtle flex flex-col items-center justify-center gap-1.5 ${
                  isUploading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <Upload className="w-6 h-6 text-text-muted stroke-1" />
                <p className="text-xs font-semibold text-text">
                  {isUploading
                    ? "Sedang mengunggah foto produk..."
                    : "Klik untuk memilih file foto produk"}
                </p>
                <p className="text-[11px] text-text-muted">
                  Mendukung PNG, JPG, JPEG, WebP (Maksimum 5 MB)
                </p>
              </div>
            </div>
          )}

          {/* Notice & Error Messages */}
          {uploadError && (
            <div className="flex items-center gap-2 text-xs text-negative bg-negative-bg border border-negative-border p-2 rounded">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {notice && (
            <div
              className={`flex items-center gap-2 text-xs p-2 rounded border ${
                notice.type === "warning"
                  ? "bg-warning-bg border-warning-border text-warning-text"
                  : notice.type === "success"
                  ? "bg-positive-bg border-positive-border text-accent"
                  : "bg-surface-subtle border-border text-text-muted"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{notice.message}</span>
            </div>
          )}
        </div>

        {/* SKU & BARCODE */}
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

        {/* KATEGORI & SATUAN */}
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

        {/* HARGA MODAL & HARGA JUAL */}
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

        {/* STOK AWAL & MINIMUM */}
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
