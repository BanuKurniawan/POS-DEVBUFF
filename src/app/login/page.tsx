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
  Clock,
  Radio,
} from "lucide-react";
import { loginUser } from "@/app/actions/auth";
import { getStoreSetting, StoreSettingDTO } from "@/app/actions/settings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRealtimeClock } from "@/hooks";

const QUICK_ACCOUNTS = [
  {
    role: "KARYAWAN",
    label: "Kasir",
    name: "Ahmad Kasir",
    email: "kasir@kasir.com",
    pass: "kasir123",
  },
  {
    role: "OWNER",
    label: "Owner",
    name: "Budi Gunawan",
    email: "owner@kasir.com",
    pass: "owner123",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const currentTimeStr = useRealtimeClock();

  const [email, setEmail] = useState("kasir@kasir.com");
  const [password, setPassword] = useState("kasir123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await loginUser(email, password);

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
    <div className="min-h-screen w-full bg-ground flex flex-col justify-between items-center p-4 sm:p-6 antialiased text-text select-none">
      {/* Top Status Bar (Simple & Unobtrusive) */}
      <header className="w-full max-w-sm sm:max-w-md flex items-center justify-between text-[11px] text-text-muted font-mono pt-1">
        <span className="flex items-center gap-1.5 text-text font-semibold">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>TERMINAL POS</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-text-muted" />
          <span>{currentTimeStr || "Online"}</span>
        </span>
      </header>

      {/* Main Login Card (Compact, Responsive on Mobile & Desktop) */}
      <main className="w-full max-w-sm sm:max-w-md my-auto py-4">
        <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
          {/* Brand Header */}
          <div className="p-5 sm:p-6 pb-4 sm:pb-5 text-center border-b border-border bg-surface-subtle space-y-2.5">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-lg bg-surface border border-border p-1.5 flex items-center justify-center shadow-2xs">
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
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-text tracking-tight leading-snug">
                {storeInfo.storeName}
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                Masuk untuk memulai shift & transaksi kasir
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Quick Profile Selector (One-Tap on Mobile, Sleek on Desktop) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-text-muted block">
                Pilih Akun Cepat:
              </span>
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-subtle border border-border rounded-lg">
                {QUICK_ACCOUNTS.map((acc) => {
                  const isSelected = email === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword(acc.pass);
                        setError("");
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md text-xs transition-all ${
                        isSelected
                          ? "bg-surface text-text shadow-2xs border border-border font-bold"
                          : "text-text-muted hover:text-text hover:bg-surface/60 font-medium"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-accent" : "bg-text-faint"
                        }`}
                      />
                      <span className="truncate">{acc.label}</span>
                      <span className="text-[10px] text-text-muted font-normal hidden xs:inline">
                        ({acc.name.split(" ")[0]})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-3 text-xs bg-negative-bg border border-negative-border text-negative rounded-md flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="Email Petugas"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nama@kasir.com"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text tracking-tight">
                  Kata Sandi
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
                    placeholder="••••••••"
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

              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center h-10 text-sm font-bold shadow-xs active:scale-[0.99] transition-transform"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Masuk ke Kasir
                </Button>
              </div>
            </form>

            <p className="text-[11px] text-center text-text-muted font-mono pt-1">
              Tekan <kbd className="px-1 py-0.2 bg-surface-subtle border border-border rounded font-bold text-text">Enter ↵</kbd> untuk langsung masuk
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="w-full max-w-sm sm:max-w-md text-center py-2 text-[11px] text-text-muted font-mono">
        &copy; {new Date().getFullYear()} {storeInfo.storeName}
      </footer>
    </div>
  );
}
