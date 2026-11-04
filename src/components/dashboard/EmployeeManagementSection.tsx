"use client";

import React, { useState } from "react";
import { Users, UserPlus } from "lucide-react";
import {
  EmployeeDTO,
  createEmployee,
  toggleEmployeeStatus,
  deleteEmployee,
} from "@/app/actions/employees";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { EmployeeTable, EmployeeFormModal } from "@/components/employees";

interface EmployeeManagementSectionProps {
  initialEmployees: EmployeeDTO[];
}

export default function EmployeeManagementSection({
  initialEmployees,
}: EmployeeManagementSectionProps) {
  const [employees, setEmployees] = useState<EmployeeDTO[]>(initialEmployees);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "KARYAWAN" as "KARYAWAN" | "ADMIN",
  });
  const [formError, setFormError] = useState<string>("");

  const handleOpenModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "KARYAWAN",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await createEmployee(formData);
      if (res.success && res.employee) {
        setEmployees((prev) => [...prev, res.employee!]);
        setIsModalOpen(false);
        setNotification({
          type: "success",
          message: res.message,
        });
        setTimeout(() => setNotification(null), 4000);
      } else {
        setFormError(res.message);
      }
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menambahkan karyawan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (employee: EmployeeDTO) => {
    if (employee.role === "OWNER") return;

    setActionLoadingId(employee.id);
    try {
      const res = await toggleEmployeeStatus(employee.id);
      if (res.success) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === employee.id
              ? { ...emp, isActive: res.newStatus ?? !emp.isActive }
              : emp
          )
        );
        setNotification({
          type: "success",
          message: res.message,
        });
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification({ type: "error", message: res.message });
      }
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal mengubah status akun.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteEmployee = async (employee: EmployeeDTO) => {
    if (employee.role === "OWNER") return;

    if (
      !confirm(
        `Yakin ingin menghapus akun karyawan "${employee.name}" (${employee.email})? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    setActionLoadingId(employee.id);
    try {
      const res = await deleteEmployee(employee.id);
      if (res.success) {
        setEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
        setNotification({
          type: "success",
          message: res.message,
        });
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification({ type: "error", message: res.message });
      }
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal menghapus karyawan.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-md border border-border">
        <div>
          <h2 className="text-sm font-bold text-text flex items-center gap-1.5">
            <Users className="w-4 h-4 text-text-muted" />
            <span>Daftar Karyawan & Kasir Toko</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Kelola hak akses kasir, status aktif, dan akun login staf sembako.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenModal}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Tambah Kasir / Karyawan
        </Button>
      </div>

      {/* Employee Table */}
      <EmployeeTable
        employees={employees}
        actionLoadingId={actionLoadingId}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteEmployee}
      />

      {/* Modal Tambah Karyawan */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        onFormDataChange={setFormData}
        formError={formError}
        isSubmitting={isSubmitting}
        onSubmit={handleCreateEmployee}
      />
    </div>
  );
}
