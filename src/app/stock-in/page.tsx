import React from "react";
import AppShell from "@/components/AppShell";
import StockInView from "./StockInView";
import { getProductsForStockSelect, getStockMovements } from "@/app/actions/stock";

export const dynamic = "force-dynamic";

export default async function StockInPage() {
  const [products, movements] = await Promise.all([
    getProductsForStockSelect(),
    getStockMovements({ limit: 50 }),
  ]);

  return (
    <AppShell pageTitle="Stok Barang Masuk">
      <StockInView initialProducts={products} initialMovements={movements} />
    </AppShell>
  );
}

