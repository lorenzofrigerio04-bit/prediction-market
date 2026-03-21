"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { IconCurrency } from "@/components/ui/Icons";
import ModalQuoteTimer, { MODAL_QUOTE_TIMER_DURATION } from "@/components/events/ModalQuoteTimer";

const SCALE = 1_000_000;

/** Stesso family del titolo evento (Kalshi), tono un filo più leggero. */
const sellFormLabelClass =
  "font-kalshi text-lg sm:text-xl md:text-[1.45rem] font-semibold text-white/88 leading-[1.12] tracking-[0.02em] shrink-0 pt-0.5";

/** Campi quota/quantità: hairline inset, sfondo trasparente, focus discreto. */
const quotaFieldBaseClass =
  "rounded-xl border-0 bg-transparent py-1 pl-2 text-fg text-xl sm:text-2xl font-kalshi font-bold leading-tight text-end outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-[box-shadow,ring-color] duration-200 ease-out focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary/40 disabled:opacity-50";

const outcomeSelectClass =
  `${quotaFieldBaseClass} max-w-full min-w-0 pr-7 bg-[length:0.75rem] bg-[right_0.45rem_center] bg-no-repeat appearance-none`;

const qtyInputFieldClass =
  `${quotaFieldBaseClass} pr-2 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

const outcomeMeasureClass =
  "whitespace-nowrap font-kalshi text-xl sm:text-2xl font-bold leading-tight pl-2 pr-7";

export type SellConfirmLeg = {
  outcome: string;
  label: string;
  shareMicros: string;
  shares: number;
  costCredits: number;
};

export type SellConfirmPayload = {
  outcome: string;
  shareMicros: string;
};

type PreviewState = {
  estimatedProceedsMicros: string | null;
  loading: boolean;
  error: string | null;
};

function formatPctDisplay(value: number) {
  return `${Number(value).toFixed(1)}%`;
}

/** Ricavo con segno esplicito (+ / −) per l’italiano. */
function formatSignedCredits(n: number): string {
  const abs = Math.abs(n).toLocaleString("it-IT");
  if (n > 0) return `+${abs}`;
  if (n < 0) return `-${abs}`;
  return "0";
}

function parseQtyInput(raw: string, maxShares: number): number | null {
  const t = raw.trim().replace(",", ".");
  const q = parseFloat(t);
  if (!Number.isFinite(q) || q <= 0) return null;
  const qInt = Math.floor(q);
  if (qInt < 1 || qInt > maxShares) return null;
  return qInt;
}

type Props = {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  legs: SellConfirmLeg[];
  onConfirm: (payloads: SellConfirmPayload[]) => Promise<void>;
  confirming: boolean;
  error: string | null;
};

export default function SellConfirmModal({
  open,
  onClose,
  eventId,
  eventTitle,
  legs,
  onConfirm,
  confirming,
  error,
}: Props) {
  const [qtyByOutcome, setQtyByOutcome] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<PreviewState>({
    estimatedProceedsMicros: null,
    loading: false,
    error: null,
  });
  const [secondsLeft, setSecondsLeft] = useState(MODAL_QUOTE_TIMER_DURATION);
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const outcomeMeasureRef = useRef<HTMLSpanElement>(null);
  const [outcomeSelectWidthPx, setOutcomeSelectWidthPx] = useState<number | null>(null);

  const legsKey = useMemo(() => legs.map((l) => `${l.outcome}:${l.shareMicros}`).join("|"), [legs]);

  useEffect(() => {
    if (!open || legs.length === 0) return;
    setSelectedOutcome((prev) => {
      if (prev && legs.some((l) => l.outcome === prev)) return prev;
      return legs[0].outcome;
    });
  }, [open, legsKey, legs]);

  useEffect(() => {
    if (!open || legs.length === 0) return;
    setQtyByOutcome((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const leg of legs) {
        if (next[leg.outcome] === undefined) {
          next[leg.outcome] = String(leg.shares);
        }
      }
      for (const k of Object.keys(next)) {
        if (!legs.some((l) => l.outcome === k)) delete next[k];
      }
      return next;
    });
  }, [open, legsKey, legs]);

  const selectedLeg = useMemo(() => {
    const hit = legs.find((l) => l.outcome === selectedOutcome);
    return hit ?? legs[0] ?? null;
  }, [legs, selectedOutcome]);

  const selectedQtyStr = selectedLeg ? (qtyByOutcome[selectedLeg.outcome] ?? "") : "";

  const syncOutcomeSelectWidth = useCallback(() => {
    const el = outcomeMeasureRef.current;
    if (!el) return;
    const w = Math.ceil(el.getBoundingClientRect().width) + 4;
    setOutcomeSelectWidthPx(w);
  }, []);

  useLayoutEffect(() => {
    if (!open || legs.length <= 1 || !selectedLeg) {
      setOutcomeSelectWidthPx(null);
      return;
    }
    syncOutcomeSelectWidth();
  }, [open, legs.length, selectedLeg?.label, syncOutcomeSelectWidth]);

  useEffect(() => {
    if (!open || legs.length <= 1) return;
    window.addEventListener("resize", syncOutcomeSelectWidth);
    return () => window.removeEventListener("resize", syncOutcomeSelectWidth);
  }, [open, legs.length, syncOutcomeSelectWidth]);

  const fetchOnePreview = useCallback(
    async (outcome: string, shareMicros: bigint, signal: AbortSignal) => {
      const res = await fetch("/api/trades/sell/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          outcome,
          shareMicros: shareMicros.toString(),
        }),
        signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          estimatedProceedsMicros: null as string | null,
          error: typeof data.error === "string" ? data.error : "Errore nel calcolo della stima",
        };
      }
      const micros =
        typeof data.estimatedProceedsMicros === "string" ? data.estimatedProceedsMicros : null;
      return { estimatedProceedsMicros: micros, error: null as string | null };
    },
    [eventId],
  );

  useEffect(() => {
    const leg = legs.find((l) => l.outcome === selectedOutcome);
    if (!open || !leg) {
      setPreview({ estimatedProceedsMicros: null, loading: false, error: null });
      return;
    }

    const ac = new AbortController();
    let cancelled = false;
    const outcome = leg.outcome;
    const qty = parseQtyInput(selectedQtyStr, leg.shares);

    const run = async () => {
      if (qty == null) {
        if (!cancelled) {
          setPreview({ estimatedProceedsMicros: null, loading: false, error: null });
        }
        return;
      }
      if (!cancelled) {
        setPreview({ estimatedProceedsMicros: null, loading: true, error: null });
      }
      const shareMicros = BigInt(Math.round(qty * SCALE));
      try {
        const r = await fetchOnePreview(outcome, shareMicros, ac.signal);
        if (cancelled) return;
        setPreview({
          estimatedProceedsMicros: r.estimatedProceedsMicros,
          loading: false,
          error: r.error,
        });
      } catch (e) {
        if (cancelled || (e instanceof Error && e.name === "AbortError")) return;
        setPreview({
          estimatedProceedsMicros: null,
          loading: false,
          error: "Errore di rete",
        });
      }
    };

    void run();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [open, legs, legsKey, selectedOutcome, selectedQtyStr, fetchOnePreview]);

  useEffect(() => {
    if (!open || confirming) return;
    setSecondsLeft(MODAL_QUOTE_TIMER_DURATION);
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, confirming]);

  useEffect(() => {
    if (!open || confirming || secondsLeft !== 0) return;
    onClose();
  }, [open, confirming, secondsLeft, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirming) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, confirming, onClose]);

  const canSell =
    selectedLeg != null &&
    (() => {
      const qty = parseQtyInput(selectedQtyStr, selectedLeg.shares);
      if (qty == null || qty < 1) return false;
      return (
        !preview.loading &&
        !preview.error &&
        preview.estimatedProceedsMicros != null &&
        preview.estimatedProceedsMicros !== ""
      );
    })();

  const handleConfirm = () => {
    if (!selectedLeg || !canSell) return;
    const qty = parseQtyInput(selectedQtyStr, selectedLeg.shares);
    if (qty == null || qty < 1) return;
    void onConfirm([
      {
        outcome: selectedLeg.outcome,
        shareMicros: BigInt(Math.round(qty * SCALE)).toString(),
      },
    ]);
  };

  if (!open || legs.length === 0 || !selectedLeg) return null;

  const qtyParsed = parseQtyInput(selectedQtyStr, selectedLeg.shares);
  let proceedsCredits: number | null = null;
  let saleAvgPct: number | null = null;
  if (preview.estimatedProceedsMicros && qtyParsed != null && qtyParsed > 0) {
    proceedsCredits = Math.round(Number(BigInt(preview.estimatedProceedsMicros) / BigInt(SCALE)));
    saleAvgPct = Math.round((proceedsCredits / qtyParsed) * 100);
  }
  return (
    <div
      className="scrim-below-app-header z-[60] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-admin-bg/80 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sell-confirm-title"
      onClick={() => !confirming && onClose()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[min(90dvh,820px)] flex flex-col rounded-2xl sm:rounded-3xl border border-white/[0.12] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.55)] overflow-hidden transition-transform duration-200 ease-out"
        style={{ background: "rgb(var(--admin-bg))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-7 sm:pt-7 sm:pb-4">
          <div className="min-w-0 flex-1 pr-2">
            <h2
              id="sell-confirm-title"
              className="font-kalshi text-[1.55rem] sm:text-[1.85rem] md:text-[2rem] lg:text-[2.1rem] font-bold text-fg leading-[1.1] tracking-[0.01em] max-w-full"
            >
              {eventTitle}
            </h2>
          </div>
          <div className="shrink-0 pt-0.5">
            <ModalQuoteTimer secondsLeft={secondsLeft} variant="sell" />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6 space-y-4 sm:space-y-5">
          <div className="rounded-xl sm:rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-5 space-y-5">
            <div
              className={`flex flex-row justify-between gap-3 min-w-0 ${legs.length > 1 ? "items-start" : "items-center"}`}
            >
              <span className={sellFormLabelClass}>Vendi:</span>
              <div className="relative min-w-0 flex shrink flex-col items-end gap-1">
                {legs.length > 1 ? (
                  <>
                    <span
                      ref={outcomeMeasureRef}
                      className={`${outcomeMeasureClass} invisible absolute left-0 top-0 pointer-events-none`}
                      aria-hidden
                    >
                      {selectedLeg.label}
                    </span>
                    <select
                      id="sell-modal-outcome"
                      value={selectedLeg.outcome}
                      onChange={(e) => setSelectedOutcome(e.target.value)}
                      disabled={confirming}
                      className={`${outcomeSelectClass} cursor-pointer shrink-0`}
                      style={
                        outcomeSelectWidthPx != null
                          ? { width: outcomeSelectWidthPx, maxWidth: "100%" }
                          : { maxWidth: "100%" }
                      }
                      aria-label="Quota da vendere"
                    >
                      {legs.map((leg) => (
                        <option key={leg.outcome} value={leg.outcome}>
                          {leg.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] sm:text-[11px] text-fg-muted leading-tight text-end tabular-nums max-w-full">
                      {legs.length.toLocaleString("it-IT")} disponibili
                    </p>
                  </>
                ) : (
                  <p className="font-kalshi text-xl sm:text-2xl font-bold text-fg leading-tight text-end break-words">
                    &quot;{selectedLeg.label}&quot;
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex flex-row items-start justify-between gap-3 min-w-0">
                <label htmlFor="sell-qty-selected" className={sellFormLabelClass}>
                  Quantità:
                </label>
                <div className="flex min-w-0 flex-col items-end gap-1 shrink">
                  <input
                    id="sell-qty-selected"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={selectedLeg.shares}
                    step={1}
                    value={selectedQtyStr}
                    onChange={(e) =>
                      setQtyByOutcome((prev) => ({
                        ...prev,
                        [selectedLeg.outcome]: e.target.value,
                      }))
                    }
                    disabled={confirming}
                    className={`${qtyInputFieldClass} cursor-text shrink-0`}
                    style={{ width: `max(3.25rem, ${String(selectedQtyStr || "0").length + 2}ch)` }}
                    aria-label={`Quantità quote ${selectedLeg.label}`}
                  />
                  <p className="text-[10px] sm:text-[11px] text-fg-muted leading-tight text-end tabular-nums max-w-full">
                    {selectedLeg.shares.toLocaleString("it-IT")} q. disponibili
                  </p>
                </div>
              </div>

              <dl className="grid gap-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <dt className={sellFormLabelClass}>Prezzo di vendita:</dt>
                  <dd className="font-chubby font-semibold tabular-nums text-fg min-h-[1.5rem] text-end">
                    {preview.loading ? (
                      <span className="inline-flex items-center justify-end gap-2 text-fg-muted text-sm font-normal">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Calcolo…
                      </span>
                    ) : preview.error ? (
                      <span className="text-rose-400 text-sm">{preview.error}</span>
                    ) : saleAvgPct != null ? (
                      formatPctDisplay(saleAvgPct)
                    ) : (
                      <span className="text-fg-muted">—</span>
                    )}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <dt className={sellFormLabelClass}>Ricavo stimato:</dt>
                  <dd
                    className={`font-chubby font-bold tabular-nums text-lg sm:text-xl min-h-[1.5rem] flex items-center justify-end gap-1 flex-wrap ${
                      proceedsCredits == null || proceedsCredits === 0
                        ? "text-fg"
                        : proceedsCredits > 0
                          ? "text-success"
                          : "text-danger"
                    }`}
                  >
                    {preview.loading ? (
                      <span className="inline-flex items-center gap-2 text-fg-muted text-sm font-normal">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Calcolo…
                      </span>
                    ) : preview.error ? (
                      <span className="text-rose-400 text-sm">{preview.error}</span>
                    ) : proceedsCredits != null ? (
                      <>
                        {formatSignedCredits(proceedsCredits)}
                        <IconCurrency
                          className="w-4 h-4 inline-block align-middle shrink-0"
                          aria-label="Crediti"
                        />
                      </>
                    ) : (
                      <span className="text-fg-muted">—</span>
                    )}
                  </dd>
                </div>
              </dl>
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
            onClick={onClose}
            disabled={confirming}
            className="min-h-[48px] w-full sm:w-auto sm:min-w-[140px] rounded-xl border-2 border-white/20 bg-transparent px-6 font-kalshi text-sm font-bold uppercase tracking-tight text-fg hover:bg-white/[0.06] disabled:opacity-50 transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming || !canSell}
            className="min-h-[48px] w-full sm:w-auto sm:min-w-[200px] rounded-xl bg-primary text-bg px-6 font-kalshi text-sm font-bold uppercase tracking-tight hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {confirming ? "Vendita in corso…" : "Conferma vendita"}
          </button>
        </div>
      </div>
    </div>
  );
}
