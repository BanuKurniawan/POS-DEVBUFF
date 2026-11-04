import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "underline" | "segmented";
  className?: string;
}

export function Tabs({
  items,
  activeId,
  onChange,
  variant = "underline",
  className = "",
}: TabsProps) {
  if (variant === "segmented") {
    return (
      <div
        role="tablist"
        className={`inline-flex items-center p-1 bg-surface-subtle border border-border rounded-md gap-1 ${className}`}
      >
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm transition-all select-none ${
                isActive
                  ? "bg-surface text-text shadow-xs"
                  : "text-text-muted hover:text-text hover:bg-surface/50"
              } ${tab.disabled ? "opacity-50 pointer-events-none" : ""}`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                    isActive ? "bg-surface-subtle text-text" : "bg-border text-text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={`flex items-center border-b border-border overflow-x-auto gap-6 ${className}`}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px whitespace-nowrap select-none ${
              isActive
                ? "border-text text-text font-semibold"
                : "border-transparent text-text-muted hover:text-text hover:border-border-strong"
            } ${tab.disabled ? "opacity-50 pointer-events-none" : ""}`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-sm font-mono ${
                  isActive ? "bg-surface-subtle text-text" : "bg-surface-subtle text-text-muted"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

