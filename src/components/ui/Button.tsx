import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "secondary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-2 focus-visible:outline-text focus-visible:outline-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]";

    const sizeStyles = {
      sm: "h-8 px-2.5 text-xs rounded-sm gap-1.5",
      md: "h-9 px-3.5 text-sm rounded-md gap-2",
      lg: "h-11 px-5 text-sm sm:text-base rounded-md gap-2.5 min-h-[44px]",
    };

    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs border border-transparent",
      accent:
        "bg-accent text-accent-foreground hover:bg-accent-hover shadow-xs border border-transparent font-semibold",
      secondary:
        "bg-surface text-text hover:bg-surface-subtle border border-border hover:border-border-strong shadow-xs",
      ghost:
        "text-text-muted hover:text-text hover:bg-surface-subtle border border-transparent",
      danger:
        "bg-negative-bg text-negative hover:bg-negative-border border border-negative-border font-medium",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

