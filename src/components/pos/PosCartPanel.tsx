import React from "react";
import {
  ShoppingCart,
  PauseCircle,
  RotateCcw,
  X,
  Receipt,
  FolderArchive,
  AlertTriangle,
  Percent,
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CartItem, PaymentMethod } from "@/types";
import { formatRupiah } from "@/utils/format";
import { PosCartItem } from "./PosCartItem";

interface PosCartPanelProps {
  isMobile?: boolean;
  cart: CartItem[];
  totalCartItems: number;
  customerOrderNote: string;
  onCustomerOrderNoteChange: (note: string) => void;
  errorMessage: string;
  heldOrdersCount: number;
  onOpenHoldModal: () => void;
  onOpenRecallModal: () => void;
  onClearCart: () => void;
  onCloseMobileDrawer?: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdateItemNote: (id: string, note: string) => void;
  onRemoveFromCart: (id: string) => void;
  // Calculation & options
  subtotal: number;
  discountPercent: number;
  customDiscountRp: number;
  discountAmount: number;
  onSetDiscountPercent: (rate: number) => void;
  enableTax: boolean;
  taxPercent: number;
  taxAmount: number;
  onToggleTax: () => void;
  finalTotal: number;
  // Payment
  paymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  cashGiven: number;
  effectiveCashGiven: number;
  onCashGivenChange: (val: number) => void;
  changeAmount: number;
  cashInputRef: React.RefObject<HTMLInputElement | null>;
  // Submit
  isPaymentValid: boolean;
  isSubmitting: boolean;
  onOpenPaymentConfirm: () => void;
}

