import React from "react";
import Image from "next/image";
import { Printer } from "lucide-react";
import { StoreSettingDTO } from "@/types";

interface StoreReceiptPreviewProps {
  storeSetting: StoreSettingDTO;
  logoPreview?: string;
  cashierName?: string;
}

export const StoreReceiptPreview: React.FC<StoreReceiptPreviewProps> = ({
  storeSetting,
  logoPreview,
  cashierName,
}) => {
  return (
    <div className="lg:col-span-5 bg-surface rounded-md border border-border p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Printer className="w-4 h-4 text-text-muted" />
          <h3 className="text-xs font-bold text-text uppercase tracking-tight">
            Pratinjau Struk Kasir
          </h3>
        </div>
        <span className="text-[10px] font-mono bg-surface-subtle border border-border text-text-muted px-1.5 py-0.2 rounded font-semibold">
          58mm
        </span>
      </div>

      <div className="p-4 bg-ground rounded-md flex items-center justify-center">
        <div className="w-full max-w-[270px] bg-white border border-border rounded p-4 font-mono text-[11px] text-black space-y-2.5 shadow-2xs">
          {/* Header Struk Dinamis */}
          <div className="text-center space-y-1">
            {logoPreview && (
              <div className="flex justify-center mb-1">
                <Image
                  src={logoPreview}
                  alt="Logo"
                  width={44}
                  height={44}
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <p className="font-bold text-xs uppercase leading-tight tracking-tight">
              {storeSetting.storeName || "TOKO SEMBAKO"}
            </p>
            {storeSetting.address && (
              <p className="text-[10px] text-gray-700 leading-tight whitespace-pre-line">
                {storeSetting.address}
              </p>
            )}
            {storeSetting.phoneNumber && (
              <p className="text-[10px] text-gray-700 font-medium">
                Telp/WA: {storeSetting.phoneNumber}
              </p>
            )}
          </div>

          {/* Info Transaksi & Waktu (Format Alfamart) */}
          <div className="pt-2 border-t border-dashed border-gray-400 space-y-0.5 text-[10px] text-gray-800">
            <div className="flex justify-between">
              <span>01.11.2026 19:50</span>
              <span className="font-bold">#028</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>No. Struk</span>
              <span className="font-bold text-gray-800">INV-20261101-0028</span>
            </div>
          </div>

          {/* Sembako Items Sample (Format Alfamart) */}
          <div className="pt-1.5 border-t border-dashed border-gray-400 pb-1.5 space-y-1.5 text-[11px]">
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-950 leading-tight">Beras Ramos Wangi 5kg</p>
              <div className="flex justify-between text-[10px] text-gray-700 num">
                <span>1x 74.000</span>
                <span className="font-semibold text-black">74.000</span>
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-950 leading-tight">Minyak Goreng 2L</p>
              <div className="flex justify-between text-[10px] text-gray-700 num">
                <span>1x 36.000</span>
                <span className="font-semibold text-black">36.000</span>
              </div>
            </div>
          </div>

          {/* Summary & Pembayaran */}
          <div className="pt-1.5 border-t border-dashed border-gray-400 pb-1.5 space-y-1 text-[11px] num">
            <div className="flex justify-between text-gray-700 text-[10px]">
              <span>Total Item</span>
              <span>2 barang</span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-300 text-black">
              <span>TOTAL BELANJA</span>
              <span className="text-sm font-black">Rp 110.000</span>
            </div>
            <div className="flex justify-between text-gray-800 pt-1 text-[10px]">
              <span>Tunai</span>
              <span className="font-bold">Rp 120.000</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-[10px]">
              <span>Kembalian</span>
              <span className="font-black">Rp 10.000</span>
            </div>
            <div className="flex justify-end pt-0.5">
              <span className="text-[9px] font-bold text-gray-700 uppercase bg-gray-100 px-1.5 py-0.2 rounded border border-gray-300">
                Lunas
              </span>
            </div>
          </div>

          {/* Footer & Kasir */}
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
      </div>
    </div>
  );
};

