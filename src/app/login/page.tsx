"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { loginUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@kasir.com");
  const [password, setPassword] = useState("owner123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      router.push(res.redirectTo || "/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Terjadi kendala saat menghubungi server database."
      );
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleSubmit(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen w-full bg-ground flex flex-col justify-center items-center p-4 antialiased text-text select-none">
      <div className="w-full max-w-sm bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Brand Header */}
        <div className="p-6 text-center border-b border-border bg-surface-subtle">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-md bg-surface p-1.5 flex items-center justify-center border border-border shadow-2xs">
              <Image
                src="/KasirKITA.png"
                alt="KasirKITA"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-base font-bold tracking-tight text-text">KasirKITA Sembako</h1>
          <p className="text-xs text-text-muted mt-0.5">Masuk untuk memulai shift kasir dan kelola toko</p>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-negative-bg border border-negative-border text-negative rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form Login */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-3"
          >
            <Input
              label="Alamat Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nama@kasir.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Kata Sandi"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Masuk ke Aplikasi
              </Button>
            </div>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-3 border-t border-border space-y-2">
            <span className="text-[11px] font-semibold text-text-muted block text-center">
              Akses Cepat Demo Akun:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo("owner@kasir.com", "owner123")}
                disabled={isLoading}
                className="p-2 text-center rounded-md border border-border bg-surface-subtle hover:bg-surface text-xs font-semibold text-text transition-colors"
              >
                Pemilik
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin@kasir.com", "admin123")}
                disabled={isLoading}
                className="p-2 text-center rounded-md border border-border bg-surface-subtle hover:bg-surface text-xs font-semibold text-text transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("kasir@kasir.com", "kasir123")}
                disabled={isLoading}
                className="p-2 text-center rounded-md border border-border bg-surface-subtle hover:bg-surface text-xs font-semibold text-text transition-colors"
              >
                Kasir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
