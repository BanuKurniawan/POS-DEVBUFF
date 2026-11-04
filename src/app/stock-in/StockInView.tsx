"use client";

import React, { useState, useTransition, useEffect, startTransition } from "react";
import {
  ProductStockSelectDTO,
  StockMovementDTO,
  addStock,
  getStockMovements,
  getProductsForStockSelect,
} from "@/app/actions/stock";
import { SessionUser } from "@/lib/auth";
import { Toast } from "@/components/ui/Toast";
import {
  StockInStats,
  StockInForm,
  StockInHistoryTable,
} from "@/components/stock-in";
import { generateUUID } from "@/utils/uuid";

interface StockInViewProps {
  initialProducts: ProductStockSelectDTO[];
  initialMovements: StockMovementDTO[];
}

export default function StockInView({
  initialProducts,
  initialMovements,
}: StockInViewProps) {
  const [products, setProducts] = useState<ProductStockSelectDTO[]>(initialProducts);
  const [movements, setMovements] = useState<StockMovementDTO[]>(initialMovements);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  useEffect(() => {
    setIdempotencyKey(generateUUID());
  }, []);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [movementFilter, setMovementFilter] = useState<"ALL" | "IN" | "OUT">("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const PAGE_SIZE = 5;

  // Status & Transition
  const [isPending, startFormTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
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
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleQuickAddQty = (val: number) => {
    const current = parseInt(quantity, 10) || 0;
    setQuantity(String(current + val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      showToast("error", "Silakan pilih produk yang akan ditambah stoknya.");
      return;
    }

    const qtyNumber = parseInt(quantity, 10);
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      showToast("error", "Jumlah barang masuk harus lebih dari 0.");
      return;
    }

    const currentKey = idempotencyKey || generateUUID();

    startFormTransition(async () => {
      const res = await addStock({
        productId: selectedProductId,
        quantity: qtyNumber,
        notes: notes.trim() || undefined,
        userId: currentUser?.id || currentUser?.email,
        idempotencyKey: currentKey,
      });

      if (res.success) {
        showToast("success", res.message);
        setQuantity("");
        setNotes("");
        setCurrentPage(1);
        setIdempotencyKey(generateUUID());

        const [updatedProducts, updatedMovements] = await Promise.all([
          getProductsForStockSelect(),
          getStockMovements({ limit: 50 }),
        ]);
        setProducts(updatedProducts);
        setMovements(updatedMovements);
      } else {
        showToast("error", res.message);
      }
    });
  };

  // Filter list riwayat
  const filteredMovements = movements.filter((m) => {
    if (movementFilter !== "ALL" && m.type !== movementFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.productName.toLowerCase().includes(q);
      const matchSku = m.sku.toLowerCase().includes(q);
      const matchNotes = (m.notes || "").toLowerCase().includes(q);
      const matchUser = m.userName.toLowerCase().includes(q);
      return matchName || matchSku || matchNotes || matchUser;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredMovements.length / PAGE_SIZE) || 1;
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalIn = movements.filter((m) => m.type === "IN").reduce((acc, m) => acc + m.quantity, 0);
  const totalOut = movements.filter((m) => m.type === "OUT").reduce((acc, m) => acc + m.quantity, 0);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-md border border-border">
        <div>
          <h2 className="text-base font-bold text-text tracking-tight">
            Pencatatan Stok Masuk (Restock Sembako)
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Catat barang yang masuk dari distributor/supplier untuk menambah jumlah stok fisik toko.
          </p>
        </div>

        {currentUser && (
          <div className="text-xs bg-surface-subtle px-3 py-1.5 rounded-md border border-border text-text-muted">
            Petugas: <span className="font-semibold text-text">{currentUser.name}</span>
          </div>
        )}
      </div>

      {/* Stat Bar */}
      <StockInStats
        totalIn={totalIn}
        totalOut={totalOut}
        totalCount={movements.length}
      />

      {/* 2-Column Work Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <StockInForm
          products={products}
          selectedProductId={selectedProductId}
          onSelectProduct={setSelectedProductId}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onQuickAddQty={handleQuickAddQty}
          notes={notes}
          onNotesChange={setNotes}
          onSubmit={handleSubmit}
          isPending={isPending}
        />

        <StockInHistoryTable
          movements={paginatedMovements}
          totalMovementsCount={filteredMovements.length}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          movementFilter={movementFilter}
          onMovementFilterChange={(f) => {
            setMovementFilter(f);
            setCurrentPage(1);
          }}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
