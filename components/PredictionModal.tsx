"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IconCurrency } from "@/components/ui/Icons";
import ModalQuoteTimer, { MODAL_QUOTE_TIMER_DURATION } from "@/components/events/ModalQuoteTimer";

interface PredictionModalProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  /** Called after successful buy; receives selected outcome key. */
  onSuccess?: (outcome: string) => void;
  userCredits?: number;
  /** Pre-select SÌ or NO when opening from event page SI/NO boxes */
  initialOutcome?: string | null;
  /** Per partite (es. calcio): etichette al posto di SÌ/NO (es. { YES: "Inter", NO: "Juventus" }) */
  outcomeLabels?: { YES: string; NO: string };
  /** For multi-outcome markets: explicit option list. */
  outcomeOptions?: Array<{ key: string; label: string }>;
  /** Mercato binario: probabilità SÌ (0–100), come `event.probability` in pagina. */
  binaryYesProbabilityPct?: number | null;
  /** Mercato multi: percentuali per chiave outcome (come `event.outcomeProbabilities`). */
  outcomeProbabilityPctByKey?: Partial<Record<string, number>>;
}

function formatPct(value: number) {
  return `${Number(value).toFixed(1)}%`;
}

/** Allineato a SellConfirmModal: etichette Kalshi chiare. */
const formLabelClass =
  "font-kalshi text-lg sm:text-xl md:text-[1.45rem] font-semibold text-white/88 leading-[1.12] tracking-[0.02em] shrink-0 pt-0.5";

