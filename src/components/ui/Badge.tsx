import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  showDefaultIcon?: boolean;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  icon,
  showDefaultIcon = false,
  className = "",
  ...props
}: BadgeProps) {
  const variantStyles = {
    success: "bg-positive-bg text-positive-text border-positive-border",
    warning: "bg-warning-bg text-warning-text border-warning-border",
    danger: "bg-negative-bg text-negative-text border-negative-border",
    info: "bg-info-bg text-info-text border-info-border",
    neutral: "bg-surface-subtle text-text-muted border-border",
  };

  const defaultIcons = {
    success: <CheckCircle2 className="w-3 h-3 text-positive shrink-0" />,
    warning: <AlertTriangle className="w-3 h-3 text-warning shrink-0" />,
    danger: <XCircle className="w-3 h-3 text-negative shrink-0" />,
    info: <Info className="w-3 h-3 text-info shrink-0" />,
    neutral: null,
  };

  const sizeStyles = {
    sm: "text-[11px] px-1.5 py-0.5 rounded-sm gap-1",
    md: "text-xs px-2 py-0.5 rounded-sm gap-1.5 font-medium",
  };

  const iconElement = icon || (showDefaultIcon ? defaultIcons[variant] : null);

  return (
    <span
      className={`inline-flex items-center border select-none tracking-tight leading-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {iconElement}
      <span>{children}</span>
    </span>
  );
}

