"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

type Category = "bug" | "idea" | "question" | "other";

const CATEGORIES: {
  id: Category;
  label: string;
  emoji: string;
  color: string;
  hoverBg: string;
}[] = [
  {
    id: "bug",
    label: "Bug",
    emoji: "🐛",
    color: "rgb(248 113 113)",
    hoverBg: "rgba(248,113,113,0.12)",
  },
  {
    id: "idea",
    label: "Idea",
    emoji: "💡",
    color: "rgb(255 184 77)",
    hoverBg: "rgba(255,184,77,0.12)",
  },
  {
    id: "question",
    label: "Domanda",
    emoji: "🤔",
    color: "rgb(80 245 252)",
    hoverBg: "rgba(80,245,252,0.12)",
  },
  {
    id: "other",
    label: "Altro",
    emoji: "✨",
    color: "rgb(167 139 250)",
    hoverBg: "rgba(167,139,250,0.12)",
  },
];

export default function FeedbackWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [category, setCategory] = useState<Category>("bug");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  /* Hide widget on admin pages */
  const isAdmin = pathname?.startsWith("/admin");

  /* Animated open: mount first, then trigger CSS transition */
  const open = useCallback(() => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      setTimeout(() => {
        setSubmitted(false);
        setMessage("");
        setError(null);
      }, 100);
    }, 280);
  }, []);

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  /* Lock body scroll */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* Focus textarea on open */
  useEffect(() => {
    if (isVisible && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          page: pathname,
        }),
      });

      if (!res.ok) throw new Error();
      setSubmitted(true);
      setTimeout(close, 2200);
    } catch {
      setError("Qualcosa è andato storto. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) return null;;

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        onClick={open}
        aria-label="Invia feedback"
        aria-haspopup="dialog"
        className="feedback-fab fixed right-4 z-[89] focus-visible:outline-none"
        style={{ bottom: "calc(var(--bottom-nav-total, 70px) + 0.75rem)" }}
      >
        <span className="feedback-fab-q">?</span>
      </button>

      {/* ── Backdrop + Dialog ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Modulo feedback"
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          {/* Blurred backdrop */}
          <div
            className="feedback-backdrop absolute inset-0 transition-opacity duration-300"
            style={{ opacity: isVisible ? 1 : 0 }}
            onClick={close}
          />

          {/* Card */}
          <div
            ref={dialogRef}
            className="feedback-card relative w-full max-w-md transition-all duration-300"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "scale(1) translateY(0)" : "scale(0.94) translateY(16px)",
            }}
          >
            {/* Outer glow ring */}
            <div className="feedback-glow-ring pointer-events-none absolute -inset-px rounded-[22px]" />

            {/* Glass card */}
            <div className="feedback-glass relative overflow-hidden rounded-[20px]">
              {submitted ? (
                <SuccessView />
              ) : (
                <>
                  {/* Header */}
                  <div className="px-6 pt-6 pb-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="feedback-eyebrow mb-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                          Hai riscontrato un problema?
                        </p>
                        <h2 className="font-display text-xl font-bold leading-tight text-white">
                          Faccelo sapere :)
                        </h2>
                      </div>
                      <button
                        onClick={close}
                        aria-label="Chiudi"
                        className="feedback-close-btn mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                    {/* Category pills */}
                    <div>
                      <p className="mb-2.5 text-[11px] font-medium uppercase tracking-widest feedback-label">
                        Tipo
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {CATEGORIES.map((cat) => {
                          const active = category === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setCategory(cat.id)}
                              className="feedback-category-pill flex flex-col items-center gap-1.5 rounded-xl py-3 px-1 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                              style={{
                                background: active ? cat.hoverBg : "rgba(255,255,255,0.04)",
                                border: `1.5px solid ${active ? cat.color : "rgba(255,255,255,0.08)"}`,
                                boxShadow: active
                                  ? `0 0 16px ${cat.color}30, inset 0 0 12px ${cat.color}10`
                                  : "none",
                              }}
                            >
                              <span className="text-xl leading-none">{cat.emoji}</span>
                              <span
                                className="text-[10px] font-semibold leading-none"
                                style={{ color: active ? cat.color : "rgba(255,255,255,0.5)" }}
                              >
                                {cat.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="feedback-message"
                        className="mb-2 block text-[11px] font-medium uppercase tracking-widest feedback-label"
                      >
                        Descrizione
                      </label>
                      <div className="feedback-textarea-wrap relative rounded-xl overflow-hidden">
                        <textarea
                          id="feedback-message"
                          ref={textareaRef}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={getPlaceholder(category)}
                          rows={4}
                          required
                          className="feedback-textarea w-full resize-none px-4 py-3.5 text-sm leading-relaxed placeholder:text-white/25 text-white/90 focus:outline-none bg-transparent"
                        />
                        {/* Char count */}
                        <div className="absolute bottom-2.5 right-3 text-[10px] text-white/20 tabular-nums select-none">
                          {message.length}
                        </div>
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                        {error}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || !message.trim()}
                      className="feedback-submit-btn relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <LoadingDots />
                            <span>Invio in corso…</span>
                          </>
                        ) : (
                          <>
                            <SparkIcon className="h-4 w-4" />
                            <span>Invia feedback</span>
                          </>
                        )}
                      </span>
                    </button>

                    <div className="feedback-anon flex items-center justify-center gap-1.5">
                      <ShieldIcon className="h-3 w-3 shrink-0" />
                      <p className="text-[10px] tracking-wide">
                        Le segnalazioni sono anonime
                      </p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{WIDGET_STYLES}</style>
    </>
  );
}

