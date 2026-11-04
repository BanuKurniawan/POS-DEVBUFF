"use client";

import React, { useState, useTransition } from "react";
import { Download } from "lucide-react";
import {
  TransactionDTO,
  TransactionSummaryDTO,
  getTransactions,
} from "@/app/actions/transactions";
import { Button } from "@/components/ui/Button";
import {
  TransactionFinancialKpi,
  TransactionFilterToolbar,
  TransactionTable,
  FilterPeriodType,
} from "@/components/transactions";

interface TransactionsViewProps {
  initialTransactions: TransactionDTO[];
  initialSummary: TransactionSummaryDTO;
}

export default function TransactionsView({
  initialTransactions,
  initialSummary,
}: TransactionsViewProps) {
  const [transactions, setTransactions] = useState<TransactionDTO[]>(initialTransactions);
  const [summary, setSummary] = useState<TransactionSummaryDTO>(initialSummary);
  const [filterType, setFilterType] = useState<FilterPeriodType>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const PAGE_SIZE = 5;

  const handleFilterChange = (type: FilterPeriodType) => {
    setFilterType(type);
    setCurrentPage(1);
    if (type !== "custom") {
      startTransition(async () => {
        const res = await getTransactions({ filterType: type });
        setTransactions(res.transactions);
        setSummary(res.summary);
      });
    }
  };

  const handleApplyCustomDate = () => {
    if (!startDate || !endDate) return;
    setCurrentPage(1);
    startTransition(async () => {
      const res = await getTransactions({
        filterType: "custom",
        startDate,
        endDate,
      });
      setTransactions(res.transactions);
      setSummary(res.summary);
    });
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    let exportUrl = `/api/transactions/export?filterType=${filterType}`;
    if (filterType === "custom" && startDate && endDate) {
      exportUrl += `&startDate=${startDate}&endDate=${endDate}`;
    }

    const link = document.createElement("a");
    link.href = exportUrl;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
    }, 1500);
  };

  const filteredList = transactions.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.invoiceNumber.toLowerCase().includes(q) ||
      t.cashierName.toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE) || 1;
  const paginatedTransactions = filteredList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-md border border-border">
        <div>
          <h2 className="text-base font-bold text-text tracking-tight">
            Riwayat Penjualan Kasir
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Laporan lengkap seluruh struk transaksi kasir, omset, dan laba kotor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            isLoading={isExporting}
            disabled={isExporting || transactions.length === 0}
            leftIcon={<Download className="w-3.5 h-3.5 text-text-muted" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Financial KPI */}
      <TransactionFinancialKpi summary={summary} />

      {/* Filter Toolbar */}
      <TransactionFilterToolbar
        filterType={filterType}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onApplyCustomDate={handleApplyCustomDate}
        isPending={isPending}
      />

      {/* Main Transactions Table */}
      <TransactionTable
        transactions={paginatedTransactions}
        totalItems={filteredList.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isPending={isPending}
      />
    </div>
  );
}
