"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
  const [mounted, setMounted] = useState(false);

  const greetingFull = useMemo(() => {
    if (!subtitleReady) return "";
    return isReturningVisitor ? "Bentornato." : "Ciao.";
  }, [subtitleReady, isReturningVisitor]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    const DURATION_MS = 1800;
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
        // session refetch errors are non-critical; server redirect will fix state
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
    <div
      className="relative w-full max-w-[400px]"
      onClick={(e) => e.stopPropagation()}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {/* Gradient border wrapper */}
      <div
        className="rounded-[28px] p-px"
        style={{
          background: "linear-gradient(160deg, rgba(80,245,252,0.28) 0%, rgba(80,245,252,0.06) 40%, rgba(255,255,255,0.04) 100%)",
        }}
      >
        <section
          className="relative rounded-[27px] overflow-hidden"
          style={{
            background: "rgba(7, 10, 20, 0.96)",
            backdropFilter: "blur(40px)",
          }}
        >
          {/* Top cyan glow accent */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(80,245,252,0.6) 30%, rgba(80,245,252,0.9) 50%, rgba(80,245,252,0.6) 70%, transparent 100%)",
            }}
          />
          {/* Inner ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 rounded-full opacity-15"
            style={{
              background: "radial-gradient(ellipse, rgba(80,245,252,0.5) 0%, transparent 70%)",
            }}
          />

          <div className="relative p-6 sm:p-8">
            {/* Back button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1.5 mb-8 text-white/35 hover:text-white/70 transition-colors duration-200 group"
              aria-label="Torna indietro"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              <span className="text-[11px] font-medium tracking-widest uppercase">Indietro</span>
            </button>

            {/* Brand mark */}
            <div className="mb-6 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(80,245,252,0.2) 0%, rgba(80,245,252,0.05) 100%)",
                  border: "1px solid rgba(80,245,252,0.25)",
                  boxShadow: "0 0 16px -4px rgba(80,245,252,0.4)",
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M8 1L10.5 6H15L11 9.5L12.5 14.5L8 11.5L3.5 14.5L5 9.5L1 6H5.5L8 1Z" fill="rgba(80,245,252,0.9)" />
                </svg>
              </div>
              <span
                className="text-[10px] font-semibold tracking-[0.22em] uppercase"
                style={{ color: "rgba(80,245,252,0.55)" }}
              >
                Prediction Market
              </span>
            </div>

            {/* Greeting */}
            <div className="mb-8">
              <h1
                className="font-display font-bold text-white leading-none tracking-tight"
                style={{ fontSize: "clamp(2.4rem, 8vw, 3.2rem)" }}
                aria-label={greetingFull || undefined}
              >
                {greetingVisible || (subtitleReady ? "\u00A0" : "\u00A0")}
                {greetingFull && greetingVisible.length < greetingFull.length ? (
                  <span
                    className="inline-block w-[0.05em] min-h-[0.8em] ml-[0.03em] align-middle"
                    style={{
                      borderLeft: "2px solid rgba(80,245,252,0.85)",
                      animation: "pulse 1s ease-in-out infinite",
                    }}
                    aria-hidden
                  />
                ) : null}
              </h1>
              <p className="mt-2 text-[13px]" style={{ color: "rgba(169,180,208,0.6)" }}>
                {isReturningVisitor ? "Accedi al tuo account per continuare." : "Inserisci le tue credenziali per accedere."}
              </p>
            </div>

            {/* Error */}
            {(errorFromUrl || error) && (
              <div
                className="mb-5 p-3.5 rounded-xl text-[13px] leading-snug"
                style={{
                  background: "rgba(185,28,28,0.12)",
                  border: "1px solid rgba(185,28,28,0.35)",
                  color: "#f87171",
                }}
                role="alert"
              >
                {errorFromUrl || error}
                <p className="mt-2 text-[11px] opacity-70">
                  Se il problema persiste, apri{" "}
                  <a
                    href="/api/auth-status"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-100 transition-opacity"
                  >
                    /api/auth-status
                  </a>
                  . {NOTE_494}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative group">
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                  style={{ color: "rgba(169,180,208,0.35)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 9l10 6 10-6" />
                  </svg>
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-[52px] pl-11 pr-4 rounded-xl text-[15px] text-white placeholder:text-white/25 transition-all duration-200 focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={e => {
                    e.currentTarget.style.background = "rgba(80,245,252,0.05)";
                    e.currentTarget.style.border = "1px solid rgba(80,245,252,0.35)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(80,245,252,0.08)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Email"
                />
              </div>

              <div className="relative">
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(169,180,208,0.35)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-[52px] pl-11 pr-12 rounded-xl text-[15px] text-white placeholder:text-white/25 transition-all duration-200 focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={e => {
                    e.currentTarget.style.background = "rgba(80,245,252,0.05)";
                    e.currentTarget.style.border = "1px solid rgba(80,245,252,0.35)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(80,245,252,0.08)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                  style={{ color: "rgba(169,180,208,0.4)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(169,180,208,0.75)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(169,180,208,0.4)")}
                  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
                      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.63 17.63 0 0 1-3.06 3.98" />
                      <path d="M6.61 6.61C3.73 8.56 2 12 2 12a17.77 17.77 0 0 0 6.07 6.13" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  className="text-[12px] font-medium tracking-wide transition-colors duration-200"
                  style={{ color: "rgba(80,245,252,0.45)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(80,245,252,0.75)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(80,245,252,0.45)")}
                >
                  Password dimenticata?
                </button>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="relative w-full h-[52px] rounded-xl font-semibold text-[15px] tracking-wide transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(80,245,252,1) 0%, rgba(56,200,210,1) 100%)",
                  color: "#060a12",
                  boxShadow: "0 0 32px -8px rgba(80,245,252,0.6), 0 4px 16px -4px rgba(0,0,0,0.4)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 0 40px -6px rgba(80,245,252,0.75), 0 4px 16px -4px rgba(0,0,0,0.4)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "0 0 32px -8px rgba(80,245,252,0.6), 0 4px 16px -4px rgba(0,0,0,0.4)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span className="relative z-10">
                  {redirecting ? "Reindirizzamento…" : isLoading ? "Accesso in corso…" : "Accedi"}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} aria-hidden />
              <span className="text-[11px] font-medium tracking-[0.15em] uppercase" style={{ color: "rgba(169,180,208,0.35)" }}>
                oppure
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} aria-hidden />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={busy}
              className="mt-4 w-full h-[52px] rounded-xl flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.14)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.09)";
              }}
              aria-label="Continua con Google"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-[14px] font-medium" style={{ color: "rgba(244,246,252,0.7)" }}>
                Continua con Google
              </span>
            </button>

            {/* Footer */}
            <p className="mt-6 text-center text-[13px]" style={{ color: "rgba(169,180,208,0.45)" }}>
              Non hai un account?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold transition-colors duration-200"
                style={{ color: "rgba(80,245,252,0.7)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(80,245,252,1)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(80,245,252,0.7)")}
              >
                Registrati
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
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
          className="absolute inset-0"
          style={{ background: "rgba(3,7,14,0.65)", backdropFilter: "blur(4px)" }}
          onClick={handleDismiss}
          aria-label="Chiudi login"
        />
        <div className="relative z-[1] w-full flex justify-center">{card}</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh text-fg flex flex-col" style={{ background: "#060a12" }}>
      {/* Background ambient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(80,245,252,0.09) 0%, transparent 65%)",
            "radial-gradient(ellipse 60% 40% at 80% 100%, rgba(56,200,210,0.05) 0%, transparent 60%)",
            "radial-gradient(ellipse 50% 30% at 20% 80%, rgba(80,100,252,0.04) 0%, transparent 60%)",
          ].join(", "),
        }}
      />
      {/* Subtle dot grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(169,180,208,0.4) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <main className="relative flex-1 flex items-center justify-center px-4 py-12">
        {card}
      </main>
    </div>
  );
}
