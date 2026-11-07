import React, { useState } from "react";
import {
  QrCode,
  Banknote,
  Building2,
  CreditCard,
  CheckCircle2,
  Check,
  Copy,
  User,
} from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PaymentMethod } from "@/types";
import { formatRupiah } from "@/utils/format";

interface PosPaymentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  finalTotal: number;
  totalCartItems: number;
  paymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  cashGiven: number;
  onCashGivenChange: (val: number) => void;
  changeAmount: number;
  storeName: string;
  cashierName?: string;
  isSubmitting: boolean;
  onConfirmCheckout: () => void;
}

export const PosPaymentConfirmModal: React.FC<PosPaymentConfirmModalProps> = ({
  isOpen,
  onClose,
  finalTotal,
  totalCartItems,
  paymentMethod,
  onSelectPaymentMethod,
  cashGiven,
  onCashGivenChange,
  changeAmount,
  storeName,
  cashierName,
  isSubmitting,
  onConfirmCheckout,
}) => {
  const [copiedBankName, setCopiedBankName] = useState<string | null>(null);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Verifikasi & Konfirmasi Pembayaran"
      description="Periksa mutasi dana masuk atau uang tunai pembeli sebelum mencetak struk resmi."
      maxWidth="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Kembali / Ubah Keranjang
          </Button>

          <Button
            variant="accent"
            size="md"
            onClick={onConfirmCheckout}
            disabled={isSubmitting || (paymentMethod === "TUNAI" && cashGiven < finalTotal)}
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            className="w-full sm:w-auto font-bold"
          >
            {paymentMethod === "QRIS"
              ? "Dana QRIS Masuk — Terbitkan Struk"
              : paymentMethod === "TRANSFER"
                ? "Dana Transfer Masuk — Terbitkan Struk"
                : paymentMethod === "DEBIT"
                  ? "EDC Berhasil — Terbitkan Struk"
                  : "Uang Pas / Diterima — Terbitkan Struk"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Tagihan Summary Bar */}
        <div className="p-3.5 bg-surface-subtle border border-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono num">
          <div>
            <span className="text-[11px] text-text-muted font-sans font-medium block">
              Total Tagihan Belanja ({totalCartItems} item)
            </span>
            <span className="text-xl sm:text-2xl font-black text-text">
              {formatRupiah(finalTotal)}
            </span>
          </div>
          <div className="flex flex-col sm:items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-sans">Metode:</span>
              <Badge variant="neutral" size="md" className="font-bold text-xs uppercase">
                {paymentMethod}
              </Badge>
            </div>
            {cashierName && (
              <span className="text-[10px] text-text-muted font-sans flex items-center gap-1">
                <User className="w-3 h-3 text-accent" />
                <span>Kasir: <strong className="text-text">{cashierName}</strong></span>
              </span>
            )}
          </div>
        </div>

        {/* Quick Switch Payment Method Tabs */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text tracking-tight">
              Ganti Metode Pembayaran:
            </label>
            <span className="text-[10px] text-text-muted">
              Klik jika pembeli ingin pindah metode
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 p-1 bg-surface-subtle border border-border rounded-lg">
            {[
              { id: "QRIS" as const, label: "QRIS", icon: QrCode },
              { id: "TUNAI" as const, label: "Tunai", icon: Banknote },
              { id: "TRANSFER" as const, label: "Transfer", icon: Building2 },
              { id: "DEBIT" as const, label: "Debit", icon: CreditCard },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onSelectPaymentMethod(id);
                  if (id !== "TUNAI") {
                    onCashGivenChange(finalTotal);
                  }
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-all ${paymentMethod === id
                  ? "bg-surface border border-border text-text font-bold shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface/50"
                  }`}
              >
                <Icon className="w-3.5 h-3.5 text-current shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DETAIL VIEW PER METODE */}
        {paymentMethod === "QRIS" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-surface rounded-lg border border-border">
            {/* Left: Authentic QRIS Stand Card */}
            <div className="md:col-span-5 bg-white border border-gray-300 rounded-lg p-3 text-center text-black shadow-xs space-y-2">
              <div className="bg-[#ED1C24] text-white py-1 px-2 rounded-t-sm flex items-center justify-between">
                <span className="font-bold text-xs tracking-wider">QRIS</span>
                <span className="text-[9px] font-medium tracking-tight">PEMBAYARAN DIGITAL</span>
              </div>

              <div className="leading-tight">
                <p className="font-bold text-xs uppercase tracking-tight text-gray-900">
                  {storeName}
                </p>
                <p className="text-[9px] text-gray-500 font-mono">NMID: ID1020261101982</p>
              </div>

              {/* SVG QR Code */}
              <div className="flex justify-center p-1 bg-white">
                <svg
                  viewBox="0 0 100 100"
                  className="w-40 h-40 max-w-full bg-white"
                  shapeRendering="crispEdges"
                >
                  <rect width="100" height="100" fill="#FFFFFF" />
                  <rect x="8" y="8" width="28" height="28" fill="#000000" />
                  <rect x="12" y="12" width="20" height="20" fill="#FFFFFF" />
                  <rect x="16" y="16" width="12" height="12" fill="#000000" />

                  <rect x="64" y="8" width="28" height="28" fill="#000000" />
                  <rect x="68" y="12" width="20" height="20" fill="#FFFFFF" />
                  <rect x="72" y="16" width="12" height="12" fill="#000000" />

                  <rect x="8" y="64" width="28" height="28" fill="#000000" />
                  <rect x="12" y="68" width="20" height="20" fill="#FFFFFF" />
                  <rect x="16" y="72" width="12" height="12" fill="#000000" />

                  <rect x="40" y="12" width="4" height="4" fill="#000000" />
                  <rect x="48" y="12" width="4" height="4" fill="#000000" />
                  <rect x="56" y="12" width="4" height="4" fill="#000000" />
                  <rect x="40" y="24" width="4" height="4" fill="#000000" />
                  <rect x="48" y="24" width="4" height="4" fill="#000000" />
                  <rect x="56" y="24" width="4" height="4" fill="#000000" />

                  <rect x="12" y="40" width="4" height="4" fill="#000000" />
                  <rect x="12" y="48" width="4" height="4" fill="#000000" />
                  <rect x="12" y="56" width="4" height="4" fill="#000000" />
                  <rect x="24" y="40" width="4" height="4" fill="#000000" />
                  <rect x="24" y="48" width="4" height="4" fill="#000000" />
                  <rect x="24" y="56" width="4" height="4" fill="#000000" />

                  <rect x="68" y="68" width="18" height="18" fill="#000000" />
                  <rect x="72" y="72" width="10" height="10" fill="#FFFFFF" />
                  <rect x="75" y="75" width="4" height="4" fill="#000000" />

                  <rect x="38" y="38" width="6" height="6" fill="#000000" />
                  <rect x="56" y="38" width="4" height="6" fill="#000000" />
                  <rect x="46" y="38" width="8" height="4" fill="#000000" />
                  <rect x="66" y="40" width="6" height="4" fill="#000000" />
                  <rect x="76" y="40" width="6" height="4" fill="#000000" />
                  <rect x="86" y="38" width="6" height="6" fill="#000000" />

                  <rect x="38" y="50" width="6" height="4" fill="#000000" />
                  <rect x="48" y="52" width="4" height="6" fill="#000000" />
                  <rect x="56" y="48" width="6" height="6" fill="#000000" />
                  <rect x="66" y="50" width="6" height="4" fill="#000000" />
                  <rect x="78" y="52" width="4" height="4" fill="#000000" />
                  <rect x="86" y="48" width="6" height="6" fill="#000000" />

                  <rect x="40" y="64" width="4" height="8" fill="#000000" />
                  <rect x="48" y="66" width="6" height="4" fill="#000000" />
                  <rect x="58" y="64" width="4" height="6" fill="#000000" />

                  <rect x="40" y="80" width="8" height="4" fill="#000000" />
                  <rect x="52" y="78" width="4" height="8" fill="#000000" />
                  <rect x="60" y="82" width="6" height="4" fill="#000000" />
                  <rect x="72" y="86" width="6" height="4" fill="#000000" />
                  <rect x="84" y="80" width="8" height="6" fill="#000000" />

                  <rect x="43" y="43" width="14" height="14" fill="#ED1C24" rx="2" />
                  <text
                    x="50"
                    y="53"
                    fill="#FFFFFF"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    Q
                  </text>
                </svg>
              </div>

              <div className="pt-1 border-t border-gray-200">
                <p className="text-[10px] text-gray-500 font-medium">
                  BCA &bull; Livin &bull; GoPay &bull; OVO &bull; DANA &bull; ShopeePay
                </p>
              </div>
            </div>

            {/* Right: Cashier Verification Guide */}
            <div className="md:col-span-7 space-y-3">
              <div className="p-3 bg-accent-light/30 border border-positive-border rounded-md text-xs space-y-1">
                <span className="font-bold text-text flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span>Langkah Pembayaran QRIS:</span>
                </span>
                <ol className="list-decimal list-inside text-text-muted space-y-1 pt-1 text-[11px] leading-relaxed">
                  <li>Tunjukkan kode QRIS di samping ke layar pembeli.</li>
                  <li>Pembeli scan menggunakan aplikasi e-wallet atau m-banking.</li>
                  <li>
                    Nominal yang harus dibayar pas:{" "}
                    <strong className="text-text font-mono num">{formatRupiah(finalTotal)}</strong>.
                  </li>
                  <li>Minta pembeli menunjukkan layar bukti bayar berhasil di aplikasi mereka.</li>
                </ol>
              </div>

              <div className="p-3 bg-warning-bg border border-warning-border rounded-md text-[11px] text-warning-text leading-snug">
                <strong>Peringatan Kasir:</strong> Jangan terbitkan struk sebelum Anda melihat notifikasi dana masuk di rekening/QRIS toko atau melihat bukti transaksi valid dari pembeli.
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "TRANSFER" && (
          <div className="space-y-3 p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <span className="text-xs font-bold text-text">Daftar Rekening Bank Toko:</span>
              <span className="text-[11px] text-text-muted">Pilih rekening yang ingin diberikan ke pembeli</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { bank: "Bank BCA", noRek: "8271-9281-0021", atasNama: storeName },
                { bank: "Bank BRI", noRek: "0123-01-000456-50-8", atasNama: storeName },
                { bank: "Bank Mandiri", noRek: "137-00-1928374-1", atasNama: storeName },
              ].map((item) => {
                const isCopied = copiedBankName === item.bank;

                return (
                  <div
                    key={item.bank}
                    className="p-3 rounded-md border border-border bg-surface-subtle hover:border-border-strong transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-surface border border-border text-text">
                        {item.bank}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== "undefined" && navigator.clipboard) {
                            navigator.clipboard.writeText(item.noRek.replace(/-/g, ""));
                            setCopiedBankName(item.bank);
                            setTimeout(() => setCopiedBankName(null), 2000);
                          }
                        }}
                        className="text-[10px] text-accent hover:underline flex items-center gap-1 font-semibold"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-positive" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="font-mono num font-bold text-sm text-text tracking-tight select-all">
                      {item.noRek}
                    </p>
                    <p className="text-[10px] text-text-muted truncate">
                      a/n {item.atasNama}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-surface-subtle border border-border rounded-md text-[11px] text-text-muted space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-text">Nominal Transfer Pas:</span>
                <span className="font-bold text-text font-mono num text-sm">{formatRupiah(finalTotal)}</span>
              </div>
              <p className="leading-snug text-[10px]">
                Silakan periksa mutasi m-banking atau minta foto bukti transfer pembeli. Jika dana sudah masuk, klik tombol terbitkan struk di bawah.
              </p>
            </div>
          </div>
        )}

        {paymentMethod === "DEBIT" && (
          <div className="p-4 bg-surface rounded-lg border border-border space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-surface-subtle border border-border flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text uppercase tracking-tight">
                  Pembayaran Mesin EDC / Kartu Debit
                </h4>
                <p className="text-[11px] text-text-muted">
                  Gesek atau masukkan kartu ATM / Debit pelanggan pada mesin EDC kasir.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-surface-subtle border border-border rounded-md space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-muted">Nominal Input di EDC:</span>
                <span className="text-base font-bold text-text font-mono num">
                  {formatRupiah(finalTotal)}
                </span>
              </div>
              <ol className="list-decimal list-inside text-[11px] text-text-muted space-y-0.5 pt-1 border-t border-border-subtle">
                <li>Input nominal di atas pada mesin EDC kasir.</li>
                <li>Minta pembeli memasukkan kartu & PIN ATM mereka.</li>
                <li>Tunggu hingga struk bukti gesek EDC keluar (<em>Approval Success</em>).</li>
              </ol>
            </div>
          </div>
        )}

        {paymentMethod === "TUNAI" && (
          <div className="p-4 bg-surface rounded-lg border border-border space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-subtle rounded-md border border-border">
                <span className="text-[11px] text-text-muted block">Total Tagihan</span>
                <span className="text-base font-bold text-text font-mono num mt-0.5 block">
                  {formatRupiah(finalTotal)}
                </span>
              </div>

              <div className="p-3 bg-surface-subtle rounded-md border border-border">
                <span className="text-[11px] text-text-muted block">Uang Kembalian</span>
                <span
                  className={`text-base font-bold font-mono num mt-0.5 block ${changeAmount > 0 ? "text-accent" : "text-text"
                    }`}
                >
                  {cashGiven < finalTotal ? "Uang Kurang" : formatRupiah(changeAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-text block">
                Uang Tunai Diterima:
              </label>
              <div className="flex items-center bg-surface border border-border rounded-md px-3 py-1.5 focus-within:border-text focus-within:ring-1 focus-within:ring-text transition-colors">
                <span className="text-text-muted font-mono font-bold text-xs mr-2 select-none">Rp</span>
                <input
                  type="number"
                  value={cashGiven || ""}
                  onChange={(e) => onCashGivenChange(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full text-right font-mono num text-base font-bold text-text bg-transparent focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="grid grid-cols-5 gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => onCashGivenChange(finalTotal)}
                  className="col-span-2 py-1.5 text-xs bg-surface-subtle border border-border hover:border-border-strong text-text rounded-md font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Uang Pas</span>
                </button>
                {[20000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => onCashGivenChange(amt >= finalTotal ? amt : finalTotal + amt)}
                    className="py-1.5 text-xs bg-surface-subtle border border-border hover:border-border-strong text-text rounded-md font-semibold transition-colors font-mono num"
                  >
                    {amt / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};