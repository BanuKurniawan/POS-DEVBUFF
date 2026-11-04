import React from "react";
import { ShoppingCart } from "lucide-react";
import { formatRupiah } from "@/utils/format";

interface PosMobileBottomBarProps {
  totalCartItems: number;
  finalTotal: number;
  onOpenMobileCart: () => void;
}

export const PosMobileBottomBar: React.FC<PosMobileBottomBarProps> = ({
  totalCartItems,
  finalTotal,
  onOpenMobileCart,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-2.5 bg-surface/95 backdrop-blur-md border-t border-border shadow-lg">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-text text-ground flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-mono font-bold flex items-center justify-center shadow-xs">
                {totalCartItems}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-tight block">
              Total ({totalCartItems} item)
            </span>
            <span className="text-base font-black text-text font-mono num truncate block">
              {formatRupiah(finalTotal)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenMobileCart}
          className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-bold text-xs shadow-xs transition-transform active:scale-95 shrink-0 flex items-center gap-1.5"
        >
          <span>Buka Keranjang</span>
          <span className="font-mono">&rarr;</span>
        </button>
      </div>
    </div>
  );
};

