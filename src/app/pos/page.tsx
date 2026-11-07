"use client";

import React, { useState, useEffect, useMemo, useRef, startTransition, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  LayoutDashboard,
  RefreshCw,
  LogOut,
  FolderArchive,
  Barcode,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  HelpCircle,
  LayoutGrid,
  List,
  Check,
  Plus,
  Package,
  ArrowRight,
  User,
} from "lucide-react";
import { getProducts, getCategories } from "@/app/actions/products";
import { processCheckout } from "@/app/actions/checkout";
import { getStoreSetting } from "@/app/actions/settings";
import { getSessionUser } from "@/app/actions/auth";
import { SessionUser, DEMO_ACCOUNTS } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductDTO, HeldTransaction, StoreSettingDTO, TransactionSummaryDTO } from "@/types";
import { useCart, useRealtimeClock, useSound } from "@/hooks";
import { formatRupiah } from "@/utils/format";
import { generateUUID } from "@/utils/uuid";
import {
  PosCartPanel,
  PosPaymentConfirmModal,
  PosReceiptModal,
  PosHoldModal,
  PosRecallModal,
  PosShortcutsModal,
  PosCategorySlider,
} from "@/components/pos";
import { ProductImage } from "@/components/products";

export default function PosPage() {
  const router = useRouter();

  // Custom Hooks
  const { soundEnabled, toggleSound, beep, success: soundSuccess } = useSound(true);
  const currentTimeStr = useRealtimeClock();
  const {
    cart,
    setCart,
    paymentMethod,
    setPaymentMethod,
    cashGiven,
    setCashGiven,
    discountPercent,
    setDiscountPercent,
    customDiscountRp,
    enableTax,
    setEnableTax,
    taxPercent,
    setTaxPercent,
    customerOrderNote,
    setCustomerOrderNote,
    totalCartItems,
    subtotal,
    discountAmount,
    taxAmount,
    finalTotal,
    effectiveCashGiven,
    changeAmount,
    isPaymentValid,
    addToCart,
    updateQuantity,
    updateItemNote,
    removeFromCart,
    clearCart,
  } = useCart({
    onSoundBeep: beep,
  });

  // Catalog State
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Store & User State
  const [storeSetting, setStoreSetting] = useState<StoreSettingDTO>({
    id: "default",
    storeName: "KasirKITA Sembako",
    address: "Jl. Gatot Subroto No. 42, Jakarta",
    phoneNumber: "0812-3456-7890",
    logoUrl: "",
    receiptFooter: "Terima kasih atas kunjungan Anda!",
  });
  const [currentUser, setCurrentUser] = useState<SessionUser>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kasir_session");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEMO_ACCOUNTS[1] || DEMO_ACCOUNTS[0];
  });

  // Transaction Process & Modals
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [completedTransaction, setCompletedTransaction] = useState<TransactionSummaryDTO | null>(null);
  const [checkoutIdempotencyKey, setCheckoutIdempotencyKey] = useState<string>("");

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);
  const [isPaymentConfirmModalOpen, setIsPaymentConfirmModalOpen] = useState<boolean>(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState<boolean>(false);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  // Hold & Recall Orders
  const [heldTransactions, setHeldTransactions] = useState<HeldTransaction[]>([]);
  const [holdLabel, setHoldLabel] = useState<string>("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  // Load Catalog
  const loadCatalog = useCallback(async () => {
    try {
      const [data, cats] = await Promise.all([getProducts(), getCategories()]);
      startTransition(() => {
        setProducts(data);
        const uniqueCats = [
          "Semua",
          ...Array.from(new Set([...cats.map((c) => c.name), ...data.map((p) => p.category)])),
        ];
        setCategories(uniqueCats);
      });
    } catch (e) {
      console.error("Gagal memuat katalog:", e);
    }
  }, []);

  // Load Held Transactions from localStorage
  const loadHeldTransactions = useCallback(() => {
    try {
      const saved = localStorage.getItem("kasir_held_transactions");
      if (saved) {
        const parsed = JSON.parse(saved);
        startTransition(() => {
          setHeldTransactions(parsed);
        });
      }
    } catch (e) {
      console.error("Gagal membaca draft transaksi:", e);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    loadCatalog();
    loadHeldTransactions();
    getStoreSetting()
      .then((s) => {
        startTransition(() => setStoreSetting(s));
      })
      .catch(console.error);

    // Sinkronkan akun login dari server cookie session
    getSessionUser()
      .then((user) => {
        if (user) {
          startTransition(() => setCurrentUser(user));
          try {
            localStorage.setItem("kasir_session", JSON.stringify(user));
          } catch {}
        }
      })
      .catch(() => {});

    const saved = localStorage.getItem("kasir_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        startTransition(() => setCurrentUser(parsed));
      } catch (e) {
        console.error(e);
      }
    }

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timer);
  }, [loadCatalog, loadHeldTransactions]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === "Semua" || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const categoryCountMap = useMemo(() => {
    const map: Record<string, number> = { Semua: products.length };
    products.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [products]);

  // Step 1: Open Payment Confirmation Modal
  const handleOpenPaymentConfirm = () => {
    if (cart.length === 0 || isSubmitting) return;

    if (!paymentMethod) {
      setErrorMessage("Pilih salah satu metode pembayaran.");
      return;
    }

    if (paymentMethod === "TUNAI") {
      if (!cashGiven || cashGiven <= 0) {
        setErrorMessage("Masukkan jumlah uang tunai yang diterima dari pelanggan.");
        cashInputRef.current?.focus();
        return;
      }

      if (cashGiven < finalTotal) {
        setErrorMessage(`Uang pembayaran kurang ${formatRupiah(finalTotal - cashGiven)}.`);
        cashInputRef.current?.focus();
        return;
      }
    }

    setErrorMessage("");
    setCheckoutIdempotencyKey(generateUUID());
    setIsPaymentConfirmModalOpen(true);
  };

  // Step 2: Final Checkout Execution
  const executeFinalCheckout = async () => {
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    const currentKey = checkoutIdempotencyKey || generateUUID();
    if (!checkoutIdempotencyKey) {
      setCheckoutIdempotencyKey(currentKey);
    }

    try {
      const res = await processCheckout({
        items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod,
        paidAmount: effectiveCashGiven,
        discountPercent,
        taxPercent: enableTax ? taxPercent : 0,
        notes: customerOrderNote,
        userId: currentUser.id,
        idempotencyKey: currentKey,
      });

      if (!res.success || !res.transaction) {
        setErrorMessage(res.message || "Gagal memproses transaksi.");
        setIsSubmitting(false);
        return;
      }

      soundSuccess();
      setCompletedTransaction(res.transaction as unknown as TransactionSummaryDTO);
      setIsPaymentConfirmModalOpen(false);
      setIsReceiptModalOpen(true);
      setIsMobileCartOpen(false);
      clearCart();
      setCheckoutIdempotencyKey("");
      await loadCatalog();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kendala saat menghubungkan ke database."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputFocused = activeTag === "input" || activeTag === "textarea";

      // F2 or '/'
      if (e.key === "F2" || (e.key === "/" && !isInputFocused)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      // F9
      if (e.key === "F9") {
        e.preventDefault();
        if (cart.length === 0) return;

        if (isPaymentConfirmModalOpen) {
          if (!isSubmitting) executeFinalCheckout();
          return;
        }

        if (paymentMethod === "TUNAI" && (!cashGiven || cashGiven < finalTotal)) {
          setCashGiven(finalTotal);
        }

        handleOpenPaymentConfirm();
        return;
      }

      // Space
      if (e.code === "Space" && !isInputFocused && cart.length > 0) {
        e.preventDefault();
        setCashGiven(finalTotal);
        return;
      }

      // Esc
      if (e.key === "Escape") {
        e.preventDefault();
        if (isPaymentConfirmModalOpen) {
          setIsPaymentConfirmModalOpen(false);
          return;
        }
        if (isMobileCartOpen) {
          setIsMobileCartOpen(false);
          return;
        }
        if (isReceiptModalOpen) {
          setIsReceiptModalOpen(false);
          searchInputRef.current?.focus();
          return;
        }
        if (isHoldModalOpen) {
          setIsHoldModalOpen(false);
          searchInputRef.current?.focus();
          return;
        }
        if (isRecallModalOpen) {
          setIsRecallModalOpen(false);
          searchInputRef.current?.focus();
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          searchInputRef.current?.focus();
          return;
        }
        if (cart.length > 0) {
          if (confirm("Kosongkan keranjang belanja yang sedang aktif?")) {
            clearCart();
            searchInputRef.current?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    cart,
    paymentMethod,
    cashGiven,
    finalTotal,
    isSubmitting,
    isReceiptModalOpen,
    isMobileCartOpen,
    isPaymentConfirmModalOpen,
    isHoldModalOpen,
    isRecallModalOpen,
    isShortcutsModalOpen,
  ]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = searchQuery.trim().toLowerCase();
      if (!query) return;

      const exactMatch = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === query) ||
          p.sku.toLowerCase() === query
      );

      if (exactMatch) {
        addToCart(exactMatch);
        setSearchQuery("");
        return;
      }

      if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        setSearchQuery("");
      }
    }
  };

  // Hold Transaction
  const handleOpenHoldModal = () => {
    if (cart.length === 0) {
      setErrorMessage("Keranjang masih kosong.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    setHoldLabel(customerOrderNote !== "Pelanggan Umum" ? customerOrderNote : "");
    setIsHoldModalOpen(true);
  };

  const handleConfirmHold = (customLabel?: string) => {
    const defaultLabel =
      customerOrderNote !== "Pelanggan Umum"
        ? customerOrderNote
        : `Pesanan #${heldTransactions.length + 1} (${new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })})`;
    const finalLabel = (customLabel || holdLabel).trim() || defaultLabel;

    const newHeld: HeldTransaction = {
      id: "held-" + Date.now(),
      label: finalLabel,
      createdAt: new Date().toISOString(),
      cart: [...cart],
      discountPercent,
      taxPercent,
      enableTax,
      paymentMethod,
      totalAmount: finalTotal,
    };

    const updated = [newHeld, ...heldTransactions];
    setHeldTransactions(updated);
    localStorage.setItem("kasir_held_transactions", JSON.stringify(updated));

    clearCart();
    setIsHoldModalOpen(false);
    setIsMobileCartOpen(false);
    setHoldLabel("");
    searchInputRef.current?.focus();
  };

  // Recall Transaction
  const handleRecallTransaction = (held: HeldTransaction) => {
    if (cart.length > 0) {
      const autoSaveLabel = `Tahan Otomatis (${new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })})`;

      const autoHeld: HeldTransaction = {
        id: "held-" + Date.now(),
        label: autoSaveLabel,
        createdAt: new Date().toISOString(),
        cart: [...cart],
        discountPercent,
        taxPercent,
        enableTax,
        paymentMethod,
        totalAmount: finalTotal,
      };

      const updatedHeld = [autoHeld, ...heldTransactions.filter((h) => h.id !== held.id)];
      setHeldTransactions(updatedHeld);
      localStorage.setItem("kasir_held_transactions", JSON.stringify(updatedHeld));
    } else {
      const updatedHeld = heldTransactions.filter((h) => h.id !== held.id);
      setHeldTransactions(updatedHeld);
      localStorage.setItem("kasir_held_transactions", JSON.stringify(updatedHeld));
    }

    setCart(held.cart);
    setCustomerOrderNote(held.label);
    setDiscountPercent(held.discountPercent);
    setPaymentMethod(held.paymentMethod);
    setTaxPercent(held.taxPercent || 11);
    setEnableTax(!!held.enableTax);

    setIsRecallModalOpen(false);
    searchInputRef.current?.focus();
  };

  const handleDeleteHeld = (id: string) => {
    const updated = heldTransactions.filter((h) => h.id !== id);
    setHeldTransactions(updated);
    localStorage.setItem("kasir_held_transactions", JSON.stringify(updated));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

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

  const cartPanelProps = {
    cart,
    totalCartItems,
    customerOrderNote,
    onCustomerOrderNoteChange: setCustomerOrderNote,
    errorMessage,
    heldOrdersCount: heldTransactions.length,
    onOpenHoldModal: handleOpenHoldModal,
    onOpenRecallModal: () => setIsRecallModalOpen(true),
    onClearCart: clearCart,
    onUpdateQuantity: updateQuantity,
    onUpdateItemNote: updateItemNote,
    onRemoveFromCart: removeFromCart,
    subtotal,
    discountPercent,
    customDiscountRp,
    discountAmount,
    onSetDiscountPercent: (rate: number) => {
      setDiscountPercent(rate);
    },
    enableTax,
    taxPercent,
    taxAmount,
    onToggleTax: () => {
      if (!enableTax) {
        setEnableTax(true);
      } else if (taxPercent === 11) {
        setTaxPercent(10);
      } else {
        setEnableTax(false);
        setTaxPercent(11);
      }
    },
    finalTotal,
    paymentMethod,
    onSelectPaymentMethod: (id: typeof paymentMethod) => {
      setPaymentMethod(id);
      if (id !== "TUNAI") {
        setCashGiven(finalTotal);
      }
    },
    cashGiven,
    effectiveCashGiven,
    onCashGivenChange: setCashGiven,
    changeAmount,
    cashInputRef,
    isPaymentValid,
    isSubmitting,
    cashierName: currentUser?.name || "Kasir",
    onOpenPaymentConfirm: handleOpenPaymentConfirm,
  };

  return (
    <div className="flex flex-col h-screen w-full bg-ground text-text antialiased overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-[52px] bg-surface border-b border-border px-3 sm:px-5 flex items-center justify-between shrink-0 no-print z-10 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="h-8 w-8 rounded-md bg-surface-subtle p-1 flex items-center justify-center shrink-0 border border-border">
            <Image
              src="/KasirKITA.png"
              alt="KasirKITA"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-text truncate max-w-[110px] xs:max-w-[150px] sm:max-w-xs">
                {storeSetting.storeName}
              </h1>
              <Badge variant="success" size="sm" showDefaultIcon className="hidden sm:inline-flex">
                Kasir
              </Badge>
            </div>
            <p className="text-[10px] text-text-muted truncate font-mono">{currentTimeStr}</p>
          </div>
        </div>

        {/* Center: Keyboard Shortcuts Hint */}
        <div className="hidden lg:flex items-center gap-2.5 text-xs bg-surface-subtle border border-border px-3 py-1 rounded-md text-text-muted">
          <span className="flex items-center gap-1 font-medium">
            <kbd className="px-1.5 py-0.2 bg-surface border border-border rounded text-[10px] font-mono font-semibold text-text">
              F2
            </kbd>
            <span className="text-[11px]">Cari</span>
          </span>
          <span className="text-border-strong">&bull;</span>
          <span className="flex items-center gap-1 font-medium">
            <kbd className="px-1.5 py-0.2 bg-surface border border-border rounded text-[10px] font-mono font-semibold text-accent">
              F9
            </kbd>
            <span className="text-[11px]">Bayar</span>
          </span>
          <span className="text-border-strong">&bull;</span>
          <span className="flex items-center gap-1 font-medium">
            <kbd className="px-1.5 py-0.2 bg-surface border border-border rounded text-[10px] font-mono font-semibold text-text-muted">
              Esc
            </kbd>
            <span className="text-[11px]">Reset</span>
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile Cart Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileCartOpen(true)}
            title="Buka Keranjang Belanja"
            className="lg:hidden relative p-1.5 rounded-md border border-border bg-surface text-text hover:bg-surface-subtle transition-colors flex items-center justify-center shrink-0"
          >
            <ShoppingCart className="w-4 h-4 text-text" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-mono">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Held Orders Button */}
          {heldTransactions.length > 0 && (
            <button
              onClick={() => setIsRecallModalOpen(true)}
              title="Daftar Transaksi Tertahan"
              className="relative flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-md border bg-warning-bg border-warning-border text-warning-text hover:bg-warning-border/40 transition-all shrink-0"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tertahan</span>
              <span className="px-1 py-0.2 bg-warning-border text-warning-text rounded font-mono text-[10px] font-bold">
                {heldTransactions.length}
              </span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Suara Beep Aktif" : "Suara Beep Mati"}
            className="p-1.5 rounded-md border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-subtle transition-colors hidden xs:flex items-center justify-center shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-accent" />
            ) : (
              <VolumeX className="w-4 h-4 text-text-faint" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Keluar Layar Penuh" : "Mode Layar Penuh"}
            className="p-1.5 rounded-md border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-subtle transition-colors hidden md:flex items-center justify-center shrink-0"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Shortcuts Help (Desktop only) */}
          <button
            onClick={() => setIsShortcutsModalOpen(true)}
            title="Bantuan Tombol Pintas"
            className="p-1.5 rounded-md border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-subtle transition-colors hidden sm:flex items-center justify-center shrink-0"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Petugas Kasir Aktif Badge */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 bg-surface-subtle border border-border rounded-md shrink-0"
            title={`Akun Kasir: ${currentUser?.name || "Kasir"} (${currentUser?.role || "KARYAWAN"})`}
          >
            <div className="w-5 h-5 rounded-full bg-accent-light text-accent border border-positive-border flex items-center justify-center font-bold text-[10px] shrink-0 select-none">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "K"}
            </div>
            <div className="leading-tight text-left min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] sm:text-xs font-bold text-text truncate max-w-[75px] xs:max-w-[110px] sm:max-w-[140px]">
                  {currentUser?.name || "Kasir"}
                </span>
                <span className="text-[8px] font-mono font-bold text-text-muted bg-surface px-1 py-0.2 rounded border border-border shrink-0 hidden xs:inline">
                  {currentUser?.role === "OWNER" ? "Owner" : currentUser?.role === "ADMIN" ? "Admin" : "Kasir"}
                </span>
              </div>
              <span className="text-[9px] text-accent font-medium hidden sm:flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                Shift Berjaga
              </span>
            </div>
          </div>

          {/* Return to Dashboard */}
          {(currentUser?.role === "OWNER" || currentUser?.role === "ADMIN") && (
            <Link
              href="/dashboard"
              title="Kembali ke Dashboard Owner"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface hover:bg-surface-subtle text-text text-xs font-semibold rounded-md border border-border transition-colors shrink-0"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-text-muted" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Keluar Akun"
            className="text-text-muted hover:text-negative p-1.5 rounded-md border border-border bg-surface hover:bg-surface-subtle transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Split Layout: Catalog (Left) + Cart (Right) */}
      <div className="flex flex-1 overflow-hidden bg-ground no-print">
        {/* Left Column: Catalog */}
        <section className="flex-1 flex flex-col min-w-0 bg-ground lg:border-r border-border">
          {/* Top Search & Filter Bar */}
          <div className="p-3.5 bg-surface border-b border-border space-y-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Cari nama, SKU, atau scan barcode sembako (F2)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-9 pr-24 py-2 bg-surface-subtle border border-border rounded-md text-sm text-text placeholder:text-text-faint focus:outline-hidden focus:border-text focus:ring-1 focus:ring-text transition-colors font-medium"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent-light px-1.5 py-0.5 rounded border border-positive-border">
                    <Barcode className="w-3 h-3" />
                    <span>Scan</span>
                  </span>
                  <kbd className="hidden sm:inline-block text-[10px] font-mono font-semibold bg-surface border border-border text-text-muted px-1.5 py-0.5 rounded">
                    F2
                  </kbd>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-surface-subtle p-0.5 rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Tampilan Grid"
                  className={`p-1.5 rounded-sm transition-colors ${viewMode === "grid"
                      ? "bg-surface text-text shadow-2xs font-bold"
                      : "text-text-muted hover:text-text"
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  title="Tampilan List"
                  className={`p-1.5 rounded-sm transition-colors ${viewMode === "list"
                      ? "bg-surface text-text shadow-2xs font-bold"
                      : "text-text-muted hover:text-text"
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh DB */}
              <button
                type="button"
                onClick={loadCatalog}
                title="Sinkronkan Ulang Katalog"
                className="p-2 bg-surface hover:bg-surface-subtle text-text-muted hover:text-text rounded-md border border-border transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Category Slider Bar */}
            <PosCategorySlider
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categoryCountMap={categoryCountMap}
            />
          </div>

          {/* Product Grid / List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-24 lg:pb-4">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-text-muted">
                <Package className="w-10 h-10 mb-2 stroke-1 text-text-faint" />
                <p className="text-sm font-semibold text-text">Produk Tidak Ditemukan</p>
                <p className="text-xs text-text-muted mt-1 max-w-sm">
                  Tidak ada barang yang cocok dengan kata kunci &quot;{searchQuery}&quot; pada kategori {selectedCategory}.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Semua");
                  }}
                >
                  Tampilkan Semua Produk
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock <= product.minStock && !isOutOfStock;
                  const inCartItem = cart.find((i) => i.id === product.id);

                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className={`group relative flex flex-col justify-between text-left rounded-lg border bg-surface overflow-hidden transition-all duration-150 select-none ${
                        isOutOfStock
                          ? "opacity-50 cursor-not-allowed border-border bg-surface-subtle"
                          : inCartItem
                          ? "border-accent ring-2 ring-accent/30 shadow-xs"
                          : "border-border hover:border-text/30 hover:shadow-sm active:scale-[0.98]"
                      }`}
                    >
                      {/* Top Image Container */}
                      <div className="w-full h-32 sm:h-36 bg-surface-subtle relative overflow-hidden flex items-center justify-center p-2 border-b border-border-subtle/80">
                        <ProductImage
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                          iconClassName="w-8 h-8 text-text-faint"
                        />

                        {/* Badges Overlay */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                          <span className="text-[10px] font-semibold bg-surface/90 text-text px-1.5 py-0.5 rounded border border-border/70 shadow-2xs backdrop-blur-xs truncate max-w-[90px]">
                            {product.category}
                          </span>

                          {isOutOfStock ? (
                            <Badge variant="danger" size="sm">
                              Habis
                            </Badge>
                          ) : isLowStock ? (
                            <Badge variant="warning" size="sm">
                              Sisa {product.stock}
                            </Badge>
                          ) : (
                            <span className="text-[10px] font-mono font-medium text-text-muted bg-surface/90 px-1.5 py-0.5 rounded border border-border/70 shadow-2xs backdrop-blur-xs">
                              {product.stock} {product.unit}
                            </span>
                          )}
                        </div>

                        {/* Cart Quantity Badge Overlay */}
                        {inCartItem && (
                          <div className="absolute bottom-2 right-2 pointer-events-none">
                            <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-bold font-mono flex items-center gap-1 shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>{inCartItem.quantity}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Content Area */}
                      <div className="p-3 flex-1 flex flex-col justify-between w-full">
                        <div>
                          <div className="text-[10px] font-mono text-text-muted truncate mb-0.5">
                            {product.sku}
                          </div>
                          <h3 className="text-xs sm:text-sm font-semibold text-text leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between w-full">
                          <span className="text-xs sm:text-sm font-bold text-text num font-mono">
                            {formatRupiah(product.price)}
                          </span>

                          {!isOutOfStock && !inCartItem && (
                            <span className="w-6 h-6 rounded-md bg-surface-subtle group-hover:bg-primary group-hover:text-primary-foreground text-text-muted flex items-center justify-center transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-surface rounded-md border border-border divide-y divide-border overflow-hidden">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock <= product.minStock && !isOutOfStock;
                  const inCartItem = cart.find((i) => i.id === product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 transition-colors ${
                        isOutOfStock
                          ? "opacity-50 cursor-not-allowed bg-surface-subtle"
                          : inCartItem
                          ? "bg-accent-light/15 hover:bg-accent-light/25 cursor-pointer"
                          : "hover:bg-surface-subtle/70 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-md bg-surface-subtle border border-border overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <ProductImage
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            iconClassName="w-5 h-5 text-text-faint"
                            showFallbackText={false}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-text truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-text-muted mt-0.5">
                            <span className="font-mono">{product.sku}</span>
                            <span>&bull;</span>
                            <span className="bg-surface-subtle px-1 py-0.2 rounded border border-border">
                              {product.category}
                            </span>
                            <span>&bull;</span>
                            {isOutOfStock ? (
                              <Badge variant="danger" size="sm">
                                Habis
                              </Badge>
                            ) : isLowStock ? (
                              <Badge variant="warning" size="sm">
                                Sisa {product.stock}
                              </Badge>
                            ) : (
                              <span>
                                {product.stock} {product.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs sm:text-sm font-bold text-text num font-mono">
                          {formatRupiah(product.price)}
                        </span>
                        {inCartItem ? (
                          <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-bold num font-mono flex items-center gap-1 shadow-2xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>{inCartItem.quantity}</span>
                          </span>
                        ) : (
                          <span className="w-7 h-7 rounded-md bg-surface-subtle border border-border text-text-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Desktop Cart Panel (Sleek & Proportional Width) */}
        <section className="hidden lg:flex w-80 lg:w-[330px] xl:w-[360px] flex-col bg-surface border-l border-border shrink-0 z-10 h-full overflow-hidden">
          <PosCartPanel {...cartPanelProps} isMobile={false} />
        </section>
      </div>

      {/* Mobile Floating Cart Summary Bar */}
      {totalCartItems > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border shadow-lg z-30 flex items-center justify-between gap-3 safe-bottom">
          <button
            type="button"
            onClick={() => setIsMobileCartOpen(true)}
            className="flex items-center gap-2.5 text-left min-w-0 flex-1 hover:opacity-85 transition-opacity"
          >
            <div className="relative p-2 bg-surface-subtle border border-border rounded-md shrink-0">
              <ShoppingCart className="w-5 h-5 text-text" />
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-mono">
                {totalCartItems}
              </span>
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-text-muted block truncate">
                {totalCartItems} item di keranjang
              </span>
              <span className="text-sm font-bold text-text font-mono num tracking-tight">
                {formatRupiah(finalTotal)}
              </span>
            </div>
          </button>

          <Button
            variant="accent"
            size="md"
            onClick={() => setIsMobileCartOpen(true)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="shrink-0 font-bold"
          >
            Lihat Keranjang
          </Button>
        </div>
      )}

      {/* Mobile Cart Bottom Sheet Drawer */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileCartOpen(false)}
          />
          <div className="relative z-10 w-full max-h-[92vh] bg-surface rounded-t-xl border-t border-border flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="flex-1 overflow-y-auto flex flex-col">
              <PosCartPanel
                {...cartPanelProps}
                isMobile={true}
                onCloseMobileDrawer={() => setIsMobileCartOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Konfirmasi Pembayaran */}
      <PosPaymentConfirmModal
        isOpen={isPaymentConfirmModalOpen}
        onClose={() => setIsPaymentConfirmModalOpen(false)}
        finalTotal={finalTotal}
        totalCartItems={totalCartItems}
        paymentMethod={paymentMethod}
        onSelectPaymentMethod={(id) => {
          setPaymentMethod(id);
          if (id !== "TUNAI") setCashGiven(finalTotal);
        }}
        cashGiven={cashGiven}
        onCashGivenChange={setCashGiven}
        changeAmount={changeAmount}
        storeName={storeSetting.storeName}
        cashierName={currentUser?.name || "Kasir"}
        isSubmitting={isSubmitting}
        onConfirmCheckout={executeFinalCheckout}
      />

      {/* Modal 2: Struk Transaksi */}
      <PosReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setCompletedTransaction(null);
          clearCart();
          searchInputRef.current?.focus();
        }}
        completedTransaction={completedTransaction}
        storeSetting={storeSetting}
        cashierName={currentUser?.name}
        enableTax={enableTax}
        taxPercent={taxPercent}
      />

      {/* Modal 3: Tahan Pesanan */}
      <PosHoldModal
        isOpen={isHoldModalOpen}
        onClose={() => {
          setIsHoldModalOpen(false);
          searchInputRef.current?.focus();
        }}
        holdNote={holdLabel}
        onHoldNoteChange={setHoldLabel}
        onConfirmHold={() => handleConfirmHold()}
      />

      {/* Modal 4: Pesanan Tertahan */}
      <PosRecallModal
        isOpen={isRecallModalOpen}
        onClose={() => {
          setIsRecallModalOpen(false);
          searchInputRef.current?.focus();
        }}
        heldTransactions={heldTransactions}
        onRestoreHeld={handleRecallTransaction}
        onDeleteHeld={handleDeleteHeld}
      />

      {/* Modal 5: Pintasan Keyboard */}
      <PosShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => {
          setIsShortcutsModalOpen(false);
          searchInputRef.current?.focus();
        }}
      />
    </div>
  );
}