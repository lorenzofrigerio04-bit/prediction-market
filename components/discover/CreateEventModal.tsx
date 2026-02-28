"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface CreateEventModalProps {
  categories: string[];
  onClose: () => void;
}

type SubmitStatus = "idle" | "loading" | "approved" | "rejected";

interface SubmitResult {
  approved: boolean;
  eventId?: string;
  errors?: string[];
  warnings?: string[];
  message?: string;
}

export default function CreateEventModal({
  categories,
  onClose,
}: CreateEventModalProps) {
  const { status } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] || "");
  const [closesAt, setClosesAt] = useState("");
  const [resolutionSource, setResolutionSource] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    queueMicrotask(() =>
      setMinDate(
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      )
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status !== "authenticated") {
      setErrorMsg("Devi effettuare il login per creare un evento.");
      return;
    }

    if (!title.trim() || !category || !closesAt) {
      setErrorMsg("Compila tutti i campi obbligatori.");
      return;
    }

    setSubmitStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          category,
          closesAt: new Date(closesAt).toISOString(),
          resolutionSource: resolutionSource.trim() || null,
        }),
      });

      const data = await res.json();

      if (data.approved) {
        setSubmitResult(data);
        setSubmitStatus("approved");
      } else {
        setSubmitResult(data);
        setSubmitStatus("rejected");
      }
    } catch {
      setErrorMsg("Errore di rete. Riprova.");
      setSubmitStatus("idle");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory(categories[0] || "");
    setClosesAt("");
    setResolutionSource("");
    setSubmitStatus("idle");
    setSubmitResult(null);
    setErrorMsg("");
  };

  if (submitStatus === "approved" && submitResult) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={handleBackdropClick}
      >
        <div className="create-event-modal w-full max-w-md p-6 rounded-2xl text-center animate-in-fade-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-ds-h2 font-bold text-white mb-2">
            Evento pubblicato!
          </h2>
          <p className="text-ds-body text-white/80 mb-6">
            Il tuo evento è stato approvato automaticamente e pubblicato sulla
            piattaforma. Ora la community può fare previsioni!
          </p>
          {submitResult.warnings && submitResult.warnings.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 text-ds-body-sm text-left">
              <p className="font-semibold mb-1">Suggerimenti:</p>
              <ul className="list-disc list-inside space-y-1">
                {submitResult.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Link
              href={`/events/${submitResult.eventId}`}
              className="landing-cta-primary min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body-sm w-full inline-flex items-center justify-center"
              onClick={onClose}
            >
              Vai all&apos;evento →
            </Link>
            <button
              onClick={onClose}
              className="min-h-[44px] px-6 py-2.5 rounded-xl font-semibold text-ds-body-sm w-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitStatus === "rejected" && submitResult) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={handleBackdropClick}
      >
        <div className="create-event-modal w-full max-w-md p-6 rounded-2xl text-center animate-in-fade-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-ds-h2 font-bold text-white mb-2">
            Evento non approvato
          </h2>
          <p className="text-ds-body text-white/80 mb-4">
            L&apos;evento non rispetta i criteri della piattaforma. Ecco cosa correggere:
          </p>
          {submitResult.errors && submitResult.errors.length > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-left">
              <ul className="space-y-2">
                {submitResult.errors.map((err, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-ds-body-sm text-red-200"
                  >
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={resetForm}
              className="landing-cta-primary min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body-sm w-full"
            >
              Riprova
            </button>
            <button
              onClick={onClose}
              className="min-h-[44px] px-6 py-2.5 rounded-xl font-semibold text-ds-body-sm w-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="create-event-modal w-full max-w-md p-6 rounded-2xl animate-in-fade-up my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-ds-h2 font-bold text-white">Crea evento</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Chiudi"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        {status !== "authenticated" && (
          <div className="mb-4 p-3 rounded-lg bg-warning/20 border border-warning/30 text-warning text-ds-body-sm">
            Devi effettuare il login per creare un evento.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-ds-body-sm font-semibold text-white/90 mb-1.5">
              Titolo evento *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es: L'Italia vincerà gli Europei 2026?"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              maxLength={200}
              required
            />
          </div>

          <div>
            <label className="block text-ds-body-sm font-semibold text-white/90 mb-1.5">
              Descrizione
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi l'evento e il contesto..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
              maxLength={1000}
            />
          </div>

          <div>
            <label className="block text-ds-body-sm font-semibold text-white/90 mb-1.5">
              Categoria *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
              required
            >
              <option value="" disabled className="bg-gray-900">
                Seleziona categoria
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-ds-body-sm font-semibold text-white/90 mb-1.5">
              Data chiusura *
            </label>
            <input
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              min={minDate}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-ds-body-sm font-semibold text-white/90 mb-1.5">
              Fonte di risoluzione
            </label>
            <input
              type="text"
              value={resolutionSource}
              onChange={(e) => setResolutionSource(e.target.value)}
              placeholder="Es: Risultato ufficiale FIFA, Comunicato stampa..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              maxLength={300}
            />
            <p className="text-ds-micro text-white/50 mt-1">
              Come verrà verificato il risultato dell&apos;evento?
            </p>
          </div>

          {submitStatus === "idle" && errorMsg && (
            <div className="p-3 rounded-lg bg-danger/20 border border-danger/30 text-danger text-ds-body-sm">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitStatus === "loading" || status !== "authenticated"}
            className="landing-cta-primary min-h-[52px] px-6 py-3.5 rounded-xl font-semibold text-ds-body w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitStatus === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Invio in corso...
              </span>
            ) : (
              "Invia per revisione"
            )}
          </button>
        </form>

        <p className="text-ds-micro text-white/50 text-center mt-4">
          Gli eventi devono rispettare le nostre linee guida e saranno
          revisionati prima della pubblicazione.
        </p>
      </div>
    </div>
  );
}
