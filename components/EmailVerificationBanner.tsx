"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function EmailVerificationBanner() {
  const { data: session } = useSession();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!session?.user?.email) return null;
  if (session.user.emailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/auth/send-verification-email", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="bg-amber-500/15 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 dark:border-amber-500/20"
      role="alert"
    >
      <div className="mx-auto px-4 py-2.5 max-w-7xl flex flex-wrap items-center justify-center gap-2 text-sm">
        <span>Verifica il tuo indirizzo email per confermare l’account.</span>
        <a
          href="/auth/verify-email"
          className="font-semibold underline hover:no-underline focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
        >
          Controlla la casella
        </a>
        <span className="text-fg-muted">·</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={sending || sent}
          className="font-semibold underline hover:no-underline disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
        >
          {sent ? "Email inviata" : sending ? "Invio..." : "Invia di nuovo"}
        </button>
        {sent && <span className="text-green-600 dark:text-green-400 text-xs">(controlla anche lo spam)</span>}
      </div>
    </div>
  );
}
