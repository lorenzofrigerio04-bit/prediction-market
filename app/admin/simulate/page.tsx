"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminSimulatePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/run-simulated-activity", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Simulazione bot</h1>
        <p className="text-gray-600 mt-1">
          Esegui una run di attività simulata: i bot creano previsioni, commenti, reazioni e follow sugli eventi aperti.
        </p>
      </div>

      <div className="max-w-2xl p-6 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-amber-900 mb-4">
          In produzione imposta <code className="bg-amber-100 px-1.5 py-0.5 rounded text-sm">ENABLE_SIMULATED_ACTIVITY=true</code> nelle variabili d&apos;ambiente Vercel.
        </p>
        <button
          onClick={run}
          disabled={loading}
          className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium text-base"
        >
          {loading ? "Esecuzione in corso..." : "Esegui attività simulata ora"}
        </button>
        {result && (
          <pre className="mt-4 p-4 bg-white rounded-lg text-sm overflow-auto max-h-60 border border-amber-200">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500">
        <Link href="/admin" className="text-blue-600 hover:underline">← Torna alla dashboard eventi</Link>
      </p>
    </div>
  );
}
