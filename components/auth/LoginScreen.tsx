"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { sanitizePostAuthRedirectPath, withWelcomeCreditsParam } from "@/lib/auth-welcome-credits-url";

function LoginFieldCompleteMark({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span className="signup-field-check-mini pointer-events-none absolute right-2.5 top-1/2 z-[1] -translate-y-1/2" aria-hidden>
      <svg viewBox="0 0 10 10" className="h-[9px] w-[9px]" fill="none" aria-hidden>
        <path d="M2 5.2l2 2 4-4" stroke="rgba(255,255,255,0.92)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied:
    "Per la prima registrazione con Google usa «Registrati». «Accedi» serve solo se hai già un account.",
  OAuthAccountNotLinked:
    "Questa email è già usata con un altro metodo di accesso. Accedi con email e password oppure usa sempre lo stesso metodo (solo Google o solo email).",
  CredentialsSignin: "Email o password non corretti. Riprova.",
  OAuthSignin:
    "Accesso con Google non riuscito. Verifica che in .env.local ci siano GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET (crea una credenziale OAuth in Google Cloud Console). Se prima vedevi un errore sul certificato, aggiungi anche NEXTAUTH_INSECURE_SSL_DEV=1 e riavvia il server.",
  /** Errore generico OAuth lato server (spesso contesto `cookies()` / App Router). */
  Callback:
    "Accesso con Google non completato. Se non hai ancora un account, apri «Registrati» e usa Google da lì. Se hai già un account, riprova tra poco.",
  Default: "Qualcosa è andato storto. Riprova tra poco.",
};

const NOTE_494 =
  'Se vedi "Request has too large of headers" (errore 494): in Safari vai in Impostazioni > Safari > Cancella cronologia e dati siti web, oppure cancella i dati solo per questo sito, poi riprova.';

export type LoginScreenProps = {
  /** Solo contenuto form: usato dentro LoginModal (guscio vetro + X esterni). */
  embedded?: boolean;
  onDismissRequest?: () => void;
};

/** Destinazione passata a /auth/signup quando si apre dal login (propaga ?callbackUrl del login). */
function resolveSignupCallbackUrl(
  callbackFromLogin: string | null | undefined,
  pathnameNow: string | null | undefined
): string {
  const fromLogin =
    typeof callbackFromLogin === "string" &&
    callbackFromLogin.startsWith("/") &&
    !callbackFromLogin.startsWith("//")
      ? callbackFromLogin
      : null;
  if (fromLogin) return fromLogin;
  const p = pathnameNow ?? "/";
  if (p.startsWith("/") && p !== "/auth/signup" && p !== "/auth/login") return p;
  return "/";
}

export default function LoginScreen({ embedded = false, onDismissRequest }: LoginScreenProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status: sessionStatus, data: sessionUser } = useSession();
  const signupHref = `/auth/signup?callbackUrl=${encodeURIComponent(
    resolveSignupCallbackUrl(searchParams.get("callbackUrl"), pathname)
  )}`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [emailComplete, setEmailComplete] = useState(false);
  const [passwordComplete, setPasswordComplete] = useState(false);

  type LoginPhase = "login" | "recovery";
  const [loginPhase, setLoginPhase] = useState<LoginPhase>("login");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [recoveryEmailWarning, setRecoveryEmailWarning] = useState<string | null>(null);
  const [loginInfoMessage, setLoginInfoMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpFocusIdx, setOtpFocusIdx] = useState(0);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const splitOtpDigits = useCallback((code: string) => {
    const clean = code.replace(/\D/g, "").slice(0, 6);
    const chars = [...clean];
    return Array.from({ length: 6 }, (_, j) => chars[j] ?? "");
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (loginPhase !== "recovery") return;
    const t = window.setTimeout(() => {
      otpInputRefs.current[0]?.focus();
      setOtpFocusIdx(0);
    }, 0);
    return () => window.clearTimeout(t);
  }, [loginPhase]);

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordFieldValid = password.length >= 6;

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

  /**
   * Dopo OAuth, a volte si resta su /auth/login?error=… pur essendo loggati (sessione ok, crediti in header).
   * Chiude lo stato incoerente con navigazione completa verso la destinazione + eventuale popup crediti.
   */
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !sessionUser?.user?.id) return;
    if (loginPhase === "recovery") return;

    let cancelled = false;
    void (async () => {
      try {
        const fresh = await getSession();
        if (cancelled || !fresh?.user?.id) return;
        const destBase = sanitizePostAuthRedirectPath(callbackUrl);
        const dest =
          fresh.user.showCreditsWelcome === true ? withWelcomeCreditsParam(destBase) : destBase;

        if (typeof window === "undefined") return;
        const path = window.location.pathname;
        if (path !== "/auth/login" && !path.startsWith("/auth/login/")) return;

        window.location.replace(dest);
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, sessionUser?.user?.id, loginPhase, callbackUrl]);

  const handleDismiss = useCallback(() => {
    if (embedded) {
      if (loginPhase === "recovery") {
        setLoginPhase("login");
        setRecoveryCode("");
        setResetNewPassword("");
        setResetConfirmPassword("");
        setRecoveryEmailWarning(null);
        setError("");
        return;
      }
      onDismissRequest?.();
      return;
    }
    if (typeof window === "undefined") return;
    if (loginPhase === "recovery") {
      setLoginPhase("login");
      setRecoveryCode("");
      setResetNewPassword("");
      setResetConfirmPassword("");
      setRecoveryEmailWarning(null);
      setError("");
      return;
    }
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [embedded, onDismissRequest, router, loginPhase]);

  const handleForgotPassword = async () => {
    setError("");
    setLoginInfoMessage("");
    if (!emailLooksValid) {
      setError("Inserisci la tua email per ricevere il codice di recupero.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        verificationEmailError?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Richiesta non riuscita. Riprova.");
        setIsLoading(false);
        return;
      }
      setRecoveryEmail(email.trim());
      setRecoveryCode("");
      setResetNewPassword("");
      setResetConfirmPassword("");
      setRecoveryEmailWarning(data.verificationEmailError ?? null);
      setLoginPhase("recovery");
      setResendCooldown(0);
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendRecoveryCode = async () => {
    if (resendCooldown > 0 || !recoveryEmail) return;
    setError("");
    setRecoveryEmailWarning(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail.trim() }),
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        verificationEmailError?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Impossibile reinviare il codice.");
        setIsLoading(false);
        return;
      }
      if (data.verificationEmailError) {
        setRecoveryEmailWarning(data.verificationEmailError);
      }
      setResendCooldown(60);
    } catch {
      setError("Errore di rete. Reinvio non riuscito.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryBackToLogin = useCallback(() => {
    setError("");
    setRecoveryCode("");
    setResetNewPassword("");
    setResetConfirmPassword("");
    setRecoveryEmailWarning(null);
    setLoginPhase("login");
  }, []);

  const handleOtpSlotChange = (index: number, raw: string) => {
    const slots = splitOtpDigits(recoveryCode);
    if (raw === "") {
      slots[index] = "";
      setRecoveryCode(slots.join(""));
      return;
    }
    const digit = raw.replace(/\D/g, "").slice(-1).charAt(0) ?? "";
    if (!digit) return;
    slots[index] = digit;
    const joined = slots.join("");
    setRecoveryCode(joined);
    if (index < 5) {
      const next = otpInputRefs.current[index + 1];
      window.requestAnimationFrame(() => next?.focus());
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const slots = splitOtpDigits(recoveryCode);
    if (e.key === "Backspace" && !(e.currentTarget.value || slots[index]) && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
      slots[index - 1] = "";
      setRecoveryCode(slots.join(""));
    }
    if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    setRecoveryCode(text);
    const focusAt = Math.min(text.length, 5);
    window.requestAnimationFrame(() => {
      otpInputRefs.current[focusAt]?.focus();
      setOtpFocusIdx(focusAt);
    });
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = recoveryCode.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) {
      setError("Inserisci le 6 cifre del codice.");
      return;
    }
    if (resetNewPassword.length < 6) {
      setError("La nuova password deve essere di almeno 6 caratteri.");
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setError("Le password non coincidono.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          code,
          newPassword: resetNewPassword,
          confirmPassword: resetConfirmPassword,
        }),
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Reset non riuscito. Riprova.");
        setIsLoading(false);
        return;
      }
      setLoginPhase("login");
      setRecoveryCode("");
      setResetNewPassword("");
      setResetConfirmPassword("");
      setRecoveryEmailWarning(null);
      setPassword("");
      setLoginInfoMessage("Password aggiornata. Accedi con la nuova password.");
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginInfoMessage("");
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
        await getSession();
      } catch {
        /* ignore */
      }

      const destination = callbackUrl.length > 100 ? "/" : callbackUrl;

      /* Stesso redirect della pagina login standalone: l’intercepting route spesso non si chiude
       * con router.replace(callbackUrl) (no-op o history incoerente) e il popup resta aperto. */
      await new Promise((r) => setTimeout(r, 150));
      const safeCallback = encodeURIComponent(destination);
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

  const handleGoogleSignIn = async () => {
    setError("");
    setLoginInfoMessage("");
    setRedirecting(true);
    try {
      const intentRes = await fetch("/api/auth/oauth-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "login" }),
        credentials: "same-origin",
      });
      if (!intentRes.ok) {
        setRedirecting(false);
        setError("Impossibile avviare l’accesso con Google. Riprova.");
        return;
      }
      const shortCallback = sanitizePostAuthRedirectPath(callbackUrl.length > 100 ? "/" : callbackUrl);
      const successUrl = `/auth/success?callbackUrl=${encodeURIComponent(shortCallback)}`;
      await signIn("google", { callbackUrl: successUrl });
    } catch {
      setRedirecting(false);
      setError("Accesso con Google non riuscito. Riprova.");
    }
  };

  const busy = isLoading || redirecting;

  const recoveryOtpClean = recoveryCode.replace(/\D/g, "").slice(0, 6);
  const recoveryOtpAllSix = recoveryOtpClean.length === 6;
  const recoveryOtpSlots = splitOtpDigits(recoveryCode);
  const recoveryOtpH = embedded ? "h-[44px]" : "h-[52px]";
  const recoveryOtpText = embedded ? "text-[1.0625rem]" : "text-lg";

  const revealStyle = embedded
    ? undefined
    : {
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      };

  const loginFormInner = (
    <>
      {loginPhase === "recovery" ? (
        <>
          <div className="mb-5">
            <h1
              id="login-recovery-title"
              className="text-center font-kalshi text-[1.5rem] font-bold tracking-[0.02em] text-white sm:text-[1.65rem]"
            >
              Recupero password
            </h1>
            <div
              className="signup-premium-rule signup-premium-rule--recovery mx-auto my-3.5 max-w-[248px]"
              role="presentation"
            />
            <p
              className="mx-auto max-w-[19.5rem] text-center text-[11.5px] leading-relaxed tracking-[0.01em] text-white/[0.74] antialiased sm:text-[12px]"
            >
              Inserisci il codice a 6 cifre che abbiamo inviato a{" "}
              <span className="font-medium text-white/[0.88]">{recoveryEmail}</span>. Controlla la posta
              (anche spam) e scegli la nuova password.
            </p>
          </div>

          {recoveryEmailWarning ? (
            <div
              className="mb-4 rounded-xl p-3 text-[12px] leading-snug sm:p-3.5 sm:text-[13px]"
              style={{
                background: "rgba(234,179,8,0.12)",
                border: "1px solid rgba(234,179,8,0.35)",
                color: "#fbbf24",
              }}
              role="status"
            >
              {recoveryEmailWarning}{" "}
              Puoi toccare <span className="font-medium">Reinvia</span> qui sotto tra un attimo.
            </div>
          ) : null}

          {error ? (
            <div
              aria-live="polite"
              className="mb-4 rounded-xl p-3 text-[12px] leading-snug sm:p-3.5 sm:text-[13px]"
              style={{
                background: "rgba(185,28,28,0.12)",
                border: "1px solid rgba(185,28,28,0.35)",
                color: "#f87171",
              }}
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleRecoverySubmit} className="space-y-3.5">
            <div>
              <p className="mb-2.5 text-center font-kalshi text-[13px] font-semibold tracking-[0.04em] text-white/[0.92] sm:text-[14px]">
                Codice dall&apos;email
              </p>
              <div
                className="flex w-full justify-center gap-2 sm:gap-[0.6rem]"
                onPasteCapture={handleOtpPaste}
              >
                {recoveryOtpSlots.map((digit, idx) => {
                  const lockedGreen = !!digit && (otpFocusIdx !== idx || recoveryOtpAllSix);
                  return (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={idx === 0 ? "one-time-code" : "off"}
                      name={idx === 0 ? "one-time-code" : undefined}
                      maxLength={1}
                      aria-label={`Cifra ${idx + 1} di 6`}
                      id={idx === 0 ? "login-recovery-digit-1" : `login-recovery-digit-${idx + 1}`}
                      value={digit}
                      onFocus={() => setOtpFocusIdx(idx)}
                      onChange={(e) => handleOtpSlotChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`max-w-[50px] min-w-0 flex-1 shrink rounded-[13px] text-center tabular-nums outline-none transition-all duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${recoveryOtpH} ${recoveryOtpText} font-semibold`}
                      style={
                        lockedGreen
                          ? {
                              border: "1px solid rgba(45,216,173,0.65)",
                              background: "linear-gradient(180deg, rgba(10,42,38,0.55) 0%, rgba(6,26,28,0.72) 100%)",
                              color: "rgba(252,253,254,0.97)",
                              boxShadow:
                                "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(56,239,206,0.22), 0 0 22px -6px rgba(42,217,169,0.48), 0 0 12px -4px rgba(80,245,252,0.18)",
                            }
                          : {
                              border: "1px solid rgba(255,255,255,0.1)",
                              background: "rgba(255,255,255,0.05)",
                              color: "rgba(252,253,254,0.94)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                            }
                      }
                    />
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div
                className="pointer-events-none absolute left-3.5 top-1/2 z-[2] -translate-y-1/2"
                style={{ color: "rgba(169,180,208,0.38)" }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                id="login-reset-new-password"
                type={showResetNewPassword ? "text" : "password"}
                autoComplete="new-password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                required
                placeholder="Nuova password"
                className="h-11 w-full rounded-full border border-white/[0.1] bg-white/[0.06] pl-11 pr-11 text-[13px] text-white backdrop-blur-sm transition-[box-shadow,border-color,background-color] duration-300 ease-out placeholder:text-white/28 focus:border-cyan-400/45 focus:bg-white/[0.08] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowResetNewPassword((v) => !v)}
                className="absolute right-3 top-1/2 z-[2] -translate-y-1/2 transition-colors duration-200"
                style={{ color: "rgba(169,180,208,0.42)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(169,180,208,0.78)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(169,180,208,0.42)")}
                aria-label={showResetNewPassword ? "Nascondi password" : "Mostra password"}
              >
                {showResetNewPassword ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
                    <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.63 17.63 0 0 1-3.06 3.98" />
                    <path d="M6.61 6.61C3.73 8.56 2 12 2 12a17.77 17.77 0 0 0 6.07 6.13" />
                  </svg>
                )}
              </button>
            </div>

            <div className="relative">
              <div
                className="pointer-events-none absolute left-3.5 top-1/2 z-[2] -translate-y-1/2"
                style={{ color: "rgba(169,180,208,0.38)" }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                id="login-reset-confirm-password"
                type={showResetConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                required
                placeholder="Conferma nuova password"
                className="h-11 w-full rounded-full border border-white/[0.1] bg-white/[0.06] pl-11 pr-11 text-[13px] text-white backdrop-blur-sm transition-[box-shadow,border-color,background-color] duration-300 ease-out placeholder:text-white/28 focus:border-cyan-400/45 focus:bg-white/[0.08] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowResetConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 z-[2] -translate-y-1/2 transition-colors duration-200"
                style={{ color: "rgba(169,180,208,0.42)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(169,180,208,0.78)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(169,180,208,0.42)")}
                aria-label={showResetConfirmPassword ? "Nascondi password" : "Mostra password"}
              >
                {showResetConfirmPassword ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
                    <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.63 17.63 0 0 1-3.06 3.98" />
                    <path d="M6.61 6.61C3.73 8.56 2 12 2 12a17.77 17.77 0 0 0 6.07 6.13" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="signup-cta-premium-outline relative z-[2] mt-1 w-full disabled:pointer-events-none disabled:opacity-35"
            >
              <span className="relative z-[2]">{isLoading ? "Aggiornamento…" : "Reimposta password"}</span>
            </button>
          </form>

          <p className="mt-3.5 text-center text-[11.5px]" style={{ color: "rgba(169,180,208,0.58)" }}>
            Non ti è arrivato?{" "}
            {resendCooldown > 0 ? (
              <>
                <span className="font-semibold" style={{ color: "rgba(80,245,252,0.45)" }}>
                  Reinvia
                </span>{" "}
                tra {resendCooldown}s
              </>
            ) : (
              <button
                type="button"
                onClick={handleResendRecoveryCode}
                disabled={isLoading}
                className="rounded-sm border-none bg-transparent p-0 font-semibold underline underline-offset-[5px] transition-[opacity] duration-200 disabled:pointer-events-none disabled:opacity-35 hover:opacity-95"
                style={{
                  color: "rgba(80,245,252,0.96)",
                  textDecorationColor: "rgba(80,245,252,0.42)",
                  cursor: "pointer",
                }}
              >
                Reinvia
              </button>
            )}
          </p>

          <button
            type="button"
            onClick={handleRecoveryBackToLogin}
            className="mt-2.5 w-full text-center text-[11.5px] transition-opacity duration-200 hover:opacity-80 sm:text-[12px]"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            ← Torna al login
          </button>
        </>
      ) : (
        <>
          <div className="mb-5">
            {loginInfoMessage.startsWith("Password aggiornata") ? (
              <>
                <h1
                  id="login-dialog-title"
                  className="text-center font-kalshi text-[1.5rem] font-bold tracking-[0.02em] text-white sm:text-[1.65rem]"
                  role="status"
                  aria-live="polite"
                >
                  Password aggiornata!
                </h1>
                <div className="signup-premium-rule mx-auto my-3.5 max-w-[228px]" role="presentation" />
                <p className="mx-auto max-w-[292px] text-center text-[11.5px] leading-relaxed tracking-[0.01em] text-white/[0.74] antialiased sm:text-[12px]">
                  Accedi con la nuova password.
                </p>
              </>
            ) : (
              <>
                <h1
                  id="login-dialog-title"
                  className="text-center font-kalshi text-[1.5rem] font-bold tracking-[0.02em] text-white sm:text-[1.65rem]"
                >
                  Bentornato!
                </h1>
                <div className="signup-premium-rule mx-auto my-3.5 max-w-[228px]" role="presentation" />
                <p className="mx-auto max-w-[292px] text-center text-[11.5px] leading-relaxed tracking-[0.01em] text-white/[0.74] antialiased sm:text-[12px]">
                  Accedi per continuare.
                </p>
              </>
            )}
          </div>

          {loginInfoMessage && !loginInfoMessage.startsWith("Password aggiornata") ? (
            <div className="mb-5 text-center" role="status" aria-live="polite">
              <p className="mx-auto max-w-[18rem] font-kalshi text-[12.5px] font-medium leading-relaxed tracking-[0.03em] text-white/[0.72] sm:text-[13px]">
                {loginInfoMessage}
              </p>
            </div>
          ) : null}

          {(errorFromUrl || error) && (
            <div
              aria-live="polite"
              className="mb-4 rounded-xl p-3 text-[12px] leading-snug sm:p-3.5 sm:text-[13px]"
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
                  className="underline transition-opacity hover:opacity-100"
                >
                  /api/auth-status
                </a>
                . {NOTE_494}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="relative">
              <div
                className="pointer-events-none absolute left-3.5 top-1/2 z-[2] -translate-y-1/2"
                style={{ color: "rgba(169,180,208,0.38)" }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 9l10 6 10-6" />
                </svg>
              </div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailComplete && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) {
                    setEmailComplete(false);
                  }
                }}
                onBlur={() => {
                  if (emailLooksValid) setEmailComplete(true);
                }}
                required
                placeholder="Email"
                className={`h-11 w-full rounded-full border border-white/[0.1] bg-white/[0.06] pl-11 text-[13px] text-white backdrop-blur-sm transition-[box-shadow,border-color,background-color] duration-300 ease-out placeholder:text-white/28 focus:border-cyan-400/45 focus:bg-white/[0.08] focus:outline-none ${
                  emailComplete ? "pr-11" : "pr-4"
                }`}
              />
              <LoginFieldCompleteMark visible={emailComplete} />
            </div>

            <div className="relative">
              <div
                className="pointer-events-none absolute left-3.5 top-1/2 z-[2] -translate-y-1/2"
                style={{ color: "rgba(169,180,208,0.38)" }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordComplete && e.target.value.length < 6) setPasswordComplete(false);
                }}
                onBlur={() => {
                  if (passwordFieldValid) setPasswordComplete(true);
                }}
                required
                placeholder="Password"
                className={`h-11 w-full rounded-full border border-white/[0.1] bg-white/[0.06] pl-11 text-[13px] text-white backdrop-blur-sm transition-[box-shadow,border-color,background-color] duration-300 ease-out placeholder:text-white/28 focus:border-cyan-400/45 focus:bg-white/[0.08] focus:outline-none ${
                  passwordComplete ? "pr-[3.25rem]" : "pr-11"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={`absolute top-1/2 z-[2] -translate-y-1/2 transition-colors duration-200 ${
                  passwordComplete ? "right-9" : "right-3"
                }`}
                style={{ color: "rgba(169,180,208,0.42)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(169,180,208,0.78)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(169,180,208,0.42)")}
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
                    <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.63 17.63 0 0 1-3.06 3.98" />
                    <path d="M6.61 6.61C3.73 8.56 2 12 2 12a17.77 17.77 0 0 0 6.07 6.13" />
                  </svg>
                )}
              </button>
              <LoginFieldCompleteMark visible={passwordComplete} />
            </div>

            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={busy}
                className="text-[11px] font-medium tracking-[0.08em] text-white/[0.48] antialiased transition-[color,text-shadow] duration-300 ease-out hover:text-white/[0.78] disabled:pointer-events-none disabled:opacity-35"
                style={{
                  textShadow: "0 1px 0 rgba(255,255,255,0.04), 0 0 20px rgba(255,255,255,0.03)",
                }}
              >
                Password dimenticata?
              </button>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="signup-cta-premium-outline relative z-[2] mt-4 w-full disabled:pointer-events-none disabled:opacity-35"
            >
              <span className="relative z-[2]">
                {redirecting ? "Reindirizzamento…" : isLoading ? "Accesso in corso…" : "Accedi"}
              </span>
            </button>
          </form>

          <div className="mt-4 flex items-center gap-2.5 px-0.5">
            <div className="h-px min-w-0 flex-1 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />
            <span className="shrink-0 font-kalshi text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
              oppure
            </span>
            <div className="h-px min-w-0 flex-1 rounded-full bg-gradient-to-l from-transparent via-white/10 to-transparent" aria-hidden />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busy}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] text-[13px] transition-[background,border-color,transform] duration-300 ease-out hover:border-white/16 hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-40"
            aria-label="Continua con Google"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="font-medium text-white/72">Continua con Google</span>
          </button>

          <p className="mt-4 text-center text-[12px]" style={{ color: "rgba(169,180,208,0.45)" }}>
            Non hai un account?{" "}
            <Link
              href={signupHref}
              className="font-semibold transition-colors duration-200"
              style={{ color: "rgba(80,245,252,0.72)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(80,245,252,1)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(80,245,252,0.72)")}
            >
              Registrati
            </Link>
          </p>
        </>
      )}
    </>
  );

  if (embedded) {
    return (
      <section className="relative overflow-visible rounded-none bg-transparent">
        {loginFormInner}
      </section>
    );
  }

  const card = (
    <div
      className="relative w-full max-w-[400px]"
      onClick={(e) => e.stopPropagation()}
      style={revealStyle}
    >
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
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(80,245,252,0.6) 30%, rgba(80,245,252,0.9) 50%, rgba(80,245,252,0.6) 70%, transparent 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 rounded-full opacity-15"
            style={{
              background: "radial-gradient(ellipse, rgba(80,245,252,0.5) 0%, transparent 70%)",
            }}
          />

          <div className="relative px-6 pb-6 pt-11 sm:px-8 sm:pb-8 sm:pt-12">
            <button
              type="button"
              onClick={handleDismiss}
              className="signup-modal-close-x absolute right-2 top-2 z-10 sm:right-3 sm:top-3"
              aria-label="Chiudi"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {loginFormInner}
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col text-fg md:min-h-[32rem]" style={{ background: "#060a12" }}>
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
