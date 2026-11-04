"use client";

import React, { useState, useEffect, startTransition } from "react";
import AppShell from "@/components/AppShell";
import { getStoreSetting, updateStoreSetting } from "@/app/actions/settings";
import { getEmployees } from "@/app/actions/employees";
import { StoreSettingDTO, EmployeeDTO } from "@/types";
import { Store, Users } from "lucide-react";
import { DEMO_ACCOUNTS, SessionUser } from "@/lib/auth";
import { Toast } from "@/components/ui/Toast";
import EmployeeManagementSection from "@/components/dashboard/EmployeeManagementSection";
import {
  StoreLogoUploader,
  StoreProfileForm,
  StoreReceiptPreview,
} from "@/components/settings";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<SessionUser>(DEMO_ACCOUNTS[0]);
  const [activeTab, setActiveTab] = useState<"store" | "employees">("store");
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [formData, setFormData] = useState<StoreSettingDTO>({
    id: "default",
    storeName: "Toko Sembako Berkah",
    address: "Jl. Gatot Subroto No. 42, Jakarta",
    phoneNumber: "0812-3456-7890",
    logoUrl: "",
    receiptFooter: "Terima kasih atas kunjungan Anda!",
  });

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
    } else {
      localStorage.setItem("kasir_session", JSON.stringify(DEMO_ACCOUNTS[0]));
    }

    const loadData = async () => {
      try {
        const [settingData, employeeList] = await Promise.all([
          getStoreSetting(),
          getEmployees(),
        ]);
        startTransition(() => {
          setFormData(settingData);
          setLogoPreview(settingData.logoUrl || "");
          setEmployees(employeeList);
        });
      } catch (e) {
        console.error(e);
      } finally {
        startTransition(() => {
          setIsLoading(false);
        });
      }
    };
    loadData();
  }, []);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const validExtensions = ["png", "jpg", "jpeg", "webp", "gif", "svg"];
    const isValidFormat = file.type.startsWith("image/") || validExtensions.includes(ext);

    if (!isValidFormat) {
      setStatusMessage({
        type: "error",
        text: "Format file tidak didukung. Gunakan PNG, JPG, JPEG, WebP, GIF, atau SVG.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({
        type: "error",
        text: "Ukuran file terlalu besar. Maksimum ukuran logo adalah 5 MB.",
      });
      return;
    }

    setIsUploadingLogo(true);
    setStatusMessage(null);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/upload-logo", {
        method: "POST",
        body: uploadData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mengunggah logo.");
      }

      setLogoPreview(json.url);
      setFormData((prev) => ({ ...prev, logoUrl: json.url }));

      await updateStoreSetting({
        storeName: formData.storeName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        receiptFooter: formData.receiptFooter,
        logoUrl: json.url,
      });

      window.dispatchEvent(
        new CustomEvent("store_settings_updated", {
          detail: { logoUrl: json.url },
        })
      );

      setStatusMessage({
        type: "success",
        text: "Logo toko berhasil diperbarui.",
      });
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kesalahan upload logo.",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm("Hapus logo toko?")) return;
    setIsUploadingLogo(true);
    try {
      setLogoPreview("");
      setFormData((prev) => ({ ...prev, logoUrl: "" }));

      await updateStoreSetting({
        storeName: formData.storeName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        receiptFooter: formData.receiptFooter,
        logoUrl: "",
      });

      window.dispatchEvent(
        new CustomEvent("store_settings_updated", {
          detail: { logoUrl: "" },
        })
      );

      setStatusMessage({
        type: "success",
        text: "Logo toko berhasil dihapus.",
      });
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus logo.",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== "OWNER") {
      setStatusMessage({
        type: "error",
        text: "Hanya akun Owner yang memiliki akses mengubah identitas toko.",
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await updateStoreSetting({
        storeName: formData.storeName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        receiptFooter: formData.receiptFooter,
        logoUrl: formData.logoUrl,
      });

      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Pengaturan profil toko & format struk berhasil disimpan.",
        });
        window.dispatchEvent(
          new CustomEvent("store_settings_updated", {
            detail: { storeName: formData.storeName, logoUrl: formData.logoUrl },
          })
        );
      } else {
        setStatusMessage({
          type: "error",
          text: res.message || "Gagal menyimpan pengaturan.",
        });
      }
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kendala saat menghubungi database.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isOwner = currentUser.role === "OWNER";

  return (
    <AppShell pageTitle="Pengaturan Toko & Kasir">
      <div className="space-y-4 max-w-7xl mx-auto">
        {statusMessage && (
          <Toast
            type={statusMessage.type}
            message={statusMessage.text}
            onClose={() => setStatusMessage(null)}
          />
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-surface rounded-t-md px-4 pt-2 gap-4">
          <button
            onClick={() => setActiveTab("store")}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "store"
                ? "border-text text-text font-bold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Profil Toko & Struk</span>
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "employees"
                ? "border-text text-text font-bold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kelola Karyawan</span>
            {employees.length > 0 && (
              <span className="text-[10px] bg-surface-subtle border border-border px-1.5 py-0.2 rounded-full font-mono text-text-muted font-bold">
                {employees.length}
              </span>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="bg-surface rounded-md border border-border p-8 text-center text-xs text-text-muted">
            Memuat data pengaturan...
          </div>
        ) : activeTab === "store" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Kolom Kiri: Form Identitas & Logo */}
            <div className="lg:col-span-7 space-y-4">
              <StoreLogoUploader
                logoPreview={logoPreview}
                isOwner={isOwner}
                isUploading={isUploadingLogo}
                onFileChange={handleLogoFileChange}
                onRemoveLogo={handleRemoveLogo}
              />

              <StoreProfileForm
                formData={formData}
                onChange={setFormData}
                onSubmit={handleSubmit}
                isOwner={isOwner}
                isSaving={isSaving}
              />
            </div>

            {/* Kolom Kanan: Live Preview Struk Thermal */}
            <StoreReceiptPreview
              storeSetting={formData}
              logoPreview={logoPreview}
              cashierName={currentUser?.name}
            />
          </div>
        ) : (
          /* Tab 2: Kelola Karyawan */
          <EmployeeManagementSection initialEmployees={employees} />
        )}
      </div>
    </AppShell>
  );
}
