import React from "react";
import Image from "next/image";
import { Printer, Share2 } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { TransactionSummaryDTO, StoreSettingDTO } from "@/types";
import { formatRupiah } from "@/utils/format";
import { getWhatsAppShareUrl, getPaymentMethodLabel } from "@/utils/receipt";

interface PosReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTransaction: TransactionSummaryDTO | null;
  storeSetting: StoreSettingDTO;
  cashierName?: string;
  enableTax: boolean;
  taxPercent: number;
}

export const PosReceiptModal: React.FC<PosReceiptModalProps> = ({
  isOpen,
  onClose,
  completedTransaction,
  storeSetting,
  cashierName,
  enableTax,
  taxPercent,
}) => {
  if (!completedTransaction) return null;

  const waShareUrl = getWhatsAppShareUrl({
    storeName: storeSetting.storeName,
    storeAddress: storeSetting.address,
    storePhone: storeSetting.phoneNumber,
    receiptFooter: storeSetting.receiptFooter,
    invoiceNumber: completedTransaction.invoiceNumber,
    createdAt: completedTransaction.createdAt,
    cashierName: cashierName || "Kasir",
    items: completedTransaction.items,
    discount: completedTransaction.discount,
    tax: completedTransaction.tax,
    finalAmount: completedTransaction.finalAmount,
    paymentMethod: completedTransaction.paymentMethod,
    paidAmount: completedTransaction.paidAmount,
    changeAmount: completedTransaction.changeAmount,
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Transaksi Berhasil Disimpan"
      description={`No. Faktur: ${completedTransaction.invoiceNumber}`}
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-between w-full no-print">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Transaksi Baru (Esc)
          </Button>
          <div className="flex items-center gap-2">
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-subtle text-text border border-border rounded-md text-xs font-semibold"
            >
              <Share2 className="w-3.5 h-3.5 text-accent" />
              <span>Kirim WA</span>
            </a>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Cetak Struk
            </Button>
          </div>
        </div>
      }
    >
      {/* Printable Thermal Receipt Card (58mm/80mm Alfamart Style) */}
      <div
        id="receipt-paper"
        className="p-5 font-mono text-[11px] text-black bg-white border border-border rounded-md space-y-2.5 print:border-none print:p-0 print:m-0 print:w-full select-text"
      >
        {/* Toko Header */}
        <div className="text-center space-y-0.5">
          {storeSetting.logoUrl && (
            <div className="flex justify-center mb-1.5">
              <Image
                src={storeSetting.logoUrl}
                alt="Logo Toko"
                width={44}
                height={44}
                className="object-contain"
                unoptimized
              />
            </div>
          )}
          <p className="font-bold text-sm tracking-tight uppercase">
            {storeSetting.storeName}
          </p>
          {storeSetting.address && (
            <p className="text-[10px] text-gray-700 leading-tight whitespace-pre-line">
              {storeSetting.address}
            </p>
          )}
          {storeSetting.phoneNumber && (
            <p className="text-[10px] text-gray-700">
              Telp/WA: {storeSetting.phoneNumber}
            </p>
          )}
        </div>

        {/* Nomor Faktur & Jam Transaksi */}
        <div className="pt-2 border-t border-dashed border-gray-400 space-y-0.5 text-[10px] text-gray-800">
          <div className="flex justify-between">
            <span>
              {new Date(completedTransaction.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
              {new Date(completedTransaction.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="font-bold">#{completedTransaction.invoiceNumber.slice(-4)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>No. Struk</span>
            <span className="font-bold text-gray-800">{completedTransaction.invoiceNumber}</span>
          </div>
        </div>

        {/* Items (Format Alfamart) */}
        <div className="pt-1.5 border-t border-dashed border-gray-400 pb-1.5 space-y-1.5">
          {completedTransaction.items.map((item, idx) => (
            <div key={idx} className="space-y-0.5 text-[11px]">
              <p className="font-semibold text-gray-950 leading-tight">{item.name}</p>
              <div className="flex justify-between text-[10px] text-gray-700 num">
                <span>
                  {item.quantity}x {item.price.toLocaleString("id-ID")}
                </span>
                <span className="font-semibold text-black">
                  {item.subtotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="pt-1.5 border-t border-dashed border-gray-400 pb-1.5 space-y-1 text-[11px] num">
          <div className="flex justify-between text-gray-700">
            <span>Total Item</span>
            <span>
              {completedTransaction.items.reduce((s, i) => s + i.quantity, 0)} barang
            </span>
          </div>

          {completedTransaction.discount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Hemat / Diskon</span>
              <span>-{formatRupiah(completedTransaction.discount)}</span>
            </div>
          )}

          {completedTransaction.tax > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>PPN ({enableTax ? `${taxPercent}%` : ""})</span>
              <span>+{formatRupiah(completedTransaction.tax)}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-300 text-black">
            <span>TOTAL BELANJA</span>
            <span className="text-sm font-black">{formatRupiah(completedTransaction.finalAmount)}</span>
          </div>

          <div className="flex justify-between text-gray-800 pt-1">
            <span>{getPaymentMethodLabel(completedTransaction.paymentMethod)}</span>
            <span className="font-bold">{formatRupiah(completedTransaction.paidAmount)}</span>
          </div>

          {completedTransaction.paymentMethod === "TUNAI" && completedTransaction.changeAmount > 0 ? (
            <div className="flex justify-between font-bold text-gray-900">
              <span>Kembalian</span>
              <span className="font-black">{formatRupiah(completedTransaction.changeAmount)}</span>
            </div>
          ) : completedTransaction.paymentMethod === "TUNAI" ? (
            <div className="flex justify-between text-gray-700">
              <span>Kembalian</span>
              <span className="font-semibold">Rp 0 (Uang Pas)</span>
            </div>
          ) : null}

          <div className="flex justify-end pt-0.5">
            <span className="text-[10px] font-bold text-gray-700 uppercase bg-gray-100 px-1.5 py-0.2 rounded border border-gray-300">
              Lunas
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-dashed border-gray-400 text-center space-y-1.5 text-[10px] text-gray-700 leading-tight">
          <p className="italic text-gray-600">
            Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan lagi.
          </p>

          <p className="font-bold text-gray-900">
            Kasir : {cashierName || "Kasir"}
          </p>

          <div className="pt-1 space-y-0.5 font-bold text-gray-950">
            <p className="text-[9px] font-medium text-gray-600">Selamat Berbelanja Kembali</p>
          </div>

          {storeSetting.receiptFooter && (
            <p className="text-[9px] text-gray-600 pt-1 whitespace-pre-line border-t border-dotted border-gray-300">
              {storeSetting.receiptFooter}
            </p>
          )}
        </div>
      </div>
    </Dialog>
  );
};

