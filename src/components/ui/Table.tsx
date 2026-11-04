import React from "react";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

export function Table({ children, className = "", containerClassName = "", ...props }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto border border-border rounded-md bg-surface ${containerClassName}`}>
      <table className={`w-full text-left text-sm border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`border-b border-border bg-surface-subtle text-xs text-text-muted font-medium select-none sticky top-0 z-1 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-border ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`hover:bg-surface-subtle/70 transition-colors h-11 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  alignRight?: boolean;
}

export function TableHead({
  children,
  alignRight = false,
  className = "",
  ...props
}: TableHeadProps) {
  return (
    <th
      className={`px-3 py-2.5 text-xs font-semibold text-text-muted tracking-tight ${
        alignRight ? "text-right" : "text-left"
      } ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  alignRight?: boolean;
  numeric?: boolean;
}

export function TableCell({
  children,
  alignRight = false,
  numeric = false,
  className = "",
  ...props
}: TableCellProps) {
  return (
    <td
      className={`px-3 py-2.5 text-sm text-text ${
        alignRight || numeric ? "text-right" : "text-left"
      } ${numeric ? "num font-mono" : ""} ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

