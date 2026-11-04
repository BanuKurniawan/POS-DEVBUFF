import React from "react";
import { User, Trash2, Power } from "lucide-react";
import { EmployeeDTO } from "@/types";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

interface EmployeeTableProps {
  employees: EmployeeDTO[];
  actionLoadingId: string | null;
  onToggleStatus: (employee: EmployeeDTO) => void;
  onDelete: (employee: EmployeeDTO) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  actionLoadingId,
  onToggleStatus,
  onDelete,
}) => {
  return (
    <>
      {/* Mobile Card List (sm:hidden) */}
      <div className="sm:hidden space-y-2.5">
        {employees.map((emp) => {
          const isOwner = emp.role === "OWNER";
          const isLoading = actionLoadingId === emp.id;

          return (
            <div
              key={emp.id}
              className="bg-surface border border-border rounded-md p-3.5 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface-subtle border border-border flex items-center justify-center text-text-muted font-bold text-xs shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text text-xs leading-tight truncate">
                      {emp.name}
                    </p>
                    <p className="font-mono text-[11px] text-text-muted truncate mt-0.5">
                      {emp.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  {emp.role === "OWNER" ? (
                    <Badge variant="info" size="sm">
                      Owner
                    </Badge>
                  ) : emp.role === "ADMIN" ? (
                    <Badge variant="neutral" size="sm">
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Kasir
                    </Badge>
                  )}

                  {emp.isActive ? (
                    <Badge variant="success" size="sm">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="danger" size="sm">
                      Nonaktif
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-surface-subtle rounded border border-border">
                <span className="text-[11px] text-text-muted">Total Melayani Kasir</span>
                <span className="font-bold text-text font-mono num text-xs">
                  {emp.transactionCount} struk
                </span>
              </div>

              {!isOwner && (
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(emp)}
                    disabled={isLoading}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                      emp.isActive
                        ? "bg-surface hover:bg-warning-bg text-text-muted hover:text-warning border-border hover:border-warning/30"
                        : "bg-surface hover:bg-positive-bg text-positive border-border hover:border-positive/30"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{emp.isActive ? "Nonaktifkan" : "Aktifkan"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(emp)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-surface hover:bg-negative-bg text-negative border border-border hover:border-negative/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table (hidden sm:block) */}
      <div className="hidden sm:block bg-surface rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Karyawan</TableHead>
              <TableHead>Email / Akun</TableHead>
              <TableHead>Peran (Role)</TableHead>
              <TableHead>Status Akun</TableHead>
              <TableHead alignRight>Transaksi Kasir</TableHead>
              <TableHead alignRight className="w-28">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => {
              const isOwner = emp.role === "OWNER";
              const isLoading = actionLoadingId === emp.id;

              return (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-subtle border border-border flex items-center justify-center text-text-muted font-bold text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-text text-xs">{emp.name}</p>
                        {isOwner && (
                          <span className="text-[10px] text-accent font-medium">Pemilik Toko</span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-text-muted">
                    {emp.email}
                  </TableCell>

                  <TableCell>
                    {emp.role === "OWNER" ? (
                      <Badge variant="info" size="sm">
                        Owner
                      </Badge>
                    ) : emp.role === "ADMIN" ? (
                      <Badge variant="neutral" size="sm">
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Kasir
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    {emp.isActive ? (
                      <Badge variant="success" size="sm" showDefaultIcon>
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm" showDefaultIcon>
                        Nonaktif
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell numeric className="font-mono num text-xs">
                    {emp.transactionCount} struk
                  </TableCell>

                  <TableCell alignRight>
                    {!isOwner ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(emp)}
                          disabled={isLoading}
                          className={`p-1.5 rounded-sm transition-colors ${
                            emp.isActive
                              ? "text-positive hover:bg-positive-bg"
                              : "text-text-muted hover:bg-surface-subtle"
                          }`}
                          title={emp.isActive ? "Nonaktifkan akun" : "Aktifkan akun"}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(emp)}
                          disabled={isLoading}
                          className="p-1.5 text-text-muted hover:text-negative hover:bg-negative-bg rounded-sm transition-colors"
                          title="Hapus akun karyawan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-text-muted italic pr-2">Permanen</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