const creditsInputClass =
  "w-full min-h-[48px] rounded-xl border-0 bg-transparent py-2 px-3 text-fg text-xl sm:text-2xl font-kalshi font-bold leading-tight text-center outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-[box-shadow] duration-200 ease-out focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary/40 disabled:opacity-50 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export default function PredictionModal({
  eventId,
  eventTitle,
  isOpen,
  onClose,
  onSuccess,
  userCredits = 0,
  initialOutcome = null,
  outcomeLabels,
  outcomeOptions,
  binaryYesProbabilityPct,
  outcomeProbabilityPctByKey,
}: PredictionModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [creditsInput, setCreditsInput] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteSecondsLeft, setQuoteSecondsLeft] = useState(MODAL_QUOTE_TIMER_DURATION);

  const handleClose = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedOutcome(null);
      setCreditsInput("10");
      setError(null);
    } else {
      setSelectedOutcome(initialOutcome ?? null);
    }
  }, [isOpen, initialOutcome]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen || loading) return;
    setQuoteSecondsLeft(MODAL_QUOTE_TIMER_DURATION);
    const id = window.setInterval(() => {
      setQuoteSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isOpen, loading]);

  useEffect(() => {
    if (!isOpen || loading || quoteSecondsLeft !== 0) return;
    handleClose();
  }, [isOpen, loading, quoteSecondsLeft, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (!selectedOutcome) {
      setError(outcomeLabels ? "Seleziona un'opzione" : "Seleziona SÌ o NO");
      return;
    }

    if (credits < 1) {
      setError("Almeno 1 credito");
      return;
    }

    if (credits > userCredits) {
      setError("Crediti insufficienti");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          outcome: selectedOutcome,
          credits,
          idempotencyKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore nella previsione");
      }

      if (onSuccess) onSuccess(selectedOutcome);
      onClose();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const parsedCredits = Number.parseInt(creditsInput, 10);
  const credits = Number.isFinite(parsedCredits) ? parsedCredits : 0;

  const options = outcomeOptions?.length
    ? outcomeOptions
    : [
        { key: "YES", label: outcomeLabels?.YES ?? "SÌ" },
        { key: "NO", label: outcomeLabels?.NO ?? "NO" },
      ];

  const choiceSectionLabel =
    options.length > 2 ? "Scegli:" : outcomeLabels ? "Prevedi su:" : "Prevedi:";

  const isMultiLayout = Boolean(outcomeOptions && outcomeOptions.length > 0);
  const yesOpt = options.find((o) => o.key === "YES");
  const noOpt = options.find((o) => o.key === "NO");
  const canRenderBinaryProb = !isMultiLayout && options.length === 2 && Boolean(yesOpt && noOpt);

  const yesPct =
    typeof binaryYesProbabilityPct === "number" ? binaryYesProbabilityPct : 50;
  const noPct = 100 - yesPct;
  const yesIsLeading = yesPct >= noPct;

  return (
    <div
      className="scrim-below-app-header z-[60] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-admin-bg/80 backdrop-blur-md transition-opacity duration-200"
      style={{ paddingBottom: "var(--safe-area-inset-bottom)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prediction-modal-title"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[min(90dvh,820px)] flex flex-col rounded-2xl sm:rounded-3xl border border-white/[0.12] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.55)] overflow-hidden transition-transform duration-200 ease-out"
        style={{ background: "rgb(var(--admin-bg))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-7 sm:pt-7 sm:pb-4">
          <h2
            id="prediction-modal-title"
            className="font-kalshi text-[1.55rem] sm:text-[1.85rem] md:text-[2rem] lg:text-[2.1rem] font-bold text-fg leading-[1.1] tracking-[0.01em] min-w-0 flex-1 pr-2 max-w-full"
          >
            {eventTitle}
          </h2>
          <div className="shrink-0 pt-0.5">
            <ModalQuoteTimer secondsLeft={quoteSecondsLeft} variant="sell" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 sm:px-7 sm:py-5 space-y-4">
            <div className="rounded-xl sm:rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-5 space-y-5">
              <div className="flex flex-col gap-3 w-full min-w-0">
                <span className={`${formLabelClass} block w-full text-center`}>{choiceSectionLabel}</span>

                {isMultiLayout ? (
                  <div
                    className={`grid gap-3 w-full ${options.length <= 3 ? "grid-cols-1" : "grid-cols-2"}`}
                  >
                    {(() => {
                      const accents = ["45,212,191", "80,165,252", "168,130,255", "248,163,72", "248,113,113", "130,220,100"];
                      const pctValues = options.map((o) => outcomeProbabilityPctByKey?.[o.key] ?? 0);
                      const maxPct = Math.max(...pctValues);
                      return options.map((opt, idx) => {
                        const optPct = outcomeProbabilityPctByKey?.[opt.key];
                        const selected = selectedOutcome === opt.key;
                        const dimmed = selectedOutcome !== null && !selected;
                        const accent = accents[idx % accents.length];
                        const isLeading = typeof optPct === "number" && optPct >= maxPct && maxPct > 0;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setSelectedOutcome(opt.key)}
                            disabled={loading}
                            className="w-full min-h-[68px] py-3.5 px-4 rounded-2xl transition-all duration-200 ease-out disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--admin-bg))] active:scale-[0.97] flex flex-col items-center justify-center gap-2"
                            style={{
                              background: selected
                                ? `linear-gradient(135deg, rgba(${accent},0.18) 0%, rgba(${accent},0.05) 100%)`
                                : dimmed
                                  ? "rgba(0,0,0,0.15)"
                                  : isLeading
                                    ? `linear-gradient(135deg, rgba(${accent},0.12) 0%, rgba(${accent},0.03) 100%)`
                                    : `linear-gradient(135deg, rgba(${accent},0.07) 0%, rgba(${accent},0.02) 100%)`,
                              border: selected
                                ? `1.5px solid rgba(${accent},0.55)`
                                : dimmed
                                  ? "1.5px solid rgba(255,255,255,0.04)"
                                  : isLeading
                                    ? `1.5px solid rgba(${accent},0.4)`
                                    : `1.5px solid rgba(${accent},0.15)`,
                              boxShadow: selected
                                ? `0 0 32px -8px rgba(${accent},0.3), inset 0 1px 0 rgba(255,255,255,0.08)`
                                : "inset 0 1px 0 rgba(255,255,255,0.05)",
                              opacity: dimmed ? 0.38 : 1,
                              transform: selected ? "scale(1.02)" : dimmed ? "scale(0.98)" : "scale(1)",
                            }}
                          >
                            <span
                              className="text-sm leading-tight font-semibold line-clamp-2 max-w-full text-center"
                              style={{ color: dimmed ? "rgba(169,180,208,0.5)" : "var(--fg)" }}
                            >
                              {opt.label}
                            </span>
                            {typeof optPct === "number" && (
                              <span
                                className="text-lg sm:text-xl font-extrabold font-chubby tabular-nums"
                                style={{ color: dimmed ? "rgba(169,180,208,0.35)" : `rgb(${accent})` }}
                              >
                                {formatPct(optPct)}
                              </span>
                            )}
                          </button>
                        );
                      });
                    })()}
                  </div>
                ) : canRenderBinaryProb && yesOpt && noOpt ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {(["YES", "NO"] as const).map((side) => {
                      const isYes = side === "YES";
                      const selected = selectedOutcome === side;
                      const dimmed = selectedOutcome !== null && !selected;
                      const pct = isYes ? yesPct : noPct;
                      const label = isYes ? yesOpt.label : noOpt.label;
                      const isLeading = isYes ? yesIsLeading : !yesIsLeading;
                      const accent = isYes ? "45,212,191" : "248,113,113";
                      return (
                        <button
                          key={side}
                          type="button"
                          onClick={() => setSelectedOutcome(side)}
                          disabled={loading}
                          className="min-h-[68px] py-3.5 px-3 rounded-2xl font-semibold text-base flex flex-col items-center justify-center gap-2 transition-all duration-200 ease-out disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--admin-bg))] active:scale-[0.97]"
                          style={{
                            background: selected
                              ? `linear-gradient(135deg, rgba(${accent},0.18) 0%, rgba(${accent},0.06) 100%)`
                              : dimmed
                                ? "rgba(0,0,0,0.15)"
                                : isLeading
                                  ? `linear-gradient(135deg, rgba(${accent},0.1) 0%, rgba(${accent},0.03) 100%)`
                                  : `linear-gradient(135deg, rgba(${accent},0.06) 0%, rgba(${accent},0.02) 100%)`,
                            border: selected
                              ? `1.5px solid rgba(${accent},0.55)`
                              : dimmed
                                ? "1.5px solid rgba(255,255,255,0.04)"
                                : isLeading
                                  ? `1.5px solid rgba(${accent},0.35)`
                                  : `1.5px solid rgba(${accent},0.15)`,
                            boxShadow: selected
                              ? `0 0 32px -8px rgba(${accent},0.3), inset 0 1px 0 rgba(255,255,255,0.08)`
                              : "inset 0 1px 0 rgba(255,255,255,0.05)",
                            opacity: dimmed ? 0.38 : 1,
                            transform: selected ? "scale(1.02)" : dimmed ? "scale(0.98)" : "scale(1)",
                          }}
                        >
                          <span
                            className="line-clamp-2 max-w-full text-center text-sm leading-tight"
                            style={{ color: dimmed ? "rgba(169,180,208,0.6)" : "var(--fg)" }}
                          >
                            {label}
                          </span>
                          <span
                            className="text-lg sm:text-xl font-extrabold font-chubby tabular-nums"
                            style={{
                              color: `rgb(${accent})`,
                              opacity: dimmed ? 0.45 : 1,
                            }}
                          >
                            {formatPct(pct)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {options.map((opt, idx) => {
                      const selected = selectedOutcome === opt.key;
                      const dimmed = selectedOutcome !== null && !selected;
                      const accent = idx === 0 ? "45,212,191" : "248,113,113";
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setSelectedOutcome(opt.key)}
                          disabled={loading}
                          className="min-h-[56px] px-3 rounded-2xl font-kalshi text-base font-bold transition-all duration-200 ease-out disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--admin-bg))] active:scale-[0.97]"
                          style={{
                            background: selected
                              ? `linear-gradient(135deg, rgba(${accent},0.14) 0%, rgba(${accent},0.04) 100%)`
                              : dimmed
                                ? "rgba(0,0,0,0.15)"
                                : `linear-gradient(135deg, rgba(${accent},0.06) 0%, rgba(${accent},0.02) 100%)`,
                            border: selected
                              ? `1.5px solid rgba(${accent},0.5)`
                              : dimmed
                                ? "1.5px solid rgba(255,255,255,0.04)"
                                : `1.5px solid rgba(${accent},0.15)`,
                            boxShadow: selected
                              ? `0 0 28px -6px rgba(${accent},0.25), inset 0 1px 0 rgba(255,255,255,0.08)`
                              : "inset 0 1px 0 rgba(255,255,255,0.04)",
                            opacity: dimmed ? 0.38 : 1,
                            color: "var(--fg)",
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-3 w-full min-w-0">
                <label htmlFor="prediction-credits" className={`${formLabelClass} text-center w-full`}>
                  Quanto vuoi prevedere?
                </label>
                <div className="flex w-full max-w-[min(100%,16rem)] mx-auto flex-col items-stretch gap-1">
                  <input
                    id="prediction-credits"
                    type="number"
                    min={1}
                    max={userCredits}
                    value={creditsInput}
                    onChange={(e) => setCreditsInput(e.target.value)}
                    disabled={loading}
                    className={`${creditsInputClass} cursor-text w-full`}
                  />
                  <p className="text-[10px] sm:text-[11px] text-fg-muted leading-tight tabular-nums flex items-center justify-center gap-0.5">
                    <span>Disponibili:</span>
                    <span className="font-chubby font-semibold text-fg">{userCredits.toLocaleString("it-IT")}</span>
                    <IconCurrency className="w-3 h-3 text-primary shrink-0 inline-block align-middle" aria-hidden />
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-rose-400 text-center sm:text-left" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end px-5 py-4 sm:px-7 sm:py-5 border-t border-white/[0.08] bg-black/[0.15]">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="min-h-[48px] w-full sm:w-auto sm:min-w-[140px] rounded-xl border-2 border-white/20 bg-transparent px-6 font-kalshi text-sm font-bold uppercase tracking-tight text-fg hover:bg-white/[0.06] disabled:opacity-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading || !selectedOutcome || credits < 1}
              className="min-h-[48px] w-full sm:w-auto sm:min-w-[200px] rounded-xl bg-primary text-bg px-6 font-kalshi text-sm font-bold uppercase tracking-tight hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Invio…" : "Conferma"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
