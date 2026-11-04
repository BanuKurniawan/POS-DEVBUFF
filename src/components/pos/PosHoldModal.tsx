import React from "react";
import { PauseCircle } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface PosHoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdNote: string;
  onHoldNoteChange: (note: string) => void;
  onConfirmHold: () => void;
}

export const PosHoldModal: React.FC<PosHoldModalProps> = ({
  isOpen,
  onClose,
  holdNote,
  onHoldNoteChange,
  onConfirmHold,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tahan Pesanan Saat Ini"
      description="Simpan keranjang aktif pelanggan ini sementara untuk melayani pelanggan berikutnya."
      maxWidth="sm"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirmHold}
            leftIcon={<PauseCircle className="w-3.5 h-3.5" />}
          >
            Tahan Pesanan (F8)
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <label className="text-xs font-semibold text-text block">
          Label / Nama Pembeli (Opsional):
        </label>
        <input
          type="text"
          value={holdNote}
          onChange={(e) => onHoldNoteChange(e.target.value)}
          placeholder="Misal: Ibu Ani (Beras) / Meja 2"
          className="w-full bg-surface border border-border rounded-md px-3 py-2 text-xs text-text focus:outline-hidden focus:border-text font-medium"
        />
        <p className="text-[11px] text-text-muted leading-relaxed">
          Pesanan akan tersimpan di browser ini dan dapat dipanggil kembali kapan saja melalui menu
          &quot;Tertahan&quot;.
        </p>
      </div>
    </Dialog>
  );
};

