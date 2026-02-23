"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PredictionModalProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userCredits?: number;
  /** Pre-select SÌ or NO when opening from event page SI/NO boxes */
  initialOutcome?: "YES" | "NO" | null;
}

export default function PredictionModal({
  eventId,
  eventTitle,
  isOpen,
  onClose,
  onSuccess,
  userCredits = 0,
  initialOutcome = null,
}: PredictionModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO" | null>(null);
  const [credits, setCredits] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedOutcome(null);
      setCredits(10);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (!selectedOutcome) {
      setError("Seleziona SÌ o NO");
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

      if (onSuccess) onSuccess();
      onClose();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickAmounts = [10, 25, 50, 100, 250];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      style={{ paddingBottom: "var(--safe-area-inset-bottom)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prediction-modal-title"
      onClick={handleClose}
    >
      <div
        className="bg-bg w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl border-t sm:border border-border dark:border-white/10 max-h-[90vh] overflow-y-auto shadow-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-bg border-b border-border dark:border-white/10 px-4 py-3 sm:pt-6 flex items-center justify-between rounded-t-3xl sm:rounded-t-3xl z-10">
          <h2 id="prediction-modal-title" className="text-lg font-bold text-fg">
            Fai una Previsione
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2.5 rounded-xl text-fg-muted hover:text-fg hover:bg-surface/50 min-w-[44px] min-h-[44px] flex items-center justify-center border border-transparent dark:border-white/10"
            disabled={loading}
            aria-label="Chiudi"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-fg-muted text-sm mb-6 line-clamp-2">{eventTitle}</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-fg-muted mb-3">Prevedi</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOutcome("YES")}
                  disabled={loading}
                  className={`min-h-[52px] py-4 rounded-2xl font-bold text-lg transition-all ${
                    selectedOutcome === "YES"
                      ? "bg-emerald-500 text-white shadow-card"
                      : "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700"
                  }`}
                >
                  SÌ
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOutcome("NO")}
                  disabled={loading}
                  className={`min-h-[52px] py-4 rounded-2xl font-bold text-lg transition-all ${
                    selectedOutcome === "NO"
                      ? "bg-red-500 text-white shadow-card"
                      : "bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:border-red-700"
                  }`}
                >
                  NO
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-fg-muted mb-2">Crediti</label>
              <input
                type="number"
                min={1}
                max={userCredits}
                value={credits}
                onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
                disabled={loading}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl border border-border dark:border-white/10 bg-surface/50 text-fg focus:ring-2 focus:ring-primary focus:border-primary text-base"
              />
              <p className="text-xs text-fg-muted mt-1">Disponibili: <span className="font-semibold text-primary">{userCredits.toLocaleString()}</span></p>

              <div className="flex flex-wrap gap-2 mt-3">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setCredits(Math.min(amount, userCredits))}
                    disabled={loading || amount > userCredits}
                    className={`min-h-[40px] px-4 rounded-2xl text-sm font-semibold transition-colors ${
                      credits === amount ? "chip-selected" : "box-raised text-fg-muted hover:border-primary/25"
                    } ${amount > userCredits ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {amount}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCredits(userCredits)}
                  disabled={loading || userCredits === 0}
                    className={`min-h-[40px] px-4 rounded-2xl text-sm font-semibold transition-colors ${
                      credits === userCredits ? "chip-selected" : "box-raised text-fg-muted hover:border-primary/25"
                    } ${userCredits === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Tutto
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 min-h-[48px] py-3 border border-border dark:border-white/10 rounded-2xl text-fg-muted font-semibold hover:bg-surface/50 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-bg"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading || !selectedOutcome || credits < 1}
                className="flex-1 min-h-[48px] py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                {loading ? "..." : "Conferma"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
