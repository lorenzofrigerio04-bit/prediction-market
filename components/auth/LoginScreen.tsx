"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "Questa email è già usata con un altro metodo di accesso. Accedi con email e password oppure usa sempre lo stesso metodo (solo Google o solo email).",
  CredentialsSignin: "Email o password non corretti. Riprova.",
  OAuthSignin:
    "Accesso con Google non riuscito. Verifica che in .env.local ci siano GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET (crea una credenziale OAuth in Google Cloud Console). Se prima vedevi un errore sul certificato, aggiungi anche NEXTAUTH_INSECURE_SSL_DEV=1 e riavvia il server.",
  Default: "Qualcosa è andato storto. Riprova tra poco.",
};

const NOTE_494 =
  'Se vedi "Request has too large of headers" (errore 494): in Safari vai in Impostazioni > Safari > Cancella cronologia e dati siti web, oppure cancella i dati solo per questo sito, poi riprova.';

const RETURNING_KEY = "pm_returning_visitor";

const inputClass =
  "w-full min-h-[52px] px-4 py-3 rounded-xl border border-white/10 bg-[#0f121b] text-fg placeholder:text-fg-muted/65 transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none focus:border-primary/40 focus:bg-[#121624] focus:ring-2 focus:ring-primary/20";

export type LoginScreenVariant = "page" | "modal";

