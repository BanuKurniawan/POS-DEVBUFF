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
    <div className="bg-surface rounded-md border border-border overflow-hidden">
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
  );
};