export const PosCartPanel: React.FC<PosCartPanelProps> = ({
  isMobile = false,
  cart,
  totalCartItems,
  customerOrderNote,
  onCustomerOrderNoteChange,
  errorMessage,
  heldOrdersCount,
  onOpenHoldModal,
  onOpenRecallModal,
  onClearCart,
  onCloseMobileDrawer,
  onUpdateQuantity,
  onUpdateItemNote,
  onRemoveFromCart,
  subtotal,
  discountPercent,
  customDiscountRp,
  discountAmount,
  onSetDiscountPercent,
  enableTax,
  taxPercent,
  taxAmount,
  onToggleTax,
  finalTotal,
  paymentMethod,
  onSelectPaymentMethod,
  cashGiven,
  effectiveCashGiven,
  onCashGivenChange,
  changeAmount,
  cashInputRef,
  isPaymentValid,
  isSubmitting,
  onOpenPaymentConfirm,
}) => {
  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      {/* Cart Header */}
      <div className="p-2 sm:p-2.5 border-b border-border bg-surface-subtle space-y-1.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-text" />
            <h2 className="text-[11px] font-bold text-text uppercase tracking-tight">
              Keranjang
            </h2>
            <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.2 rounded font-mono font-bold">
              {totalCartItems}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenHoldModal}
                className="h-7 text-[10px] px-2"
                leftIcon={<PauseCircle className="w-3 h-3 text-warning" />}
              >
                Tahan
              </Button>
            )}

            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearCart}
                className="h-7 text-[10px] px-2 text-negative hover:bg-negative-bg"
                leftIcon={<RotateCcw className="w-3 h-3 text-negative" />}
              >
                Reset
              </Button>
            )}

            {isMobile && onCloseMobileDrawer && (
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="p-1 rounded text-text-muted hover:text-text bg-surface border border-border"
                aria-label="Tutup Keranjang"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Customer Note Bar */}
        <div className="flex items-center gap-1.5 text-xs bg-surface border border-border rounded px-2 py-0.5">
          <span className="text-[10px] text-text-muted font-medium shrink-0">Catatan:</span>
          <input
            type="text"
            value={customerOrderNote}
            onChange={(e) => onCustomerOrderNoteChange(e.target.value)}
            placeholder="Pelanggan Umum..."
            className="w-full bg-transparent text-[11px] font-medium text-text focus:outline-hidden placeholder:text-text-faint"
          />
        </div>
      </div>

      {/* Cart Items List: Scrollable with min-h-0 */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1.5 min-h-0">
        {errorMessage && (
          <div className="p-2 text-xs bg-negative-bg border border-negative-border text-negative rounded flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-negative" />
            <span className="font-medium text-[11px] leading-tight">{errorMessage}</span>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-text-muted min-h-[100px]">
            <div className="w-9 h-9 rounded bg-surface-subtle border border-border flex items-center justify-center mb-1.5">
              <Receipt className="w-4 h-4 text-text-faint stroke-1" />
            </div>
            <p className="text-[11px] font-bold text-text uppercase tracking-tight">
              Keranjang Kosong
            </p>
            <p className="text-[10px] text-text-muted mt-0.5 max-w-[200px]">
              Pilih produk atau scan barcode untuk transaksi.
            </p>
            {heldOrdersCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-2 text-xs h-7"
                onClick={() => {
                  if (isMobile && onCloseMobileDrawer) onCloseMobileDrawer();
                  onOpenRecallModal();
                }}
                leftIcon={<FolderArchive className="w-3 h-3 text-warning" />}
              >
                Muat {heldOrdersCount} Tertahan
              </Button>
            )}
          </div>
        ) : (
          cart.map((item) => (
            <PosCartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onUpdateItemNote={onUpdateItemNote}
              onRemoveFromCart={onRemoveFromCart}
            />
          ))
        )}
      </div>

      {/* Pricing, Payment & Checkout: Compact & Always Visible */}
      <div className="p-2 sm:p-2.5 bg-surface-subtle border-t border-border space-y-2 shrink-0">
        {/* Calculation Card */}
        <div className="space-y-1 text-xs text-text-muted bg-surface p-2 sm:p-2.5 rounded border border-border">
          <div className="flex justify-between items-center text-[11px]">
            <span>Subtotal</span>
            <span className="font-semibold text-text font-mono num">{formatRupiah(subtotal)}</span>
          </div>

          {/* Discount Selector */}
          <div className="flex items-center justify-between pt-1 border-t border-dashed border-border-subtle text-[11px]">
            <div className="flex items-center gap-1 text-text">
              <Percent className="w-2.5 h-2.5 text-text-muted" />
              <span className="font-semibold text-[10px]">Diskon</span>
            </div>

            <div className="flex items-center gap-1">
              {[0, 5, 10, 15].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onSetDiscountPercent(rate)}
                  className={`px-1.5 py-0.2 rounded text-[10px] font-semibold transition-colors ${
                    discountPercent === rate && customDiscountRp === 0
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-surface-subtle text-text-muted hover:text-text border border-border"
                  }`}
                >
                  {rate}%
                </button>
              ))}
              {discountAmount > 0 && (
                <span className="font-bold text-negative ml-0.5 font-mono num text-[10px]">
                  -{formatRupiah(discountAmount)}
                </span>
              )}
            </div>
          </div>

          {/* Tax (PPN) Selector */}
          <div className="flex items-center justify-between pt-1 border-t border-dashed border-border-subtle text-[11px]">
            <div className="flex items-center gap-1 text-text">
              <Receipt className="w-2.5 h-2.5 text-text-muted" />
              <span className="font-semibold text-[10px]">PPN</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleTax}
                className={`px-1.5 py-0.2 rounded text-[10px] font-semibold transition-colors ${
                  enableTax
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-surface-subtle text-text-muted hover:text-text border border-border"
                }`}
              >
                {enableTax ? `PPN ${taxPercent}%` : "0% (Bebas)"}
              </button>
              {enableTax && (
                <span className="font-bold text-text ml-0.5 font-mono num text-[10px]">
                  +{formatRupiah(taxAmount)}
                </span>
              )}
            </div>
          </div>

          {/* Grand Total */}
          <div className="pt-1.5 border-t border-border flex justify-between items-baseline">
            <div>
              <span className="text-[10px] font-bold text-text uppercase tracking-tight block">
                TOTAL
              </span>
              <span className="text-[9px] text-text-muted">
                {totalCartItems} item
              </span>
            </div>
            <span className="text-base sm:text-lg font-black text-text font-mono num">
              {formatRupiah(finalTotal)}
            </span>
          </div>
        </div>

        {/* Payment Method Selector: Sleek Horizontal Grid */}
        <div className="space-y-1">
          <div className="grid grid-cols-4 gap-1 p-0.5 bg-surface border border-border rounded">
            {[
              { id: "TUNAI" as const, label: "Tunai", icon: Banknote },
              { id: "QRIS" as const, label: "QRIS", icon: QrCode },
              { id: "DEBIT" as const, label: "Debit", icon: CreditCard },
              { id: "TRANSFER" as const, label: "Transfer", icon: Building2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onSelectPaymentMethod(id)}
                className={`flex items-center justify-center gap-1 py-1 rounded text-center transition-all ${
                  paymentMethod === id
                    ? "bg-text text-ground font-bold shadow-2xs"
                    : "text-text-muted hover:text-text hover:bg-surface-subtle"
                }`}
              >
                <Icon className="w-3 h-3 text-current shrink-0" />
                <span className="text-[10px] leading-none">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash Given & Quick Amount for TUNAI */}
        {paymentMethod === "TUNAI" ? (
          <div className="space-y-1 pt-0.5 border-t border-border-subtle">
            <div className="flex items-center bg-surface border border-border rounded px-2 py-1 focus-within:border-text focus-within:ring-1 focus-within:ring-text transition-colors">
              <span className="text-text-muted font-mono font-bold text-xs mr-1 select-none">Rp</span>
              <input
                ref={cashInputRef}
                type="number"
                value={cashGiven || ""}
                onChange={(e) => onCashGivenChange(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full text-right font-mono num text-sm font-bold text-text bg-transparent focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Quick Cash Chips */}
            <div className="grid grid-cols-5 gap-1">
              <button
                type="button"
                onClick={() => onCashGivenChange(finalTotal)}
                className="col-span-2 py-0.5 text-[10px] bg-surface border border-border hover:border-border-strong text-text rounded font-bold transition-colors flex items-center justify-center gap-0.5"
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>Uang Pas</span>
              </button>
              {[20000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onCashGivenChange(amt >= finalTotal ? amt : finalTotal + amt)}
                  className="py-0.5 text-[10px] bg-surface border border-border hover:border-border-strong text-text rounded font-semibold transition-colors font-mono num"
                >
                  {amt / 1000}k
                </button>
              ))}
            </div>

            {/* Change Box */}
            <div className="flex justify-between items-center text-[10px] px-2 py-1 rounded bg-surface border border-border">
              <span className="font-semibold text-text-muted">Kembalian:</span>
              {!cashGiven || cashGiven === 0 ? (
                <span className="text-text-muted">Input uang pembeli</span>
              ) : cashGiven < finalTotal ? (
                <span className="font-mono num font-semibold text-negative">
                  Kurang {formatRupiah(finalTotal - cashGiven)}
                </span>
              ) : (
                <span className="font-mono num font-bold text-accent">
                  {cashGiven === finalTotal ? "Rp 0 (Pas)" : formatRupiah(changeAmount)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="py-1 px-2 rounded bg-surface border border-border text-[10px] text-text-muted flex items-center justify-between">
            <span>Nominal bayar {paymentMethod}:</span>
            <span className="font-bold text-text font-mono num">{formatRupiah(finalTotal)}</span>
          </div>
        )}

        {/* PRIMARY ACTION: BUTTON HIJAU / BAYAR SEKARANG */}
        <Button
          variant="accent"
          size="md"
          onClick={onOpenPaymentConfirm}
          disabled={!isPaymentValid || isSubmitting}
          isLoading={isSubmitting}
          className="w-full font-bold shadow-xs py-2 text-xs"
          rightIcon={
            <kbd className="hidden sm:inline-block px-1 py-0.2 bg-black/20 text-white rounded text-[9px] font-mono font-bold">
              F9
            </kbd>
          }
        >
          {cart.length === 0
            ? "Keranjang Kosong"
            : paymentMethod !== "TUNAI"
            ? `Bayar via ${paymentMethod}`
            : cashGiven < finalTotal
            ? `Uang Kurang (${formatRupiah(finalTotal - cashGiven)})`
            : "Bayar & Cetak Struk"}
        </Button>
      </div>
    </div>
  );
};
