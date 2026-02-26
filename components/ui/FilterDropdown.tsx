"use client";

import { useState, useRef, useEffect } from "react";

export interface FilterDropdownOption<T = string> {
  id: T;
  label: string;
}

interface FilterDropdownProps<T extends string> {
  label: string;
  options: FilterDropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Chiamato quando si apre questo dropdown (per chiudere gli altri) */
  onOpen?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export default function FilterDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  onOpen,
  open: controlledOpen,
  onOpenChange,
  className = "",
}: FilterDropdownProps<T>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectedLabel = options.find((o) => o.id === value)?.label ?? value;

  return (
    <div ref={ref} className={`relative shrink-0 ${className}`}>
      <div className="flex flex-col items-center">
        <span className="text-ds-caption font-semibold text-fg-muted uppercase tracking-wider mb-1.5 text-center w-full">
          {label}
        </span>
        <button
          type="button"
          onClick={() => {
            onOpen?.();
            setOpen(!open);
          }}
          className="flex items-center justify-between gap-2 min-h-[44px] w-full sm:min-w-[140px] px-3 sm:px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-white/5 backdrop-blur-sm text-fg text-left text-sm sm:text-ds-body-sm font-medium hover:bg-white/60 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg transition-colors"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`${label}: ${selectedLabel}`}
        >
          <span className="truncate">{selectedLabel}</span>
          <svg
            className={`w-4 h-4 shrink-0 text-fg-muted transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 py-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/85 dark:bg-black/60 backdrop-blur-md shadow-lg max-h-[min(280px,70vh)] overflow-y-auto"
          role="listbox"
          aria-label={`Opzioni ${label}`}
        >
          {options.map((opt) => {
            const isSelected = value === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`w-full px-3 sm:px-4 py-2.5 text-left text-sm sm:text-ds-body-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-primary/15 text-primary"
                    : "text-fg hover:bg-white/10 dark:hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