export default function LoginScreen({ variant }: { variant: LoginScreenVariant }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update: updateSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [subtitleReady, setSubtitleReady] = useState(false);
  const [isReturningVisitor, setIsReturningVisitor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [greetingVisible, setGreetingVisible] = useState("");

  const greetingFull = useMemo(() => {
    if (!subtitleReady) return "";
    return isReturningVisitor ? "Che bello rivederti !" : "È un piacere conoscerti !";
  }, [subtitleReady, isReturningVisitor]);

  useEffect(() => {
    if (!greetingFull) {
      setGreetingVisible("");
      return;
    }
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGreetingVisible(greetingFull);
      return;
    }
    setGreetingVisible("");
    let raf = 0;
    const start = performance.now();
    const DURATION_MS = 2600;
    const easeOutCubic = (x: number) => 1 - (1 - x) ** 3;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const n = Math.round(easeOutCubic(t) * greetingFull.length);
      setGreetingVisible(greetingFull.slice(0, n));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [greetingFull]);

  useEffect(() => {
    try {
      setIsReturningVisitor(localStorage.getItem(RETURNING_KEY) === "1");
    } catch {
      setIsReturningVisitor(false);
    }
    setSubtitleReady(true);
  }, []);

  const errorFromUrl = (() => {
    const err = searchParams.get("error");
    return err ? ERROR_MESSAGES[err] || ERROR_MESSAGES.Default : "";
  })();

  const callbackUrl = (() => {
    const url = searchParams.get("callbackUrl");
    if (url && typeof url === "string" && url.startsWith("/") && !url.startsWith("//")) {
      const pathOnly = url.split("?")[0];
      return pathOnly.length <= 80 ? url : pathOnly;
    }
    return "/";
  })();

  const handleDismiss = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [router]);

  useEffect(() => {
    if (variant !== "modal") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, handleDismiss]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setRedirecting(false);

    try {
      const loginRes = await fetch("/api/auth/login-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin",
      });
      const loginData = await loginRes.json().catch(() => ({}));

      if (!loginRes.ok) {
        const msg =
          typeof loginData?.error === "string"
            ? loginData.error
            : ERROR_MESSAGES.CredentialsSignin;
        setError(loginRes.status === 401 ? ERROR_MESSAGES.CredentialsSignin : msg);
        setIsLoading(false);
        return;
      }
      setRedirecting(true);
      try {
        await updateSession();
      } catch {
        // Ignora errori di refetch; il redirect server-side risolverà
      }
      await new Promise((r) => setTimeout(r, 300));
      const safeCallback = encodeURIComponent(callbackUrl.length > 100 ? "/" : callbackUrl);
      window.location.href = `/auth/success?callbackUrl=${safeCallback}`;
    } catch (err: unknown) {
      console.error("[LoginScreen] Errore durante signIn:", err);
      const errorMsg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Qualcosa è andato storto. Riprova tra poco.";
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError("");
    setRedirecting(true);
    const shortCallback = callbackUrl.length > 100 ? "/" : callbackUrl;
    const successUrl = `/auth/success?callbackUrl=${encodeURIComponent(shortCallback)}`;
    signIn("google", { callbackUrl: successUrl });
  };

  const busy = isLoading || redirecting;

  const card = (
    <section
      className="relative w-full max-w-[430px] rounded-[24px] border border-white/10 bg-[#0b0f17]/90 supports-[backdrop-filter:blur(0px)]:bg-[#0b0f17]/58 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)] supports-[backdrop-filter:blur(0px)]:backdrop-blur-md p-5 sm:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative mb-6">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center text-white/80 hover:text-white transition-colors"
          aria-label="Esci dalla schermata di login"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1
          id={variant === "modal" ? "login-dialog-title" : undefined}
          className="pl-10 font-levels text-[clamp(1rem,calc(0.55rem+4.2vw),3.25rem)] leading-[0.88] tracking-[0.02em] font-bold text-white whitespace-nowrap min-h-[1em]"
          aria-label={greetingFull || undefined}
        >
          {greetingVisible || (subtitleReady ? "" : "\u00A0")}
          {greetingFull && greetingVisible.length < greetingFull.length ? (
            <span
              className="inline-block w-[0.06em] min-h-[0.82em] ml-[0.04em] align-middle border-l-[2.5px] border-white/80 opacity-90 motion-safe:animate-pulse"
              aria-hidden
            />
          ) : null}
        </h1>
      </div>

      {(errorFromUrl || error) && (
        <div
          className="mb-5 p-3.5 rounded-xl border border-danger/40 bg-danger/15 text-danger text-ds-body-sm"
          role="alert"
        >
          {errorFromUrl || error}
          <p className="mt-2 text-ds-micro text-fg-muted">
            Se il problema persiste, apri{" "}
            <a
              href="/api/auth-status"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium text-fg-muted hover:text-fg"
            >
              /api/auth-status
            </a>
            . {NOTE_494}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <input
            id={variant === "modal" ? "login-modal-email" : "login-email"}
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
            id={variant === "modal" ? "login-modal-password" : "login-password"}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`${inputClass} pr-12`}
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 inline-flex items-center justify-center text-fg-muted/60 hover:text-fg-muted/85 transition-colors"
            aria-label={showPassword ? "Nascondi password" : "Mostra password"}
          >
            {showPassword ? (
              <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
                <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.63 17.63 0 0 1-3.06 3.98" />
                <path d="M6.61 6.61C3.73 8.56 2 12 2 12a17.77 17.77 0 0 0 6.07 6.13" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex justify-end -mt-1">
          <button
            type="button"
            className="font-sans text-xs font-medium tracking-wide text-fg-muted/55 hover:text-fg-muted/85 transition-colors"
          >
            Password dimenticata?
          </button>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-1 w-full min-h-[52px] rounded-xl border border-primary/30 bg-primary text-admin-bg font-semibold text-[15px] hover:brightness-105 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg"
        >
          {redirecting ? "Reindirizzamento…" : isLoading ? "Accesso…" : "Accedi"}
        </button>
      </form>

      <div className="mt-5">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" aria-hidden />
          <p className="text-xs text-fg-muted/75 whitespace-nowrap">
            Oppure continua con
          </p>
          <div className="flex-1 h-px bg-white/10" aria-hidden />
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busy}
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
    </section>
  );

  if (variant === "modal") {
    return (
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-8 sm:py-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-[rgba(3,7,14,0.18)] backdrop-blur-0"
          onClick={handleDismiss}
          aria-label="Chiudi login"
        />
        <div className="relative z-[1] w-full flex justify-center">{card}</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-transparent text-fg flex flex-col">
      <main className="relative flex-1 flex items-center justify-center px-4 py-8 sm:py-10 bg-admin-bg/14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-22"
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
