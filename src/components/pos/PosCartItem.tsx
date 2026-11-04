import React from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { CartItem } from "@/types";
import { formatRupiah } from "@/utils/format";

interface PosCartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdateItemNote: (id: string, note: string) => void;
  onRemoveFromCart: (id: string) => void;
}

export const PosCartItem: React.FC<PosCartItemProps> = ({
  item,
  onUpdateQuantity,
  onUpdateItemNote,
  onRemoveFromCart,
}) => {
  return (
    <div className="p-2 sm:p-2.5 rounded-md border border-border bg-surface hover:border-border-strong transition-all space-y-1.5 shadow-2xs">
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0 flex-1">
          <h4 className="text-[11px] sm:text-xs font-semibold text-text leading-tight truncate">
            {item.name}
          </h4>
          <p className="text-[10px] text-text-muted font-mono num mt-0.5">
            {formatRupiah(item.price)} &times; {item.quantity}
          </p>
        </div>
        <span className="text-[11px] sm:text-xs font-bold text-text font-mono num shrink-0">
          {formatRupiah(item.price * item.quantity)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 pt-0.5">
        <input
          type="text"
          placeholder="Catatan..."
          value={item.itemNote || ""}
          onChange={(e) => onUpdateItemNote(item.id, e.target.value)}
          className="flex-1 text-[10px] text-text bg-surface-subtle px-1.5 py-0.5 rounded-sm border border-border focus:outline-hidden focus:border-text placeholder:text-text-faint"
        />

        <div className="flex items-center gap-1">
          <button
            onClick={() => onRemoveFromCart(item.id)}
            className="p-1 text-text-muted hover:text-negative transition-colors rounded-sm"
            title="Hapus item"
          >
            <Trash2 className="w-3 h-3" />
          </button>

          {/* Stepper with compact targets */}
          <div className="flex items-center bg-surface-subtle border border-border rounded p-0.5">
            <button
              onClick={() => onUpdateQuantity(item.id, -1)}
              className="w-5 h-5 flex items-center justify-center rounded-xs text-text hover:bg-surface font-bold transition-colors"
              aria-label="Kurangi jumlah"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <span className="text-[11px] font-bold text-text w-5 text-center font-mono num">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, 1)}
              disabled={item.quantity >= item.stock}
              className="w-5 h-5 flex items-center justify-center rounded-xs text-text hover:bg-surface disabled:opacity-30 font-bold transition-colors"
              aria-label="Tambah jumlah"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
