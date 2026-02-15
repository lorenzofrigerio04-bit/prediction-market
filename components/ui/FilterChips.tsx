"use client";

export interface FilterChipOption<T = string> {
  id: T;
  label: string;
}

interface FilterChipsProps<T extends string> {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Optional label above the row (e.g. "Stato", "Ordina per") */
  label?: string;
  className?: string;
}

export default function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  className = "",
}: FilterChipsProps<T>) {
  return (
    <div className={className}>
      {label && (
        <p className="text-ds-caption font-semibold text-fg-muted uppercase tracking-wider mb-2">
          {label}
        </p>
      )}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin md:flex-wrap md:overflow-visible">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-2xl font-semibold text-ds-body-sm transition-all duration-ds-normal ease-ds-ease focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ds-tap-target ${
                isSelected
                  ? "chip-neon-selected"
                  : "glass text-fg-muted border border-border dark:border-white/10 hover:border-primary/25 hover:shadow-[0_0_12px_-4px_rgba(var(--primary-glow),0.15)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
