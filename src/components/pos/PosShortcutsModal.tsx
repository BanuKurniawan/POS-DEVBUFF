import React from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface PosShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PosShortcutsModal: React.FC<PosShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const shortcuts = [
    { key: "F2 / '/'", desc: "Fokus ke kolom pencarian / scanner barcode" },
    { key: "F4", desc: "Pilih metode pembayaran TUNAI" },
    { key: "F6", desc: "Pilih metode pembayaran QRIS" },
    { key: "F7", desc: "Pilih metode pembayaran DEBIT / TRANSFER" },
    { key: "F8", desc: "Tahan transaksi aktif saat ini (Hold Order)" },
    { key: "F9", desc: "Buka konfirmasi pembayaran & selesaikan transaksi" },
    { key: "Space", desc: "Isi otomatis uang pas (khusus tunai saat tidak mengetik)" },
    { key: "Esc", desc: "Tutup dialog yang aktif atau reset keranjang" },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Panduan Pintasan Keyboard Kasir"
      description="Operasikan kasir lebih cepat tanpa mouse menggunakan keyboard shortcut standar POS."
      maxWidth="md"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="primary" size="sm" onClick={onClose}>
            Mengerti (Esc)
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {shortcuts.map(({ key, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between p-2.5 bg-surface-subtle border border-border rounded-md"
          >
            <span className="text-text-muted">{desc}</span>
            <kbd className="px-2 py-0.5 bg-surface border border-border text-text font-mono font-bold rounded shadow-2xs shrink-0 ml-2">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </Dialog>
  );
};

