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
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Simulazione bot
        </h1>
        <p className="text-gray-600">
          Esegui una run di attività simulata: i bot creano previsioni, commenti, reazioni e follow sugli eventi aperti. Con cron ogni 30 min la piattaforma resta viva come con 100–200 utenti attivi.
        </p>
      </div>

      <div className="max-w-2xl bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-4">
            In produzione è richiesta la variabile d&apos;ambiente{" "}
            <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
              ENABLE_SIMULATED_ACTIVITY=true
            </code>{" "}
            in Vercel.
          </p>
          <button
            onClick={run}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? "Esecuzione in corso..." : "Esegui attività simulata ora"}
          </button>
        </div>

        {result && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            {hasError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">{result.error}</p>
                {result.hint && (
                  <p className="text-sm text-red-700 mt-1">{result.hint}</p>
                )}
              </div>
            )}
            {isSuccess && result.predictions != null && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{result.predictions.created}</p>
                  <p className="text-xs text-gray-500">Previsioni</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{result.comments?.created ?? 0}</p>
                  <p className="text-xs text-gray-500">Commenti</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{result.reactions?.created ?? 0}</p>
                  <p className="text-xs text-gray-500">Reazioni</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{result.follows?.created ?? 0}</p>
                  <p className="text-xs text-gray-500">Follow</p>
                </div>
              </div>
            )}
            <details className="mt-2">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Dettaglio risposta (JSON)
              </summary>
              <pre className="mt-2 p-4 bg-white rounded-lg border border-gray-200 text-xs overflow-auto max-h-48">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500">
        <BackLink href="/admin" className="text-blue-600 hover:underline dark:text-blue-400">
          ← Indietro
        </BackLink>
      </p>
    </div>
  );
}
