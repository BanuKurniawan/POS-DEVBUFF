import React from "react";
import { User, Mail, Lock } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    name: string;
    email: string;
    password: string;
    role: "KARYAWAN" | "ADMIN";
  };
  onFormDataChange: (data: {
    name: string;
    email: string;
    password: string;
    role: "KARYAWAN" | "ADMIN";
  }) => void;
  formError: string;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  formData,
  onFormDataChange,
  formError,
  isSubmitting,
  onSubmit,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Kasir / Karyawan Baru"
      description="Buat akun staf kasir baru untuk mengoperasikan mesin kasir POS."
      maxWidth="md"
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSubmit}
            isLoading={isSubmitting}
          >
            Simpan Karyawan
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        {formError && (
          <div className="p-2.5 rounded-md bg-negative-bg border border-negative-border text-xs text-negative">
            {formError}
          </div>
        )}

        <Input
          label="Nama Lengkap"
          required
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          placeholder="Contoh: Sinta Pertiwi"
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Email / Username Login"
          type="email"
          required
          value={formData.email}
          onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
          placeholder="sinta@toko.com"
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Kata Sandi / PIN Awal"
          type="password"
          required
          value={formData.password}
          onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
          placeholder="Minimal 6 karakter"
          leftIcon={<Lock className="w-4 h-4" />}
          hint="Digunakan staf untuk login ke sistem POS kasir."
        />

        <Select
          label="Peran Akses (Role)"
          value={formData.role}
          onChange={(e) =>
            onFormDataChange({
              ...formData,
              role: e.target.value as "KARYAWAN" | "ADMIN",
            })
          }
        >
          <option value="KARYAWAN">Kasir (Hanya Akses POS & Transaksi)</option>
          <option value="ADMIN">Admin (Akses POS, Stok, dan Riwayat Transaksi)</option>
        </Select>
      </form>
    </Dialog>
  );
};

