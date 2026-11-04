import React from "react";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`border border-dashed border-border rounded-md p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-surface/50 ${className}`}
    >
      {icon && (
        <div className="w-10 h-10 rounded-md bg-surface-subtle border border-border flex items-center justify-center text-text-muted mb-3 shrink-0">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-text tracking-tight">{title}</h3>
      <p className="text-xs text-text-muted max-w-sm mt-1 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

