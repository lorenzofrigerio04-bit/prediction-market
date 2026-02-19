"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Header from "@/components/Header";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Le password non corrispondono");
      return;
    }

    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }

    setIsLoading(true);

    try {
      // Registra l'utente
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: name || null,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        setError("Errore nella risposta del server. Verifica che il server sia in esecuzione.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        // Mostra l'errore dal server, o un messaggio generico
        const errorMessage = data.error || data.details || `Errore durante la registrazione (${response.status})`;
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Dopo la registrazione, fai login automatico
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Registrazione completata, ma errore durante il login");
      } else {
        await new Promise((r) => setTimeout(r, 300));
        window.location.href = "/auth/success?callbackUrl=/";
      }
    } catch (err: any) {
      console.error("Errore:", err);
      setError(err.message || "Qualcosa è andato storto. Riprova tra poco.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/auth/success?callbackUrl=/" });
    } catch (err) {
      setError("Errore durante la registrazione con Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full card-raised p-8">
        <h1 className="text-3xl font-bold text-center text-fg mb-2">
          Registrati
        </h1>
        <p className="text-center text-fg-muted mb-8">
          Crea account e ricevi 100 crediti per iniziare.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-danger-bg/50 border border-danger/30 rounded-xl text-danger text-ds-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-fg-muted mb-1"
            >
              Nome (opzionale)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[48px] px-4 py-3 border border-white/10 rounded-2xl bg-white/5 text-fg placeholder:text-fg-muted focus:ring-2 focus:ring-primary focus:border-primary input-neon-focus"
              placeholder="Il tuo nome"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-fg-muted mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full min-h-[48px] px-4 py-3 border border-white/10 rounded-2xl bg-white/5 text-fg placeholder:text-fg-muted focus:ring-2 focus:ring-primary focus:border-primary input-neon-focus"
              placeholder="tua@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-fg-muted mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full min-h-[48px] px-4 py-3 border border-white/10 rounded-2xl bg-white/5 text-fg placeholder:text-fg-muted focus:ring-2 focus:ring-primary focus:border-primary input-neon-focus"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-fg-muted">
              Minimo 6 caratteri
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-fg-muted mb-1"
            >
              Conferma Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full min-h-[48px] px-4 py-3 border border-white/10 rounded-2xl bg-white/5 text-fg placeholder:text-fg-muted focus:ring-2 focus:ring-primary focus:border-primary input-neon-focus"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] bg-primary text-white py-3 px-4 rounded-2xl font-semibold hover:bg-primary-hover border border-white/20 shadow-[0_0_24px_-6px_rgba(var(--primary-glow),0.45)] hover:shadow-[0_0_28px_-4px_rgba(var(--primary-glow),0.5)] focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 transition-all"
          >
            {isLoading ? "Registrazione in corso..." : "Registrati"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-fg-muted">Oppure</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="mt-4 w-full min-h-[48px] flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-fg py-3 px-4 rounded-2xl font-medium hover:border-primary/25 hover:shadow-[0_0_16px_-6px_rgba(var(--primary-glow),0.2)] focus:ring-2 focus:ring-primary disabled:opacity-50 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Registrati con Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-fg-muted">
          Hai già un account?{" "}
          <Link
            href="/auth/login"
            className="text-primary hover:text-primary-hover font-medium focus-visible:underline"
          >
            Accedi
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-fg-muted">
          Registrandoti accetti i{" "}
          <Link href="/legal/terms" className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded">
            Termini di servizio
          </Link>
          {" "}e la{" "}
          <Link href="/legal/privacy" className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded">
            Privacy policy
          </Link>
          .
        </p>
        </div>
      </div>
    </div>
  );
}
