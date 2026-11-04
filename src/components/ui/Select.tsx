import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, children, id, className = "", ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-text tracking-tight"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none bg-surface text-text border transition-colors text-sm rounded-md h-9 pl-3 pr-9 focus:outline-hidden focus:border-text focus:ring-1 focus:ring-text disabled:bg-surface-subtle disabled:opacity-60 disabled:cursor-not-allowed ${
              error
                ? "border-negative focus:border-negative focus:ring-negative"
                : "border-border hover:border-border-strong"
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 pointer-events-none shrink-0" />
        </div>
        {error ? (
          <p className="text-xs text-negative font-medium mt-1">{error}</p>
        ) : hint ? (
          <p className="text-xs text-text-muted mt-1">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

