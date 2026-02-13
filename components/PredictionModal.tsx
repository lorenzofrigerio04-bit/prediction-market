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
}

export default function PredictionModal({
  eventId,
  eventTitle,
  isOpen,
  onClose,
  onSuccess,
  userCredits = 0,
}: PredictionModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO" | null>(
    null
  );
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
    }
  }, [isOpen]);

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
      setError("Seleziona una previsione (SÌ o NO)");
      return;
    }

    if (credits < 1) {
      setError("Devi investire almeno 1 credito");
      return;
    }

    if (credits > userCredits) {
      setError("Crediti insufficienti");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          outcome: selectedOutcome,
          credits,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore nella creazione della previsione");
      }

      // Success!
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      router.refresh(); // Refresh to update the page
    } catch (err: any) {
      setError(err.message || "Errore nella creazione della previsione");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickAmounts = [10, 25, 50, 100, 250];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prediction-modal-title"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="prediction-modal-title" className="text-2xl font-bold text-gray-900">Fai una Previsione</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
            disabled={loading}
            aria-label="Chiudi"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-6 line-clamp-2">{eventTitle}</p>

        <form onSubmit={handleSubmit}>
          {/* Outcome Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Prevedi:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedOutcome("YES")}
                disabled={loading}
                className={`px-6 py-4 rounded-lg font-semibold text-lg transition-all ${
                  selectedOutcome === "YES"
                    ? "bg-green-600 text-white shadow-lg scale-105"
                    : "bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200"
                }`}
              >
                SÌ
              </button>
              <button
                type="button"
                onClick={() => setSelectedOutcome("NO")}
                disabled={loading}
                className={`px-6 py-4 rounded-lg font-semibold text-lg transition-all ${
                  selectedOutcome === "NO"
                    ? "bg-red-600 text-white shadow-lg scale-105"
                    : "bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200"
                }`}
              >
                NO
              </button>
            </div>
          </div>

          {/* Credits Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crediti da investire:
            </label>
            <input
              type="number"
              min="1"
              max={userCredits}
              value={credits}
              onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Crediti disponibili: {userCredits.toLocaleString()}
            </p>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setCredits(Math.min(amount, userCredits))}
                  disabled={loading || amount > userCredits}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    credits === amount
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${
                    amount > userCredits
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {amount}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCredits(userCredits)}
                disabled={loading || userCredits === 0}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  credits === userCredits
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${
                  userCredits === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Tutto
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading || !selectedOutcome || credits < 1}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Caricamento..." : "Conferma Previsione"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
