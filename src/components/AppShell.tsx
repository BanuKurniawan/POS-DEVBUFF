"use client";

import React, { useEffect, useState, startTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  PackagePlus,
  Receipt,
  LogOut,
  Settings,
  Menu,
  X,
  User,
} from "lucide-react";
import { DEMO_ACCOUNTS, SessionUser } from "@/lib/auth";
import { getStoreSetting } from "@/app/actions/settings";
import { Badge } from "@/components/ui/Badge";

interface AppShellProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function AppShell({ children, pageTitle }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser>(DEMO_ACCOUNTS[0]);
  const [storeName, setStoreName] = useState<string>("Toko Sembako");
  const [storeLogoUrl, setStoreLogoUrl] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    // Read session safely
    const saved = localStorage.getItem("kasir_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        startTransition(() => {
          setCurrentUser(parsed);
        });
      } catch (e) {
        console.error(e);
      }
    }

    // Load store setting
    getStoreSetting()
      .then((s) => {
        startTransition(() => {
          setStoreName(s.storeName);
          setStoreLogoUrl(s.logoUrl || "");
        });
      })
      .catch(() => {});

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ storeName?: string; logoUrl?: string }>;
      startTransition(() => {
        if (customEvent.detail?.storeName) setStoreName(customEvent.detail.storeName);
        if (customEvent.detail?.logoUrl !== undefined) setStoreLogoUrl(customEvent.detail.logoUrl);
      });
    };
    window.addEventListener("store_settings_updated", handleSettingsUpdate);

    return () => {
      window.removeEventListener("store_settings_updated", handleSettingsUpdate);
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("kasir_session");
    try {
      const { logoutUser } = await import("@/app/actions/auth");
      await logoutUser();
    } catch (e) {
      console.error(e);
    }
    router.push("/login");
  };

  const navLinks = [
    {
      label: "Ringkasan",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["OWNER", "ADMIN"],
    },
    {
      label: "Kasir (POS)",
      href: "/pos",
      icon: Store,
      roles: ["OWNER", "ADMIN", "KARYAWAN"],
      badge: "F2",
    },
    {
      label: "Katalog Produk",
      href: "/products",
      icon: Package,
      roles: ["OWNER", "ADMIN"],
    },
    {
      label: "Stok Masuk",
      href: "/stock-in",
      icon: PackagePlus,
      roles: ["OWNER", "ADMIN", "KARYAWAN"],
    },
    {
      label: "Riwayat Transaksi",
      href: "/transactions",
      icon: Receipt,
      roles: ["OWNER", "ADMIN"],
    },
    {
      label: "Pengaturan & Karyawan",
      href: "/settings",
      icon: Settings,
      roles: ["OWNER"],
    },
  ];

  const roleLabel =
    currentUser.role === "OWNER"
      ? "Pemilik"
      : currentUser.role === "ADMIN"
      ? "Admin"
      : "Kasir";

  const roleBadgeVariant =
    currentUser.role === "OWNER"
      ? "warning"
      : currentUser.role === "ADMIN"
      ? "info"
      : "neutral";

  const renderNavContent = (isMobileDrawer: boolean = false) => (
    <div className="flex flex-col h-full justify-between">
      {/* Brand & Store Profile */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {storeLogoUrl ? (
              <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 border border-border bg-surface flex items-center justify-center relative">
                <Image
                  src={storeLogoUrl}
                  alt={storeName}
                  width={32}
                  height={32}
                  className="w-full h-full object-contain p-0.5"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 select-none">
                {storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="font-bold text-sm text-text block truncate tracking-tight">
                {storeName}
              </span>
              <span className="text-[11px] text-text-muted block truncate">
                KasirKITA Sembako
              </span>
            </div>
          </div>

          {isMobileDrawer && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-sm text-text-muted hover:text-text hover:bg-surface-subtle"
              aria-label="Tutup menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <div className="px-2.5 py-1.5 text-[11px] font-semibold text-text-muted">
          Menu Utama
        </div>

        {navLinks.map((item) => {
          const hasAccess = item.roles.includes(currentUser.role);
          if (!hasAccess) return null;

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors select-none ${
                isActive
                  ? "bg-surface-subtle text-text font-semibold border border-border shadow-2xs"
                  : "text-text-muted hover:text-text hover:bg-surface-subtle/60 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <item.icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-text" : "text-text-muted"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                    isActive
                      ? "bg-border text-text"
                      : "bg-surface-subtle text-text-muted"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-2 border-t border-border bg-surface-subtle/40">
        <div className="p-2 rounded-md border border-border bg-surface flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-sm bg-surface-subtle border border-border flex items-center justify-center shrink-0 text-text-muted">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text truncate leading-tight">
                {currentUser.name}
              </p>
              <div className="mt-0.5">
                <Badge variant={roleBadgeVariant} size="sm">
                  {roleLabel}
                </Badge>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar"
            aria-label="Keluar akun"
            className="text-text-muted hover:text-negative p-1.5 rounded-sm hover:bg-surface-subtle transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-ground text-text antialiased overflow-hidden">
      {/* Desktop Sidebar: Framed-sheet style (light, 1px border) */}
      <aside className="hidden md:flex w-[232px] bg-surface-sidebar flex-col shrink-0 border-r border-sidebar-border select-none z-20">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-surface-sidebar h-full border-r border-border flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-ground">
        {/* Clean Header */}
        <header className="h-[52px] bg-surface border-b border-border px-3 sm:px-6 flex items-center justify-between shrink-0 z-10 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-subtle border border-border shrink-0"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-text tracking-tight truncate">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/pos"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-md shadow-2xs hover:bg-accent-hover transition-colors select-none shrink-0"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Buka Kasir</span>
              <span className="xs:hidden">Kasir</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
