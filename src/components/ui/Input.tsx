import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  tabular?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      rightElement,
      tabular = false,
      id,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text tracking-tight"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-text-muted pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-surface text-text placeholder:text-text-faint border transition-colors text-sm rounded-md h-9 px-3 focus:outline-hidden focus:border-text focus:ring-1 focus:ring-text disabled:bg-surface-subtle disabled:opacity-60 disabled:cursor-not-allowed ${
              leftIcon ? "pl-9" : ""
            } ${rightIcon || rightElement ? "pr-9" : ""} ${
              error
                ? "border-negative focus:border-negative focus:ring-negative"
                : "border-border hover:border-border-strong"
            } ${tabular ? "num font-mono" : ""} ${className}`}
            {...props}
          />
          {rightIcon && !rightElement && (
            <div className="absolute right-3 text-text-muted pointer-events-none shrink-0">
              {rightIcon}
            </div>
          )}
          {rightElement && (
            <div className="absolute right-2 flex items-center">{rightElement}</div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-negative flex items-center gap-1 font-medium mt-1">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-text-muted mt-1">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

