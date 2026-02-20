"use client";

import { useState } from "react";
import BackLink from "@/components/ui/BackLink";

interface SimulateResult {
  ok?: boolean;
  error?: string;
  hint?: string;
  predictions?: { created: number; errors: number };
  comments?: { created: number; errors: number };
  reactions?: { created: number; errors: number };
  follows?: { created: number; errors: number };
  botsToppedUp?: number;
  timestamp?: string;
}

export default function AdminSimulatePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulateResult | null>(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/run-simulated-activity", { method: "POST" });
      const data: SimulateResult = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = result?.ok === true;
  const hasError = result && !result.ok;

  return (
    <div className="min-h-screen bg-bg text-fg p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-fg mb-2">
          Simulazione bot
        </h1>
        <p className="text-fg-muted">
          Esegui una run di attività simulata: i bot creano previsioni, commenti, reazioni e follow sugli eventi aperti. Con cron ogni 30 min la piattaforma resta viva come con 100–200 utenti attivi.
        </p>
      </div>

      <div className="max-w-2xl card-raised rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border dark:border-white/10">
          <p className="text-sm text-fg-muted mb-4">
            In produzione è richiesta la variabile d&apos;ambiente{" "}
            <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">
              ENABLE_SIMULATED_ACTIVITY=true
            </code>{" "}
            in Vercel.
          </p>
          <button
            onClick={run}
            disabled={loading}
            className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-hover disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? "Esecuzione in corso..." : "Esegui attività simulata ora"}
          </button>
        </div>

        {result && (
          <div className="p-6 bg-surface/30 border-t border-border dark:border-white/10">
            {hasError && (
              <div className="mb-4 p-4 bg-danger/10 border border-danger/30 rounded-xl">
                <p className="text-sm font-medium text-danger">{result.error}</p>
                {result.hint && (
                  <p className="text-sm text-danger/80 mt-1">{result.hint}</p>
                )}
              </div>
            )}
            {isSuccess && result.predictions != null && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="box-raised rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-fg font-numeric">{result.predictions.created}</p>
                  <p className="text-xs text-fg-muted">Previsioni</p>
                </div>
                <div className="box-raised rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-fg font-numeric">{result.comments?.created ?? 0}</p>
                  <p className="text-xs text-fg-muted">Commenti</p>
                </div>
                <div className="box-raised rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-fg font-numeric">{result.reactions?.created ?? 0}</p>
                  <p className="text-xs text-fg-muted">Reazioni</p>
                </div>
                <div className="box-raised rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-fg font-numeric">{result.follows?.created ?? 0}</p>
                  <p className="text-xs text-fg-muted">Follow</p>
                </div>
              </div>
            )}
            <details className="mt-2">
              <summary className="text-sm text-fg-subtle cursor-pointer hover:text-fg-muted transition-colors">
                Dettaglio risposta (JSON)
              </summary>
              <pre className="mt-2 p-4 bg-white/5 rounded-xl border border-white/10 text-xs overflow-auto max-h-48 font-mono text-fg-muted">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm">
        <BackLink href="/admin" className="text-primary hover:underline">
          ← Indietro
        </BackLink>
      </p>
    </div>
  );
}
