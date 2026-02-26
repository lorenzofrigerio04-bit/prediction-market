"use client";

import { useState } from "react";
import { IconClose } from "@/components/ui/Icons";

const TERMS_CONTENT = (
  <>
    <h2 className="text-lg font-semibold text-fg mb-2">1. Età minima</h2>
    <p className="text-fg-muted text-sm leading-relaxed mb-4">
      L&apos;utilizzo della piattaforma è consentito solo a utenti che abbiano compiuto almeno 18 anni.
      Registrandoti dichiari di avere l&apos;età richiesta. In caso contrario l&apos;account potrà essere sospeso.
    </p>
    <h2 className="text-lg font-semibold text-fg mb-2">2. Uso accettabile</h2>
    <p className="text-fg-muted text-sm leading-relaxed mb-4">
      Ti impegni a utilizzare il servizio in modo lecito e rispettoso. È vietato: usare la piattaforma per scopi illeciti,
      violare diritti di terzi, manipolare eventi o risultati, creare account multipli per ottenere vantaggi indebiti,
      diffondere contenuti offensivi o spam. La violazione di queste regole può comportare la sospensione o la chiusura dell&apos;account.
    </p>
    <h2 className="text-lg font-semibold text-fg mb-2">3. Crediti virtuali</h2>
    <p className="text-fg-muted text-sm leading-relaxed mb-4">
      I crediti utilizzati sulla piattaforma sono valuta virtuale di gioco. Non hanno valore monetario,
      non sono convertibili in denaro né in altri beni e non sono prelevabili.
    </p>
    <h2 className="text-lg font-semibold text-fg mb-2">4. Modifiche e recesso</h2>
    <p className="text-fg-muted text-sm leading-relaxed">
      Ci riserviamo il diritto di modificare questi termini. In caso di modifiche sostanziali ti informeremo tramite
      i canali previsti. Puoi recedere in qualsiasi momento cessando l&apos;utilizzo del servizio.
    </p>
  </>
);

interface EventInRevisionModalProps {
  submissionId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EventInRevisionModal({
  submissionId,
  onClose,
  onSuccess,
}: EventInRevisionModalProps) {
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!acceptTerms) {
      setError("Accetta i termini e condizioni per continuare.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/events/submit/${submissionId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim().replace(/\s/g, ""), acceptTerms: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante il salvataggio.");
        setLoading(false);
        return;
      }
      setDone(true);
      onSuccess?.();
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  if (showTerms) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-bg border border-white/10 rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-ds-h2 font-bold text-fg">Termini e condizioni</h2>
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="p-2 rounded-xl text-fg-muted hover:text-fg hover:bg-white/10 transition-colors"
              aria-label="Chiudi"
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto text-sm flex-1">
            {TERMS_CONTENT}
          </div>
          <div className="p-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="w-full py-3 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="crea-page-box create-event-modal rounded-2xl p-6 max-w-md w-full text-center">
          <p className="text-ds-body text-white/90 mb-6">
            Grazie! Ti avviseremo quando il tuo evento sarà approvato.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="landing-cta-primary min-h-[48px] px-6 py-3 rounded-xl font-semibold w-full"
          >
            Chiudi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="crea-page-box create-event-modal rounded-2xl p-6 sm:p-8 max-w-md w-full">
        <h2 className="text-ds-h2 font-bold text-white mb-3 text-center">
          Evento in revisione
        </h2>
        <p className="text-ds-body-sm text-white/85 text-center mb-6">
          Il tuo evento è in revisione. Ti avviseremo appena verrà approvato.
        </p>
        <p className="text-ds-body-sm text-white/80 mb-4">
          Lasciaci il tuo numero di telefono: ti avviseremo così non ti perderai il lancio dell&apos;evento!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="crea-notify-phone" className="block text-ds-body-sm font-semibold text-white/90 mb-1.5">
              Numero di telefono
            </label>
            <input
              id="crea-notify-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Es. +39 333 1234567"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="crea-accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 text-primary focus:ring-primary"
            />
            <label htmlFor="crea-accept-terms" className="text-ds-body-sm text-white/90">
              Accetto i{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-primary hover:underline focus:underline focus:outline-none"
              >
                termini e condizioni
              </button>
            </label>
          </div>

          {error && (
            <p className="text-ds-body-sm text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Salta
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 landing-cta-primary py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? "Invio…" : "Invia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
