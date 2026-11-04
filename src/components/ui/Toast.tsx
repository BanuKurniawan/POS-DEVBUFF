import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

export interface ToastProps {
  type: "success" | "error" | "warning";
  message: string;
  onClose?: () => void;
  actionText?: string;
  onAction?: () => void;
}

export function Toast({ type, message, onClose, actionText, onAction }: ToastProps) {
  const styles = {
    success: {
      container: "bg-surface border-positive-border text-text",
      icon: <CheckCircle2 className="w-4 h-4 text-positive shrink-0" />,
    },
    warning: {
      container: "bg-surface border-warning-border text-text",
      icon: <AlertTriangle className="w-4 h-4 text-warning shrink-0" />,
    },
    error: {
      container: "bg-surface border-negative-border text-text",
      icon: <XCircle className="w-4 h-4 text-negative shrink-0" />,
    },
  };

  const { container, icon } = styles[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 max-w-sm w-full p-3.5 bg-surface border rounded-md shadow-lg flex items-center justify-between gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-150 ${container}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon}
        <p className="text-xs sm:text-sm font-medium text-text leading-snug truncate">
          {message}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="text-xs font-bold text-accent hover:underline focus:outline-hidden"
          >
            {actionText}
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Tutup notifikasi"
            className="text-text-muted hover:text-text p-1 rounded-sm transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

