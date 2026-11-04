export type EmployeeRole = "OWNER" | "ADMIN" | "KARYAWAN";

export interface EmployeeDTO {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  isActive: boolean;
  createdAt: Date;
  transactionCount: number;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  role: EmployeeRole;
  password?: string;
}

export interface UpdateEmployeeInput {
  id: string;
  name?: string;
  email?: string;
  role?: EmployeeRole;
  isActive?: boolean;
}

