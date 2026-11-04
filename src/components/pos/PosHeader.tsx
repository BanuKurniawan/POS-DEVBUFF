import React from "react";
import Image from "next/image";
import {
  Search,
  X,
  Volume2,
  VolumeX,
  FolderArchive,
  HelpCircle,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SessionUser } from "@/lib/auth";
import { PosCategorySlider } from "./PosCategorySlider";

interface PosHeaderProps {
  storeName: string;
  logoUrl?: string;
  currentUser?: SessionUser;
  currentTimeStr: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  heldOrdersCount: number;
  onOpenRecallModal: () => void;
  onOpenShortcutsModal: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categoryCountMap: Record<string, number>;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  storeName,
  logoUrl,
  currentUser,
  currentTimeStr,
  soundEnabled,
  onToggleSound,
  heldOrdersCount,
  onOpenRecallModal,
  onOpenShortcutsModal,
  searchQuery,
  onSearchChange,
  searchInputRef,
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCountMap,
}) => {
  return (
    <div className="bg-surface border-b border-border p-3.5 space-y-3 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand & User Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-surface-subtle border border-border flex items-center justify-center p-1 shrink-0 overflow-hidden">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={storeName}
                width={36}
                height={36}
                className="w-full h-full object-contain"
                unoptimized
              />
            ) : (
              <Image
                src="/KasirKITA.png"
                alt="KasirKITA"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                unoptimized
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-text uppercase tracking-tight">
                {storeName}
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-surface-subtle text-text border border-border flex items-center gap-1 font-mono">
                <User className="w-2.5 h-2.5 text-text-muted" />
                {currentUser?.name || "Kasir"}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-text-muted truncate flex items-center gap-1">
              <Clock className="w-3 h-3 text-text-muted inline" />
              <span>{currentTimeStr}</span>
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {heldOrdersCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenRecallModal}
              leftIcon={<FolderArchive className="w-3.5 h-3.5 text-warning" />}
            >
              <span>Tertahan</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-warning-bg text-warning-text font-bold">
                {heldOrdersCount}
              </span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSound}
            title={soundEnabled ? "Nonaktifkan Efek Suara" : "Aktifkan Efek Suara"}
            leftIcon={
              soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-text" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-text-muted" />
              )
            }
          >
            <span className="hidden md:inline">{soundEnabled ? "Suara Aktif" : "Bisu"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenShortcutsModal}
            title="Panduan Tombol Shortcut Kasir (F1 - F9)"
            leftIcon={<HelpCircle className="w-3.5 h-3.5 text-text-muted" />}
          >
            <span className="hidden md:inline">Shortcut</span>
          </Button>
        </div>
      </div>

      {/* Barcode Scanner & Search Input Field */}
      <div className="relative">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Scan barcode scanner atau ketik nama sembako / SKU (Tekan F2 atau /)..."
          className="w-full pl-9 pr-20 py-2 bg-surface-subtle border border-border rounded-md text-xs text-text placeholder:text-text-muted focus:bg-surface focus:border-text focus:outline-hidden transition-all shadow-2xs font-mono"
        />
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                searchInputRef.current?.focus();
              }}
              className="p-1 rounded text-text-muted hover:text-text hover:bg-surface"
              title="Bersihkan Pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="hidden sm:inline-flex text-[10px] text-text-muted border border-border bg-surface px-1.5 py-0.5 rounded font-mono font-semibold">
            F2
          </span>
        </div>
      </div>

      {/* Category Slider Bar */}
      <PosCategorySlider
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        categoryCountMap={categoryCountMap}
      />
    </div>
  );
};

