import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getDashboardStats } from "@/app/actions/dashboard";
import { getStoreSetting } from "@/app/actions/settings";
import { Store, PackagePlus } from "lucide-react";
import {
  DashboardMetrics,
  DashboardRevenueChart,
  DashboardRecentTransactions,
  DashboardLowStockAlert,
  DashboardStoreInfo,
} from "@/components/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, storeSetting] = await Promise.all([
    getDashboardStats(),
    getStoreSetting(),
  ]);

  const avgBasket =
    stats.todayTransactions > 0
      ? Math.round(stats.todaySales / stats.todayTransactions)
      : 0;

  return (
    <AppShell pageTitle="Ringkasan Toko">
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Canvas Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-md border border-border">
          <div>
            <h1 className="text-base font-bold text-text tracking-tight">
              Ringkasan Toko Sembako
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Pantau arus penjualan hari ini, estimasi laba, dan peringatan stok barang.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/stock-in"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surface-subtle text-text text-xs font-semibold rounded-md border border-border transition-colors"
            >
              <PackagePlus className="w-3.5 h-3.5 text-text-muted" />
              <span>Stok Masuk</span>
            </Link>

            <Link
              href="/pos"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-accent-foreground text-xs font-bold rounded-md shadow-xs transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Buka Kasir</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-black/20 text-white rounded text-[10px] font-mono">
                F2
              </kbd>
            </Link>
          </div>
        </div>

        {/* 4 Financial KPI Cards */}
        <DashboardMetrics
          todaySales={stats.todaySales}
          todayTransactions={stats.todayTransactions}
          estimatedProfit={stats.estimatedProfit}
          avgBasket={avgBasket}
        />

        {/* Primary Chart & Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (7 Cols): SVG Chart & Recent Transactions */}
          <div className="lg:col-span-7 space-y-5">
            <DashboardRevenueChart weeklyData={stats.weeklySales || []} />
            <DashboardRecentTransactions transactions={stats.recentTransactions} />
          </div>

          {/* Right Column (5 Cols): Low Stock Alerts & Store Info */}
          <div className="lg:col-span-5 space-y-5">
            <DashboardLowStockAlert products={stats.lowStockProducts} />
            <DashboardStoreInfo storeSetting={storeSetting} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
