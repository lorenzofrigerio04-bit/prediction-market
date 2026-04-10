"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const inputClass =
  "w-full min-h-[52px] px-4 py-3 rounded-xl border border-white/10 bg-[#0f121b] text-fg placeholder:text-fg-muted/65 transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none focus:border-primary/40 focus:bg-[#121624] focus:ring-2 focus:ring-primary/20";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDismiss = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [router]);

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

      let data: { error?: string; details?: string };
      try {
        data = await response.json();
      } catch {
        setError("Errore nella risposta del server. Verifica che il server sia in esecuzione.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorMessage =
          data.error || data.details || `Errore durante la registrazione (${response.status})`;
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      const loginRes = await fetch("/api/auth/login-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin",
      });

      if (!loginRes.ok) {
        setError("Registrazione completata, ma errore durante il login");
      } else {
        await new Promise((r) => setTimeout(r, 300));
        window.location.href = "/auth/success?callbackUrl=/";
      }
    } catch (err: unknown) {
      console.error("Errore:", err);
      const msg =
        err instanceof Error ? err.message : "Qualcosa è andato storto. Riprova tra poco.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/auth/success?callbackUrl=/" });
    } catch {
      setError("Errore durante la registrazione con Google");
      setIsLoading(false);
    }
  };

  const eyeOpen = (
    <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const eyeClosed = (
    <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.63 17.63 0 0 1-3.06 3.98" />
      <path d="M6.61 6.61C3.73 8.56 2 12 2 12a17.77 17.77 0 0 0 6.07 6.13" />
    </svg>
  );

  const card = (
    <section
      className="relative w-full max-w-[430px] rounded-[24px] border border-white/10 bg-[#0b0f17]/70 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)] backdrop-blur-lg p-5 sm:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative mb-6">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center text-white/80 hover:text-white transition-colors"
          aria-label="Esci dalla registrazione"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="pl-10 font-levels text-[clamp(1rem,calc(0.55rem+4.2vw),3.25rem)] leading-[0.88] tracking-[0.02em] font-bold text-white">
          Registrati
        </h1>
        <p className="pl-10 mt-2 text-sm text-fg-muted/80 max-w-[22rem]">
          Crea account e ricevi 100 crediti per iniziare.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl border border-danger/40 bg-danger/15 text-danger text-ds-body-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Nome (opzionale)"
          />
        </div>

        <div>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
            placeholder="Email"
          />
        </div>

        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={`${inputClass} pr-12`}
            placeholder="Password (min. 6 caratteri)"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 inline-flex items-center justify-center text-fg-muted/60 hover:text-fg-muted/85 transition-colors"
            aria-label={showPassword ? "Nascondi password" : "Mostra password"}
          >
            {showPassword ? eyeOpen : eyeClosed}
          </button>
        </div>

        <div className="relative">
          <input
            id="signup-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className={`${inputClass} pr-12`}
            placeholder="Conferma password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 inline-flex items-center justify-center text-fg-muted/60 hover:text-fg-muted/85 transition-colors"
            aria-label={showPassword ? "Nascondi conferma password" : "Mostra conferma password"}
          >
            {showPassword ? eyeOpen : eyeClosed}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 w-full min-h-[52px] rounded-xl border border-primary/30 bg-primary text-admin-bg font-semibold text-[15px] hover:brightness-105 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg"
        >
          {isLoading ? "Registrazione…" : "Registrati"}
        </button>
      </form>

      <div className="mt-5">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-white/10" />
          </div>
          <p className="relative mx-auto w-fit px-3 text-xs text-fg-muted/75 bg-[#0b0f17]">Oppure continua con</p>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="inline-flex items-center justify-center p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-white/[0.06] active:bg-white/[0.08] transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f17]"
            aria-label="Continua con Google"
            title="Continua con Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-fg-muted/75">
        Hai già un account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-fg-muted hover:text-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:rounded"
        >
          Accedi
        </Link>
      </p>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-fg-muted/60 px-1">
        Registrandoti accetti i{" "}
        <Link
          href="/legal/terms"
          className="text-fg-muted/80 hover:text-fg-muted transition-colors underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:rounded"
        >
          Termini di servizio
        </Link>{" "}
        e la{" "}
        <Link
          href="/legal/privacy"
          className="text-fg-muted/80 hover:text-fg-muted transition-colors underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:rounded"
        >
          Privacy policy
        </Link>
        .
      </p>
    </section>
  );

  return (
    <div className="min-h-dvh bg-transparent text-fg flex flex-col">
      <Header />
      <main className="relative flex-1 flex items-center justify-center px-4 py-8 sm:py-10 bg-admin-bg/40 backdrop-blur-2xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{
            background:
              "radial-gradient(38rem 22rem at 50% 0%, rgba(89,236,244,0.10), transparent 60%), radial-gradient(30rem 18rem at 50% 100%, rgba(89,236,244,0.07), transparent 65%)",
          }}
        />
        {card}
      </main>
    </div>
  );
}
