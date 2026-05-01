"use client";

import { useState } from "react";
import Link from "next/link";

export default function VerifyEmailCodeForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Impossibile verificare. Riprova.");
        return;
      }
      window.location.href = "/auth/login?verified=1";
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="text-left space-y-4">
      <p className="text-fg-muted text-sm">
        Se hai ricevuto un codice di 6 cifre, incollalo qui (oppure usa il link nell’email).
      </p>
      <div>
        <label htmlFor="verify-email" className="block text-sm font-medium text-fg mb-1">
          Email
        </label>
        <input
          id="verify-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border dark:border-white/15 bg-bg px-3 py-3 text-fg"
          placeholder="tu@email.it"
        />
      </div>
      <div>
        <label htmlFor="verify-code" className="block text-sm font-medium text-fg mb-1">
          Codice di verifica
        </label>
        <input
          id="verify-code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-full rounded-xl border border-border dark:border-white/15 bg-bg px-3 py-3 text-fg tracking-[0.35em] font-mono text-lg"
          placeholder="000000"
        />
      </div>
      {error ? <p className="text-red-500 text-sm">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full min-h-[48px] rounded-2xl bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-50"
      >
        {busy ? "Verifica…" : "Verifica account"}
      </button>
      <p className="text-center text-sm text-fg-muted">
        <Link href="/auth/login" className="text-primary hover:underline">
          Torna al login
        </Link>
      </p>
    </form>
  );
}