/* ── Success view ── */
function SuccessView() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-14 text-center gap-5">
      <div className="feedback-success-ring relative flex h-20 w-20 items-center justify-center rounded-full">
        <CheckIcon className="h-9 w-9 text-[rgb(var(--accent-primary))]" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold text-white">Grazie mille!</h3>
        <p className="text-sm text-white/50 leading-relaxed max-w-xs">
          Il tuo feedback è stato ricevuto e verrà analizzato al più presto.
        </p>
      </div>
    </div>
  );
}

/* ── Loading dots ── */
function LoadingDots() {
  return (
    <span className="flex gap-0.5 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1 rounded-full bg-current opacity-60 feedback-loading-dot"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}

/* ── Helper ── */
function getPlaceholder(cat: Category) {
  switch (cat) {
    case "bug":
      return "Descrivi il problema che hai riscontrato e come riprodurlo…";
    case "idea":
      return "Condividi la tua idea, ci piace ascoltarti…";
    case "question":
      return "Scrivi la tua domanda…";
    default:
      return "Scrivi qui il tuo messaggio…";
  }
}

/* ── SVG Icons ── */
function SparkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M13 2L4.09 12.96A1 1 0 0 0 5 14.5h6.5l-1.5 7.5 8.91-10.96A1 1 0 0 0 18 9.5h-6.5L13 2Z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* ── Scoped styles (avoids polluting globals.css) ── */
const WIDGET_STYLES = `
  /* ─ FAB button — cerchio premium stile header-auth-btn--primary ─ */
  .feedback-fab {
    overflow: hidden;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: radial-gradient(
      ellipse 100% 100% at 50% 50%,
      rgba(2, 32, 38, 0.88) 0%,
      rgba(2, 32, 38, 0.70) 28%,
      rgba(33, 185, 180, 0.22) 62%,
      rgba(33, 185, 180, 0.46) 100%
    );
    border: 1px solid rgba(33, 185, 180, 0.90);
    cursor: pointer;
    box-shadow:
      0 0 18px -4px rgba(33, 185, 180, 0.55),
      0 0 6px -1px rgba(33, 185, 180, 0.30) inset,
      inset 0 1px 0 rgba(255,255,255,0.12);
    transition:
      box-shadow 240ms cubic-bezier(0.4,0,0.2,1),
      background 200ms ease,
      border-color 200ms ease,
      transform 200ms cubic-bezier(0.34,1.4,0.64,1);
    touch-action: manipulation;
  }
  .feedback-fab::after {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: 50%;
    border: 1px solid rgba(33, 185, 180, 0.18);
    pointer-events: none;
  }
  .feedback-fab:hover {
    background: radial-gradient(
      ellipse 100% 100% at 50% 50%,
      rgba(2, 32, 38, 0.75) 0%,
      rgba(2, 32, 38, 0.55) 25%,
      rgba(33, 185, 180, 0.30) 58%,
      rgba(33, 185, 180, 0.60) 100%
    );
    border-color: rgba(33, 185, 180, 1);
    transform: translateY(-1px) scale(1.06);
    box-shadow:
      0 0 28px -3px rgba(33, 185, 180, 0.75),
      0 4px 16px -5px rgba(0,0,0,0.60),
      0 0 10px -1px rgba(33, 185, 180, 0.40) inset,
      inset 0 1px 0 rgba(255,255,255,0.16);
  }
  .feedback-fab:active {
    transform: scale(0.93) !important;
    transition-duration: 75ms !important;
  }
  .feedback-fab:focus-visible {
    box-shadow:
      0 0 0 3px rgba(33, 185, 180, 0.50),
      0 0 18px -4px rgba(33, 185, 180, 0.55);
  }

  /* ─ "?" inside the circle ─ */
  .feedback-fab-q {
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
    color: rgba(33, 185, 180, 1);
    text-shadow: 0 0 10px rgba(33, 185, 180, 0.7);
    letter-spacing: 0;
    position: relative;
    z-index: 1;
  }

  /* ─ Blurred backdrop — sfondo visibile ma sfocato ─ */
  .feedback-backdrop {
    background: rgba(0, 4, 16, 0.38);
    backdrop-filter: blur(10px) saturate(0.8);
    -webkit-backdrop-filter: blur(10px) saturate(0.8);
  }

  /* ─ Outer glow ring ─ */
  .feedback-glow-ring {
    background: linear-gradient(
      135deg,
      rgba(33, 185, 180, 0.40),
      rgba(80, 245, 252, 0.15),
      transparent 60%
    );
    border-radius: 22px;
    filter: blur(1px);
  }

  /* ─ Glass card ─ */
  .feedback-glass {
    background:
      linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%),
      rgba(3, 7, 18, 0.97);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(40px) saturate(1.4);
    -webkit-backdrop-filter: blur(40px) saturate(1.4);
    box-shadow:
      0 0 0 1px rgba(33, 185, 180, 0.07) inset,
      0 0 1px 0 rgba(33, 185, 180, 0.12) inset,
      0 40px 100px -20px rgba(0,0,0,0.9),
      0 12px 40px -8px rgba(0,0,0,0.7);
  }

  /* ─ Eyebrow label ─ */
  .feedback-eyebrow {
    color: rgb(var(--accent-primary));
    letter-spacing: 0.12em;
  }

  /* ─ Section labels ─ */
  .feedback-label {
    color: rgba(255,255,255,0.35);
  }

  /* ─ Close button ─ */
  .feedback-close-btn {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.45);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .feedback-close-btn:hover {
    background: rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.75);
  }

  /* ─ Textarea wrapper ─ */
  .feedback-textarea-wrap {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .feedback-textarea-wrap:focus-within {
    border-color: rgba(33, 185, 180, 0.45);
    box-shadow: 0 0 0 3px rgba(33, 185, 180, 0.08);
  }

  .feedback-textarea {
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  }

  /* ─ Submit button — stile identico a header-auth-btn--primary ─ */
  .feedback-submit-btn {
    overflow: hidden;
    background: radial-gradient(
      ellipse 100% 100% at 50% 50%,
      rgba(2, 32, 38, 0.88) 0%,
      rgba(2, 32, 38, 0.70) 28%,
      rgba(33, 185, 180, 0.22) 62%,
      rgba(33, 185, 180, 0.46) 100%
    );
    border: 1px solid rgba(33, 185, 180, 0.90);
    color: #fff;
    font-weight: 600;
    letter-spacing: 0.025em;
    box-shadow:
      0 0 18px -4px rgba(33, 185, 180, 0.55),
      0 0 6px -1px rgba(33, 185, 180, 0.30) inset,
      inset 0 1px 0 rgba(255,255,255,0.12);
    transition:
      box-shadow 240ms cubic-bezier(0.4,0,0.2,1),
      background 200ms ease,
      border-color 200ms ease,
      transform 200ms cubic-bezier(0.34,1.4,0.64,1);
  }
  .feedback-submit-btn::after {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: calc(0.75rem - 1px);
    border: 1px solid rgba(33, 185, 180, 0.18);
    pointer-events: none;
  }
  .feedback-submit-btn:not(:disabled):hover {
    background: radial-gradient(
      ellipse 100% 100% at 50% 50%,
      rgba(2, 32, 38, 0.75) 0%,
      rgba(2, 32, 38, 0.55) 25%,
      rgba(33, 185, 180, 0.30) 58%,
      rgba(33, 185, 180, 0.60) 100%
    );
    border-color: rgba(33, 185, 180, 1);
    transform: translateY(-1px) scale(1.01);
    box-shadow:
      0 0 28px -3px rgba(33, 185, 180, 0.75),
      0 4px 16px -5px rgba(0,0,0,0.60),
      0 0 10px -1px rgba(33, 185, 180, 0.40) inset,
      inset 0 1px 0 rgba(255,255,255,0.16);
  }
  .feedback-submit-btn:not(:disabled):active {
    transform: scale(0.98) !important;
    transition-duration: 75ms !important;
  }
  .feedback-submit-btn:focus-visible {
    box-shadow:
      0 0 0 3px rgba(33, 185, 180, 0.50),
      0 0 18px -4px rgba(33, 185, 180, 0.55);
  }

  /* ─ Success ring ─ */
  .feedback-success-ring {
    background: rgba(80, 245, 252, 0.08);
    border: 1.5px solid rgba(80, 245, 252, 0.3);
    box-shadow:
      0 0 32px rgba(80, 245, 252, 0.2),
      0 0 64px rgba(80, 245, 252, 0.1);
    animation: feedback-success-pulse 2s ease-in-out infinite;
  }

  /* ─ Loading dot ─ */
  .feedback-loading-dot {
    animation: feedback-bounce 1.2s ease-in-out infinite;
  }

  /* ─ Anon row ─ */
  .feedback-anon {
    color: rgba(255,255,255,0.22);
    letter-spacing: 0.04em;
  }

  /* ─ Keyframes ─ */
  @keyframes feedback-success-pulse {
    0%, 100% {
      box-shadow: 0 0 24px rgba(80, 245, 252, 0.2), 0 0 48px rgba(80, 245, 252, 0.1);
    }
    50% {
      box-shadow: 0 0 40px rgba(80, 245, 252, 0.4), 0 0 80px rgba(80, 245, 252, 0.15);
    }
  }

  @keyframes feedback-bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
    40%           { transform: scale(1);   opacity: 1;   }
  }
`;
