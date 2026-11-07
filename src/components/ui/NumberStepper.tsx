"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";

export interface NumberStepperProps {
  label?: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
  required = false,
  hint,
  error,
  disabled = false,
  className = "",
  id,
}) => {
  const stepperId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    const next = value - step;
    if (min !== undefined && next < min) {
      onChange(min);
    } else {
      onChange(next);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    const next = value + step;
    if (max !== undefined && next > max) {
      onChange(max);
    } else {
      onChange(next);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(min);
      return;
    }
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      if (min !== undefined && parsed < min) {
        onChange(min);
      } else if (max !== undefined && parsed > max) {
        onChange(max);
      } else {
        onChange(parsed);
      }
    }
  };

  const isMinReached = min !== undefined && value <= min;
  const isMaxReached = max !== undefined && value >= max;

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={stepperId}
          className="block text-xs font-semibold text-text tracking-tight"
        >
          {label} {required && <span className="text-negative">*</span>}
        </label>
      )}

      <div
        className={`flex items-center rounded-md border bg-surface overflow-hidden h-9 transition-colors focus-within:border-text focus-within:ring-1 focus-within:ring-text ${
          error
            ? "border-negative focus-within:border-negative focus-within:ring-negative"
            : "border-border hover:border-border-strong"
        } ${disabled ? "opacity-60 bg-surface-subtle cursor-not-allowed" : ""}`}
      >
        {/* Tombol Kurang (-) */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || isMinReached}
          className="w-9 h-full flex items-center justify-center bg-surface-subtle hover:bg-surface border-r border-border text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95 shrink-0 select-none cursor-pointer"
          title="Kurangi nilai"
          aria-label="Kurangi nilai"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Input Angka Tengah (Bisa Diketik Langsung & Bebas Spinner) */}
        <div className="flex-1 flex items-center justify-center px-2 min-w-0">
          <input
            id={stepperId}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full text-center font-mono font-bold text-sm bg-transparent text-text focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
          />
          {unit && (
            <span className="text-xs text-text-muted font-medium ml-1 shrink-0 select-none">
              {unit}
            </span>
          )}
        </div>

        {/* Tombol Tambah (+) */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || isMaxReached}
          className="w-9 h-full flex items-center justify-center bg-surface-subtle hover:bg-surface border-l border-border text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95 shrink-0 select-none cursor-pointer"
          title="Tambah nilai"
          aria-label="Tambah nilai"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
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
};
