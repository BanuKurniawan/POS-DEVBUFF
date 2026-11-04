import React from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ProductDTO } from "@/types";
import { formatRupiah } from "@/utils/format";

interface ProductDeleteModalProps {
  product: ProductDTO | null;
  onClose: () => void;
  isPending: boolean;
  onConfirmDelete: () => void;
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  product,
  onClose,
  isPending,
  onConfirmDelete,
}) => {
  if (!product) return null;

  return (
    <Dialog
      isOpen={!!product}
      onClose={onClose}
      title="Hapus Produk Ini?"
      description={`Anda akan menghapus "${product.name}" dari katalog. Tindakan ini tidak dapat dibatalkan.`}
      maxWidth="sm"
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
            variant="danger"
            size="sm"
            onClick={onConfirmDelete}
            isLoading={isPending}
          >
            Ya, Hapus Produk
          </Button>
        </>
      }
    >
      <div className="p-3 bg-surface-subtle border border-border rounded-md text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-text-muted">SKU:</span>
          <span className="font-mono num font-semibold text-text">
            {product.sku}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Sisa Stok:</span>
          <span className="font-mono num font-semibold text-text">
            {product.stock} {product.unit}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Harga Jual:</span>
          <span className="font-mono num font-semibold text-text">
            {formatRupiah(product.price)}
          </span>
        </div>
      </div>
    </Dialog>
  );
};

