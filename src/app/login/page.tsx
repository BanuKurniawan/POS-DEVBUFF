"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck,
  Clock,
  Radio,
  Store,
  Check,
} from "lucide-react";
import { loginUser } from "@/app/actions/auth";
import { getStoreSetting, StoreSettingDTO } from "@/app/actions/settings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRealtimeClock } from "@/hooks";

interface CashierProfile {
  name: string;
  role: "OWNER" | "KARYAWAN";
  roleLabel: string;
  email: string;
  pass: string;
  badgeCode: string;
  description: string;
}

const CASHIER_PROFILES: CashierProfile[] = [
  {
    name: "Budi Gunawan",
    role: "OWNER",
    roleLabel: "Owner / Pemilik",
    email: "owner@kasir.com",
    pass: "owner123",
    badgeCode: "ID: OWN-01",
    description: "Akses Penuh: POS, Keuangan & Manajemen",
  },
  {
    name: "Ahmad Kasir",
    role: "KARYAWAN",
    roleLabel: "Kasir Berjaga",
    email: "kasir@kasir.com",
    pass: "kasir123",
    badgeCode: "ID: CSR-02",
    description: "Akses Kasir POS: Penjualan & Cetak Struk",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const currentTimeStr = useRealtimeClock();

  // Auth State
  const [email, setEmail] = useState("kasir@kasir.com");
  const [password, setPassword] = useState("kasir123");
  const [selectedProfileEmail, setSelectedProfileEmail] = useState<string>("kasir@kasir.com");
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"quick" | "manual">("quick");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Store Setting
  const [storeInfo, setStoreInfo] = useState<StoreSettingDTO>({
    id: "default",
    storeName: "KasirKITA Sembako",
    address: "Pusat Sembako & Kebutuhan Pokok",
    phoneNumber: "0812-3456-7890",
    logoUrl: "",
    receiptFooter: "",
  });

  useEffect(() => {
    getStoreSetting()
      .then((s) => setStoreInfo(s))
      .catch(() => {});
  }, []);

  // Hitung Shift Berdasarkan Jam Lokal
  const getShiftInfo = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) {
      return { name: "Shift 1 (Pagi)", timeRange: "06:00 - 14:00 WIB" };
    }
    if (hour >= 14 && hour < 22) {
      return { name: "Shift 2 (Sore)", timeRange: "14:00 - 22:00 WIB" };
    }
    return { name: "Shift 3 (Malam)", timeRange: "22:00 - 06:00 WIB" };
  };

  const shift = getShiftInfo();

  const handleSelectProfile = (profile: CashierProfile) => {
    setSelectedProfileEmail(profile.email);
    setEmail(profile.email);
    setPassword(profile.pass);
    setError("");
  };

  const handleSubmit = async (targetEmail = email, targetPass = password) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await loginUser(targetEmail, targetPass);

      if (!res.success || !res.user) {
        setError(res.message || "Email atau kata sandi tidak sesuai.");
        setIsLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("kasir_session", JSON.stringify(res.user));
      }

      router.push(res.redirectTo || "/pos");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Terjadi kendala saat menghubungi server database."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-ground flex flex-col justify-between items-center p-3 sm:p-6 antialiased text-text select-none">
      {/* Top Station Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 text-xs text-text-muted border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-text bg-surface border border-border px-2 py-0.5 rounded shadow-2xs">
            <Radio className="w-3 h-3 text-accent animate-pulse" />
            <span>TERMINAL #01</span>
          </span>
          <span className="hidden sm:inline text-text-faint">&bull;</span>
          <span className="hidden sm:inline font-mono text-[11px] text-text-muted">
            POS REGISTER ONLINE
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1 text-text">
            <Clock className="w-3 h-3 text-accent shrink-0" />
            <span>{currentTimeStr || "Memuat waktu..."}</span>
          </span>
        </div>
      </header>

      {/* Main Workstation Card */}
      <main className="w-full max-w-4xl my-auto py-6">
        <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* SISI KIRI: Brand & Status Shift Kasir (42% width) */}
          <section className="lg:col-span-5 bg-surface-subtle p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
            <div className="space-y-6">
              {/* Logo & Store Info */}
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-surface border border-border p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  {storeInfo.logoUrl ? (
                    <Image
                      src={storeInfo.logoUrl}
                      alt={storeInfo.storeName}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src="/KasirKITA.png"
                      alt="KasirKITA"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                      priority
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold text-text tracking-tight leading-tight truncate">
                    {storeInfo.storeName}
                  </h1>
                  <p className="text-xs text-text-muted truncate mt-0.5">
                    {storeInfo.address}
                  </p>
                </div>
              </div>

              {/* Status Box Kasir */}
              <div className="p-3.5 bg-surface rounded-lg border border-border space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted font-medium">Status Mesin:</span>
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-accent text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    SIAP TRANSAKSI
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-border-subtle pt-2">
                  <span className="text-text-muted font-medium">Jadwal Shift:</span>
                  <span className="font-semibold text-text text-xs">
                    {shift.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-border-subtle pt-2 font-mono text-[11px] text-text-muted">
                  <span>Waktu Operasional:</span>
                  <span>{shift.timeRange}</span>
                </div>
              </div>

              {/* Tips Cepat Keyboard */}
              <div className="hidden lg:block space-y-1.5 text-xs text-text-muted">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-faint block">
                  Pintasan Tombol POS:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <div className="bg-surface px-2 py-1 rounded border border-border flex items-center justify-between">
                    <span className="text-text font-bold">F2</span>
                    <span className="text-text-muted">Scan / Cari</span>
                  </div>
                  <div className="bg-surface px-2 py-1 rounded border border-border flex items-center justify-between">
                    <span className="text-accent font-bold">F9</span>
                    <span className="text-text-muted">Bayar Nota</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Proteksi Keamanan */}
            <div className="pt-6 mt-6 border-t border-border-subtle flex items-center gap-2 text-[11px] text-text-muted">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
              <span>Autentikasi Terenkripsi &bull; Transaksi Idempoten</span>
            </div>
          </section>

          {/* SISI KANAN: Form & Quick Cashier Selector (58% width) */}
          <section className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Header Pilihan Mode */}
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-border-subtle">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-text">
                    Buka Shift & Masuk Kasir
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Pilih akun petugas yang sedang berjaga atau gunakan akun lain.
                  </p>
                </div>

                {/* Toggle Mode */}
                <div className="inline-flex p-0.5 bg-surface-subtle border border-border rounded-md text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("quick");
                      setError("");
                    }}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      authMode === "quick"
                        ? "bg-surface text-text font-bold shadow-2xs"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    Pilih Kasir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("manual");
                      setError("");
                    }}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      authMode === "manual"
                        ? "bg-surface text-text font-bold shadow-2xs"
                        : "text-text-muted hover:text-text"
                    }`}
                  >
                    Ketik Akun
                  </button>
                </div>
              </div>

              {/* Alert Error */}
              {error && (
                <div className="mt-4 p-3 text-xs bg-negative-bg border border-negative-border text-negative rounded-md flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{error}</span>
                </div>
              )}

              {/* MODE 1: Pilih Kasir Bertugas (Kartu Kasir Interaktif) */}
              {authMode === "quick" && (
                <div className="mt-4 space-y-3">
                  <label className="text-xs font-semibold text-text flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-accent" />
                    <span>Pilih Petugas yang Bertugas:</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CASHIER_PROFILES.map((profile) => {
                      const isSelected = selectedProfileEmail === profile.email;

                      return (
                        <div
                          key={profile.email}
                          onClick={() => handleSelectProfile(profile)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition-all relative ${
                            isSelected
                              ? "bg-surface border-accent ring-2 ring-accent/20 shadow-xs"
                              : "bg-surface-subtle border-border hover:border-border-strong hover:bg-surface"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5 mb-1.5">
                            <div className="w-7 h-7 rounded-full bg-accent-light text-accent border border-positive-border font-bold text-xs flex items-center justify-center font-mono">
                              {profile.name.charAt(0)}
                            </div>
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                profile.role === "OWNER"
                                  ? "bg-surface-subtle border-border text-text"
                                  : "bg-accent-light/30 border-positive-border text-accent"
                              }`}
                            >
                              {profile.role}
                            </span>
                          </div>

                          <h3 className="text-xs sm:text-sm font-bold text-text truncate">
                            {profile.name}
                          </h3>
                          <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                            {profile.description}
                          </p>

                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-border-subtle text-[10px] font-mono text-text-faint">
                            <span>{profile.badgeCode}</span>
                            {isSelected && (
                              <span className="text-accent font-bold flex items-center gap-0.5">
                                <Check className="w-3 h-3 stroke-[3]" />
                                Terpilih
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form Input (Email & Kata Sandi) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="mt-4 space-y-3.5"
              >
                {/* Email Input (Tampil hanya jika mode manual atau bisa ditinjau) */}
                {authMode === "manual" ? (
                  <Input
                    label="Alamat Email Petugas"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="nama@kasir.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                ) : (
                  <div className="p-2.5 bg-surface-subtle border border-border rounded-md flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span className="text-text-muted">Akun:</span>
                      <span className="font-mono font-bold text-text truncate">
                        {email}
                      </span>
                    </div>
                    <span className="text-[10px] text-accent font-semibold bg-accent-light/30 border border-positive-border px-1.5 py-0.2 rounded shrink-0">
                      Terverifikasi
                    </span>
                  </div>
                )}

                {/* Password / PIN Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text tracking-tight">
                    Kata Sandi / Kunci Kasir
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-text-muted pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Ketik kata sandi..."
                      className="w-full bg-surface text-text placeholder:text-text-faint border border-border hover:border-border-strong rounded-md h-9 pl-9 pr-10 text-sm font-mono num transition-colors focus:outline-hidden focus:border-text focus:ring-1 focus:ring-text"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 text-text-muted hover:text-text p-1 transition-colors"
                      title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tombol Masuk Shift Kasir */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full justify-center h-10 text-sm font-bold shadow-xs active:scale-[0.99] transition-transform"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Buka Terminal Kasir
                  </Button>
                </div>
              </form>
            </div>

            {/* Footnote Shift Info */}
            <div className="pt-3 border-t border-border-subtle flex flex-col xs:flex-row items-center justify-between gap-2 text-[11px] text-text-muted">
              <span className="flex items-center gap-1 font-mono">
                <span>Tekan</span>
                <kbd className="px-1.5 py-0.2 bg-surface border border-border rounded text-[10px] font-bold text-text">
                  Enter ↵
                </kbd>
                <span>untuk langsung masuk</span>
              </span>

              <span className="text-text-faint">
                Versi 2.4 Retail &bull; Toko Sembako
              </span>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Hak Cipta */}
      <footer className="w-full max-w-4xl text-center py-2 text-[11px] text-text-muted font-mono">
        &copy; {new Date().getFullYear()} {storeInfo.storeName}. Sistem Kasir & Manajemen Stok Sembako.
      </footer>
    </div>
  );
}
