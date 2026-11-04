import React from "react";
import { FolderArchive, Trash2, ArrowRight } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { HeldTransaction } from "@/types";
import { formatRupiah } from "@/utils/format";

interface PosRecallModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldTransactions: HeldTransaction[];
  onRestoreHeld: (held: HeldTransaction) => void;
  onDeleteHeld: (id: string) => void;
}

export const PosRecallModal: React.FC<PosRecallModalProps> = ({
  isOpen,
  onClose,
  heldTransactions,
  onRestoreHeld,
  onDeleteHeld,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Daftar Pesanan Tertahan"
      description="Pilih pesanan tertahan untuk dilanjutkan kembali ke kasir."
      maxWidth="md"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {heldTransactions.length === 0 ? (
          <div className="py-8 text-center text-text-muted">
            <FolderArchive className="w-8 h-8 mx-auto mb-2 text-text-faint stroke-1" />
            <p className="text-xs font-semibold">Tidak ada pesanan yang sedang tertahan.</p>
          </div>
        ) : (
          heldTransactions.map((held) => (
            <div
              key={held.id}
              className="p-3 bg-surface border border-border rounded-md hover:border-border-strong flex items-center justify-between gap-3 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text truncate">
                    {held.label}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    Ditahan{" "}
                    {new Date(held.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5 truncate">
                  {held.cart.map((i) => `${i.name} (${i.quantity}x)`).join(", ")}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-text font-mono num">
                    {formatRupiah(held.totalAmount)}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    &bull; {held.cart.reduce((s, i) => s + i.quantity, 0)} item
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteHeld(held.id)}
                  className="text-negative hover:bg-negative-bg"
                  title="Hapus pesanan ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onRestoreHeld(held)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Lanjutkan Kasir
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Dialog>
  );
};

