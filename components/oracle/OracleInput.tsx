"use client";

import { useState, useRef, useEffect } from "react";

interface OracleInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showDisclaimer?: boolean;
}

export default function OracleInput({
  onSend,
  disabled = false,
  placeholder = "Fai una domanda",
  showDisclaimer = true,
}: OracleInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [value]);

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-30 flex flex-col items-center px-4 pt-2 pb-[calc(5rem+var(--safe-area-inset-bottom,0px))] md:pb-[calc(1rem+var(--safe-area-inset-bottom,0px))] bg-gradient-to-t from-[#171717] via-[#171717]/98 to-transparent"
    >
      {showDisclaimer && (
        <p className="mb-2 text-[11px] text-gray-500 text-center max-w-3xl transition-opacity duration-200">
          Oracle potrebbe commettere errori. Le previsioni non costituiscono consulenza.
        </p>
      )}
      <div className="w-full max-w-3xl flex gap-2 items-end">
        <div className="flex-1 flex gap-2 items-end min-w-0 rounded-2xl bg-[#2f2f2f] border border-white/10 focus-within:border-white/20 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 min-h-[44px] max-h-[160px] px-4 py-3 bg-transparent text-white placeholder:text-gray-400 focus:outline-none resize-none text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Messaggio per Oracle Assistant"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="shrink-0 min-w-[40px] min-h-[40px] mb-1.5 mr-1.5 flex items-center justify-center rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            aria-label="Invia"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
