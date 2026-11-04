import React from "react";
import { Store, MapPin, Phone, Receipt, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StoreSettingDTO } from "@/types";

interface StoreProfileFormProps {
  formData: StoreSettingDTO;
  onChange: (data: StoreSettingDTO) => void;
  onSubmit: (e: React.FormEvent) => void;
  isOwner: boolean;
  isSaving: boolean;
}

export const StoreProfileForm: React.FC<StoreProfileFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isOwner,
  isSaving,
}) => {
  return (
    <div className="bg-surface rounded-md border border-border p-4 space-y-3">
      <div className="pb-2 border-b border-border">
        <h2 className="text-sm font-bold text-text">Profil & Catatan Struk</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Informasi ini tercetak otomatis di header & footer struk pembelian sembako.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          label="Nama Toko"
          required
          disabled={!isOwner || isSaving}
          value={formData.storeName}
          onChange={(e) => onChange({ ...formData, storeName: e.target.value })}
          placeholder="Contoh: Toko Sembako Berkah"
          leftIcon={<Store className="w-4 h-4" />}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text tracking-tight">
            Alamat Lengkap Toko
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-text-muted absolute left-3 top-2.5 pointer-events-none" />
            <textarea
              rows={2}
              disabled={!isOwner || isSaving}
              value={formData.address || ""}
              onChange={(e) => onChange({ ...formData, address: e.target.value })}
              placeholder="Jl. Merdeka No. 12, Pasar Induk..."
              className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-md text-xs text-text focus:border-text focus:outline-hidden disabled:bg-surface-subtle"
            />
          </div>
        </div>

        <Input
          label="Nomor Telepon / WhatsApp"
          disabled={!isOwner || isSaving}
          value={formData.phoneNumber || ""}
          onChange={(e) => onChange({ ...formData, phoneNumber: e.target.value })}
          placeholder="0812-3456-7890"
          leftIcon={<Phone className="w-4 h-4" />}
          tabular
        />

        <Input
          label="Pesan Kaki Struk (Footer)"
          disabled={!isOwner || isSaving}
          value={formData.receiptFooter || ""}
          onChange={(e) => onChange({ ...formData, receiptFooter: e.target.value })}
          placeholder="Terima kasih atas kunjungan Anda!"
          leftIcon={<Receipt className="w-4 h-4" />}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!isOwner || isSaving}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
};

