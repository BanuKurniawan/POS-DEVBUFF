import React from "react";
import Link from "next/link";
import { Store, ArrowRight } from "lucide-react";
import { StoreSettingDTO } from "@/types";

interface DashboardStoreInfoProps {
  storeSetting: StoreSettingDTO;
}

export const DashboardStoreInfo: React.FC<DashboardStoreInfoProps> = ({ storeSetting }) => {
  return (
    <div className="bg-surface border border-border rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-text-muted" />
          <h2 className="text-xs font-bold text-text uppercase tracking-tight">
            Identitas Toko
          </h2>
        </div>
        <Link
          href="/settings"
          className="text-xs font-semibold text-text hover:underline flex items-center gap-1"
        >
          <span>Ubah</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-1.5 text-xs">
        <p className="font-bold text-text text-sm uppercase">{storeSetting.storeName}</p>
        {storeSetting.address && (
          <p className="text-text-muted leading-relaxed">{storeSetting.address}</p>
        )}
        {storeSetting.phoneNumber && (
          <p className="text-text-muted font-mono num">Telp/WA: {storeSetting.phoneNumber}</p>
        )}
      </div>
    </div>
  );
};

