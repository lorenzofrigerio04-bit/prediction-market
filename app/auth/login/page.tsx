"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Questa email è già usata con un altro metodo di accesso. Accedi con email e password oppure usa sempre lo stesso metodo (solo Google o solo email).",
  CredentialsSignin: "Email o password non corretti. Riprova.",
  Default: "Qualcosa è andato storto. Riprova tra poco.",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { update: updateSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Destinazione dopo login: da URL (?callbackUrl=...) o Home
  const callbackUrl = (() => {
    const url = searchParams.get("callbackUrl");
    if (url && typeof url === "string" && url.startsWith("/") && !url.startsWith("//")) {
      return url;
    }
    return "/";
  })();

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setError(ERROR_MESSAGES[err] || ERROR_MESSAGES.Default);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setRedirecting(false);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const errorMsg = result.error === 'undefined' || !result.error 
          ? ERROR_MESSAGES.Default 
          : ERROR_MESSAGES[result.error] || result.error;
        setError(errorMsg);
        setIsLoading(false);
        return;
      }
      if (!result?.ok) {
        setError("Email o password non corretti. Riprova.");
        setIsLoading(false);
        return;
      }
      // Login riuscito: aggiorna la sessione sul client e reindirizza a una pagina
      // che verifica la sessione lato server, così la home riceve sempre il cookie.
      setRedirecting(true);
      try {
        await updateSession();
      } catch {
        // Ignora errori di refetch; il redirect server-side risolverà
      }
      // Breve attesa per assicurare che il browser abbia scritto il cookie
      await new Promise((r) => setTimeout(r, 300));
      const safeCallback = encodeURIComponent(callbackUrl);
      window.location.href = `/auth/success?callbackUrl=${safeCallback}`;
    } catch (err: any) {
      console.error('[LoginPage] Errore durante signIn:', err);
      const errorMsg = err?.message || err?.toString() || "Qualcosa è andato storto. Riprova tra poco.";
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError("");
    setRedirecting(true);
    const successUrl = `/auth/success?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    signIn("google", { callbackUrl: successUrl });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full card-raised p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-fg mb-1">
          Accedi
        </h1>
        <p className="text-center text-fg-muted mb-6 md:mb-8 text-sm">
          Accedi al tuo account
        </p>

        {error && (
          <div className="mb-4 p-3 bg-danger-bg/50 border border-danger/30 rounded-xl text-danger text-ds-body-sm">
            {error}
            <p className="mt-2 text-xs">
              Se il problema persiste, apri{" "}
              <a href="/api/auth-status" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                /api/auth-status
              </a>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-fg-muted mb-1">Email</label>
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
            <label htmlFor="password" className="block text-sm font-semibold text-fg-muted mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full min-h-[48px] px-4 py-3 border border-white/10 rounded-2xl bg-white/5 text-fg placeholder:text-fg-muted focus:ring-2 focus:ring-primary focus:border-primary input-neon-focus"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || redirecting}
            className="w-full min-h-[48px] bg-primary text-white py-3 px-4 rounded-2xl font-semibold hover:bg-primary-hover border border-white/20 shadow-[0_0_24px_-6px_rgba(var(--primary-glow),0.45)] hover:shadow-[0_0_28px_-4px_rgba(var(--primary-glow),0.5)] focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 transition-all"
          >
            {redirecting ? "Reindirizzamento..." : isLoading ? "Accesso..." : "Accedi"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-fg-muted">Oppure</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || redirecting}
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
            Accedi con Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-fg-muted">
          Non hai un account?{" "}
          <Link href="/auth/signup" className="text-primary hover:text-primary-hover font-semibold focus-visible:underline">
            Registrati
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
