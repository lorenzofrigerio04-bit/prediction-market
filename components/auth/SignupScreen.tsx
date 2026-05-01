"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { INITIAL_CREDITS } from "@/lib/credits-config";
import {
  sanitizePostAuthRedirectPath,
  withWelcomeCreditsParam,
} from "@/lib/auth-welcome-credits-url";
import VirtualCreditsGlyph from "@/components/ui/VirtualCreditsGlyph";
import SignupWelcomeCreditsReveal from "@/components/auth/SignupWelcomeCreditsReveal";

function SignupFieldCompleteMark({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span className="signup-field-check-mini pointer-events-none absolute right-2.5 top-1/2 z-[1] -translate-y-1/2" aria-hidden>
      <svg viewBox="0 0 10 10" className="h-[9px] w-[9px]" fill="none" aria-hidden>
        <path d="M2 5.2l2 2 4-4" stroke="rgba(255,255,255,0.92)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export type SignupScreenProps = {
  /** Rendering inside SignupModal: no page chrome,-dismiss closes overlay */
  embedded?: boolean;
  onDismissRequest?: () => void;
  /** Modal intercepted: dopo congratulations naviga in SPA senza hard reload. */
  welcomeNavigateEmbedded?: () => void;
  /** Pagina /auth/signup standalone: redirect post-congratulations (auth/success). Default "/". */
  authSuccessCallbackUrl?: string;
  /** Solo embedded: notifica step per tema scrim (es. welcome = sfondo più scuro). */
  onEmbeddedFlowStepChange?: (step: "form" | "verify" | "welcome") => void;
};

export default function SignupScreen({
  embedded = false,
  onDismissRequest,
  welcomeNavigateEmbedded,
  authSuccessCallbackUrl,
  onEmbeddedFlowStepChange,
}: SignupScreenProps = {}) {
  const router = useRouter();
  const { status: sessionStatus, data: sessionData } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  type SignupStep = "form" | "verify" | "welcome";
  const [step, setStep] = useState<SignupStep>("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [emailSendWarning, setEmailSendWarning] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpFocusIdx, setOtpFocusIdx] = useState(0);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [nameComplete, setNameComplete] = useState(false);
  const [emailComplete, setEmailComplete] = useState(false);
  const [passwordComplete, setPasswordComplete] = useState(false);

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
    if (step !== "verify") return;
    const t = window.setTimeout(() => {
      otpInputRefs.current[0]?.focus();
      setOtpFocusIdx(0);
    }, 0);
    return () => window.clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (!embedded) return;
    onEmbeddedFlowStepChange?.(step);
  }, [embedded, step, onEmbeddedFlowStepChange]);

  /**
   * Stesso incrocio del login: OAuth ok ma URL ancora /auth/signup con errore o modale aperto.
   */
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !sessionData?.user?.id) return;
    if (step !== "form") return;

    let cancelled = false;
    void (async () => {
      try {
        const fresh = await getSession();
        if (cancelled || !fresh?.user?.id) return;
        const destBase = sanitizePostAuthRedirectPath(
          typeof authSuccessCallbackUrl === "string" &&
            authSuccessCallbackUrl.startsWith("/") &&
            !authSuccessCallbackUrl.startsWith("//")
            ? authSuccessCallbackUrl
            : "/"
        );
        const dest =
          fresh.user.showCreditsWelcome === true ? withWelcomeCreditsParam(destBase) : destBase;

        if (typeof window === "undefined") return;
        const path = window.location.pathname;
        if (path !== "/auth/signup" && !path.startsWith("/auth/signup/")) return;

        window.location.replace(dest);
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, sessionData?.user?.id, step, authSuccessCallbackUrl]);

  const splitOtpDigits = useCallback((code: string) => {
    const clean = code.replace(/\D/g, "").slice(0, 6);
    const chars = [...clean];
    return Array.from({ length: 6 }, (_, j) => chars[j] ?? "");
  }, []);

  const handleDismiss = useCallback(() => {
    if (embedded) {
      if (step === "verify") {
        setStep("form");
        return;
      }
      onDismissRequest?.();
      return;
    }
    if (typeof window === "undefined") return;
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [embedded, onDismissRequest, router, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Inserisci nome e cognome");
      return;
    }

    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }

    setIsLoading(true);

    const emailTrimmed = email.trim();

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailTrimmed,
          password,
          name: name.trim(),
        }),
      });

      let data: { error?: string; details?: string; verificationEmailError?: string; pendingVerification?: boolean };
      try {
        data = await response.json();
      } catch {
        setError("Errore nella risposta del server.");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || data.details || `Errore durante la registrazione (${response.status})`);
        setIsLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 120));
      setRegisteredEmail(emailTrimmed);
      setVerificationCode("");
      setEmailSendWarning(data.verificationEmailError ?? null);
      setStep("verify");
      setResendCooldown(0);
    } catch (err: unknown) {
      console.error("Errore:", err);
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto. Riprova tra poco.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const intentRes = await fetch("/api/auth/oauth-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "signup" }),
        credentials: "same-origin",
      });
      if (!intentRes.ok) {
        setError("Impossibile avviare la registrazione con Google. Riprova.");
        setIsLoading(false);
        return;
      }
      const dest = sanitizePostAuthRedirectPath(
        typeof authSuccessCallbackUrl === "string" &&
          authSuccessCallbackUrl.startsWith("/") &&
          !authSuccessCallbackUrl.startsWith("//")
          ? authSuccessCallbackUrl
          : "/"
      );
      await signIn("google", { callbackUrl: `/auth/success?callbackUrl=${encodeURIComponent(dest)}` });
    } catch {
      setError("Errore durante la registrazione con Google");
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = verificationCode.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) {
      setError("Inserisci le 6 cifre del codice.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail.trim(), code }),
        credentials: "same-origin",
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(payload.error ?? "Codice non valido o scaduto. Riprova.");
        setIsLoading(false);
        return;
      }
      const loginRes = await fetch("/api/auth/login-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registeredEmail.trim(),
          password,
        }),
        credentials: "same-origin",
      });
      if (!loginRes.ok) {
        setPassword("");
        setError(
          "Account verificato, ma il login automatico è fallito. Accedi dalla pagina di login con la tua email e password.",
        );
        setIsLoading(false);
        setStep("form");
        return;
      }
      setPassword("");
      setStep("welcome");
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setEmailSendWarning(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/resend-signup-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail.trim() }),
        credentials: "same-origin",
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(payload.error ?? "Impossibile reinviare il codice.");
        setIsLoading(false);
        return;
      }
      setResendCooldown(60);
    } catch {
      setError("Errore di rete. Reinvio non riuscito.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyBackToForm = useCallback(() => {
    setError("");
    setVerificationCode("");
    setStep("form");
  }, []);

  const handleOtpSlotChange = (index: number, raw: string) => {
    const slots = splitOtpDigits(verificationCode);
    if (raw === "") {
      slots[index] = "";
      setVerificationCode(slots.join(""));
      return;
    }
    const digit = raw.replace(/\D/g, "").slice(-1).charAt(0) ?? "";
    if (!digit) return;
    slots[index] = digit;
    const joined = slots.join("");
    setVerificationCode(joined);
    if (index < 5) {
      const next = otpInputRefs.current[index + 1];
      window.requestAnimationFrame(() => {
        next?.focus();
      });
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const slots = splitOtpDigits(verificationCode);
    if (e.key === "Backspace" && !(e.currentTarget.value || slots[index]) && index > 0) {
      e.preventDefault();
      const prev = otpInputRefs.current[index - 1];
      prev?.focus();
      slots[index - 1] = "";
      setVerificationCode(slots.join(""));
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
    setVerificationCode(text);
    const focusAt = Math.min(text.length, 5);
    window.requestAnimationFrame(() => {
      otpInputRefs.current[focusAt]?.focus();
      setOtpFocusIdx(focusAt);
    });
  };

  const eyeOpen = (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  const eyeClosed = (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a17.63 17.63 0 0 1-3.06 3.98" />
      <path d="M6.61 6.61C3.73 8.56 2 12 2 12a17.77 17.77 0 0 0 6.07 6.13" />
    </svg>
  );

  const revealStyle = embedded
    ? undefined
    : {
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      };

  const padInner = embedded ? "relative px-0 py-0" : "relative p-6 sm:p-8";

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const nameFieldValid = name.trim().length >= 2;
  const passwordFieldValid = password.length >= 6;

  const signupFormShell = (inner: ReactNode) =>
    embedded ? (
      <section className="relative overflow-visible rounded-none bg-transparent">{inner}</section>
    ) : (
      <div
        className="rounded-[28px] p-px"
        style={{
          background:
            "linear-gradient(160deg, rgba(80,245,252,0.28) 0%, rgba(80,245,252,0.06) 40%, rgba(255,255,255,0.04) 100%)",
        }}
      >
        <section
          className="relative rounded-[27px] overflow-hidden"
          style={{ background: "rgba(7, 10, 20, 0.96)", backdropFilter: "blur(40px)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(80,245,252,0.6) 30%, rgba(80,245,252,0.9) 50%, rgba(80,245,252,0.6) 70%, transparent 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 rounded-full opacity-15"
            style={{
              background: "radial-gradient(ellipse, rgba(80,245,252,0.5) 0%, transparent 70%)",
            }}
          />
          {inner}
        </section>
      </div>
    );

  const card = (
    <div className={`relative w-full ${embedded ? "" : "max-w-[400px]"}`} style={revealStyle}>
      {signupFormShell(
        <div className={padInner}>
            {/* Indietro rimosso: X è dentro ogni step */}

            {step === "form" ? (
              embedded ? (
                <>
                  <div className="mb-5">
                    <h1 className="text-center font-kalshi text-[1.5rem] font-bold tracking-[0.02em] text-white sm:text-[1.65rem]">
                      Benvenuto!
                    </h1>
                    <div className="signup-premium-rule mx-auto my-3.5 max-w-[228px]" role="presentation" />
                    <p
                      className="mx-auto max-w-[292px] text-center text-[11.5px] leading-relaxed tracking-[0.01em] text-white/[0.74] antialiased sm:text-[12px]"
                    >
                      <span>Creando il tuo account ricevi </span>
                      <span
                        className="inline font-kalshi font-bold tabular-nums tracking-[0.02em] text-white/[0.96]"
                        style={{
                          textShadow:
                            "0 0 26px rgba(80,245,252,0.18), 0 1px 0 rgba(255,255,255,0.1)",
                        }}
                      >
                        {INITIAL_CREDITS.toLocaleString("it-IT")}
                      </span>
                      <VirtualCreditsGlyph
                        className="relative -top-[0.06em] mx-0.5 inline-block size-[14px] shrink-0 align-middle opacity-95 sm:size-[15px]"
                        aria-hidden
                      />
                    </p>
                  </div>

                  {error ? (
                    <div
                      className="mb-4 rounded-xl p-3 text-[12px] leading-snug"
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

                  <form onSubmit={handleSubmit} className="space-y-2.5">
                    <div className="relative">
                      <div
                        className="pointer-events-none absolute left-3.5 top-1/2 z-[2] -translate-y-1/2"
                        style={{ color: "rgba(169,180,208,0.38)" }}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                      </div>
                      <input
                        id="signup-name"
                        ref={nameRef}
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); if (nameComplete && e.target.value.trim().length < 2) setNameComplete(false); }}
                        onBlur={() => { if (nameFieldValid) { setNameComplete(true); emailRef.current?.focus(); } }}
                        required
                        placeholder="Nome e cognome"
                        className={`h-11 w-full rounded-full border border-white/[0.1] bg-white/[0.06] pl-11 text-[13px] text-white backdrop-blur-sm transition-[box-shadow,border-color,background-color] duration-300 ease-out placeholder:text-white/28 focus:border-cyan-400/45 focus:bg-white/[0.08] focus:outline-none ${
                          nameComplete ? "pr-11" : "pr-4"
                        }`}
                      />
                      <SignupFieldCompleteMark visible={nameComplete} />
                    </div>

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
                        id="signup-email"
                        ref={emailRef}
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (emailComplete && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) setEmailComplete(false); }}
                        onBlur={() => { if (emailLooksValid) { setEmailComplete(true); passwordRef.current?.focus(); } }}
                        required
                        placeholder="Email"
                        className={`h-11 w-full rounded-full border border-white/[0.1] bg-white/[0.06] pl-11 text-[13px] text-white backdrop-blur-sm transition-[box-shadow,border-color,background-color] duration-300 ease-out placeholder:text-white/28 focus:border-cyan-400/45 focus:bg-white/[0.08] focus:outline-none ${
                          emailComplete ? "pr-11" : "pr-4"
                        }`}
                      />
                      <SignupFieldCompleteMark visible={emailComplete} />
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
                        id="signup-password"
                        ref={passwordRef}
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (passwordComplete && e.target.value.length < 6) setPasswordComplete(false); }}
                        onBlur={() => { if (passwordFieldValid) setPasswordComplete(true); }}
                        required
                        minLength={6}
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
                        {showPassword ? eyeOpen : eyeClosed}
                      </button>
                      <SignupFieldCompleteMark visible={passwordComplete} />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="signup-cta-premium-outline relative z-[2] mt-4 w-full disabled:pointer-events-none disabled:opacity-35"
                    >
                      <span className="relative z-[2]">{isLoading ? "Registrazione…" : "Crea account"}</span>
                    </button>
                  </form>

                  <div className="mt-4 flex items-center gap-2.5 px-0.5">
                    <div
                      className="h-px min-w-0 flex-1 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      aria-hidden
                    />
                    <span
                      className="shrink-0 text-[9.5px] font-semibold uppercase tracking-[0.24em] text-white/35"
                    >
                      oppure
                    </span>
                    <div
                      className="h-px min-w-0 flex-1 rounded-full bg-gradient-to-l from-transparent via-white/10 to-transparent"
                      aria-hidden
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
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
                    Hai già un account?{" "}
                    <Link
                      href="/auth/login"
                      className="font-semibold transition-colors duration-200"
                      style={{ color: "rgba(80,245,252,0.72)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(80,245,252,1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(80,245,252,0.72)")}
                    >
                      Accedi
                    </Link>
                  </p>
                  <p className="mt-2 px-0.5 text-center text-[10px] leading-relaxed text-white/32">
                    Registrandoti accetti i{" "}
                    <Link href="/legal/terms" className="text-white/32 underline-offset-2 transition-opacity hover:opacity-70">
                      Termini di servizio
                    </Link>{" "}
                    e la{" "}
                    <Link href="/legal/privacy" className="text-white/32 underline-offset-2 transition-opacity hover:opacity-70">
                      Privacy policy
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <>
                  {/* X close — top right, barely visible */}
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="absolute right-4 top-4 z-10 grid place-items-center w-[34px] h-[34px] rounded-full border-none bg-white/[0.03] transition-[color,background] duration-300 cursor-pointer"
                    style={{ color: "rgba(255,255,255,0.14)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.42)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.055)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.14)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                    aria-label="Chiudi"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                      <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  <div className="mb-5">
                    <h1 className="text-center font-kalshi text-[1.65rem] font-bold tracking-[0.02em] text-white sm:text-[1.85rem]">
                      Benvenuto!
                    </h1>
                    <div className="signup-premium-rule mx-auto my-3.5 max-w-[240px]" role="presentation" />
                    <p
                      className="mx-auto max-w-[314px] text-center text-[12px] leading-relaxed tracking-[0.01em] text-white/[0.72] antialiased sm:text-[13px]"
                    >
                      <span>Creando il tuo account ricevi </span>
                      <span
                        className="inline font-kalshi font-bold tabular-nums tracking-[0.02em] text-white/[0.96]"
                        style={{
                          textShadow:
                            "0 0 28px rgba(80,245,252,0.2), 0 1px 0 rgba(255,255,255,0.1)",
                        }}
                      >
                        {INITIAL_CREDITS.toLocaleString("it-IT")}
                      </span>
                      <VirtualCreditsGlyph
                        className="relative -top-[0.06em] mx-0.5 inline-block size-[15px] shrink-0 align-middle opacity-95"
                        aria-hidden
                      />
                    </p>
                  </div>

                  {error ? (
                    <div
                      className="mb-5 rounded-xl p-3.5 text-[13px] leading-snug"
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

                  <form onSubmit={handleSubmit} className="space-y-2.5">
                    <div className="relative">
                      <div
                        className="pointer-events-none absolute left-3.5 top-1/2 z-[2] -translate-y-1/2"
                        style={{ color: "rgba(169,180,208,0.38)" }}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                      </div>
                      <input
                        id="signup-name-full"
                        ref={nameRef}
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); if (nameComplete && e.target.value.trim().length < 2) setNameComplete(false); }}
                        onBlur={() => { if (nameFieldValid) { setNameComplete(true); emailRef.current?.focus(); } }}
                        required
                        placeholder="Nome e cognome"
                        className={`h-11 w-full rounded-full border border-white/[0.1] bg-white/[0.06] pl-11 text-[13px] text-white backdrop-blur-sm transition-[box-shadow,border-color,background-color] duration-300 ease-out placeholder:text-white/28 focus:border-cyan-400/45 focus:bg-white/[0.08] focus:outline-none ${
                          nameComplete ? "pr-11" : "pr-4"
                        }`}
                      />
                      <SignupFieldCompleteMark visible={nameComplete} />
                    </div>

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
                        id="signup-email-full"
                        ref={emailRef}
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (emailComplete && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) setEmailComplete(false); }}
                        onBlur={() => { if (emailLooksValid) { setEmailComplete(true); passwordRef.current?.focus(); } }}
                        required
                        placeholder="Email"
                        className={`h-11 w-full rounded-full border border-white/[0.1] bg-white/[0.06] pl-11 text-[13px] text-white backdrop-blur-sm transition-[box-shadow,border-color,background-color] duration-300 ease-out placeholder:text-white/28 focus:border-cyan-400/45 focus:bg-white/[0.08] focus:outline-none ${
                          emailComplete ? "pr-11" : "pr-4"
                        }`}
                      />
                      <SignupFieldCompleteMark visible={emailComplete} />
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
                        id="signup-password-full"
                        ref={passwordRef}
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (passwordComplete && e.target.value.length < 6) setPasswordComplete(false); }}
                        onBlur={() => { if (passwordFieldValid) setPasswordComplete(true); }}
                        required
                        minLength={6}
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
                        {showPassword ? eyeOpen : eyeClosed}
                      </button>
                      <SignupFieldCompleteMark visible={passwordComplete} />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="signup-cta-premium-outline relative z-[2] mt-4 w-full disabled:pointer-events-none disabled:opacity-35"
                    >
                      <span className="relative z-[2]">{isLoading ? "Registrazione…" : "Crea account"}</span>
                    </button>
                  </form>

                  <div className="mt-4 flex items-center gap-2.5 px-0.5">
                    <div
                      className="h-px min-w-0 flex-1 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      aria-hidden
                    />
                    <span
                      className="shrink-0 text-[9.5px] font-semibold uppercase tracking-[0.24em] text-white/35"
                    >
                      oppure
                    </span>
                    <div
                      className="h-px min-w-0 flex-1 rounded-full bg-gradient-to-l from-transparent via-white/10 to-transparent"
                      aria-hidden
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
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
                    Hai già un account?{" "}
                    <Link
                      href="/auth/login"
                      className="font-semibold transition-colors duration-200"
                      style={{ color: "rgba(80,245,252,0.72)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(80,245,252,1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(80,245,252,0.72)")}
                    >
                      Accedi
                    </Link>
                  </p>
                  <p className="mt-2 px-0.5 text-center text-[10px] leading-relaxed text-white/32">
                    Registrandoti accetti i{" "}
                    <Link href="/legal/terms" className="text-white/32 underline-offset-2 transition-opacity hover:opacity-70">
                      Termini di servizio
                    </Link>{" "}
                    e la{" "}
                    <Link href="/legal/privacy" className="text-white/32 underline-offset-2 transition-opacity hover:opacity-70">
                      Privacy policy
                    </Link>
                    .
                  </p>
                </>
              )
            ) : null}

            {step === "verify" ? (() => {
              const otpClean = verificationCode.replace(/\D/g, "").slice(0, 6);
              const allSix = otpClean.length === 6;
              const otpSlots = splitOtpDigits(verificationCode);
              const verifyTitleMb = embedded ? "mb-5" : "mb-7";
              const verifyRuleMw = embedded ? "max-w-[228px]" : "max-w-[240px]";
              const otpH = embedded ? "h-[44px]" : "h-[52px]";
              const otpText = embedded ? "text-[1.0625rem]" : "text-lg";

              return (
              <>
                <div className={verifyTitleMb}>
                  <h1
                    className={`text-center font-kalshi font-bold tracking-[0.02em] text-white ${
                      embedded ? "text-[1.5rem] leading-[1.12] sm:text-[1.65rem]" : "text-[1.65rem] leading-[1.1] sm:text-[1.85rem]"
                    }`}
                  >
                    Inserisci il codice di verifica!
                  </h1>
                  <div className={`signup-premium-rule mx-auto my-3.5 ${verifyRuleMw}`} role="presentation" />
                  <p
                    className={`mx-auto max-w-[19.5rem] text-center leading-relaxed ${
                      embedded ? "text-[11.5px] sm:text-[12px]" : "text-[12px] sm:text-[13px]"
                    }`}
                    style={{ color: "rgba(250,251,253,0.84)" }}
                  >
                    Ti abbiamo inviato un codice a 6 cifre all’indirizzo{" "}
                    <span className="font-medium" style={{ opacity: 0.96 }}>
                      {registeredEmail}
                    </span>
                    . Controlla la posta (anche spam) e inseriscilo qui.
                  </p>
                </div>

                {emailSendWarning ? (
                  <div
                    className="mb-5 p-3.5 rounded-xl text-[13px] leading-snug"
                    style={{
                      background: "rgba(234,179,8,0.12)",
                      border: "1px solid rgba(234,179,8,0.35)",
                      color: "#fbbf24",
                    }}
                    role="status"
                  >
                    {emailSendWarning}{" "}
                    Puoi toccare <span className="font-medium">Reinvia</span> qui sotto oppure verificare più tardi dalla pagina dedicata.
                  </div>
                ) : null}

                {error ? (
                  <div
                    className="mb-5 p-3.5 rounded-xl text-[13px] leading-snug"
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

                <form onSubmit={handleVerifySubmit} className={embedded ? "space-y-3.5" : "space-y-5"}>
                  <div>
                    <p className={`mb-2.5 text-center font-kalshi font-semibold tracking-[0.04em] text-white/[0.92] ${embedded ? "text-[13px]" : "text-[14px]"}`}>
                      Codice di verifica
                    </p>
                    <div
                      className="flex w-full justify-center gap-2 sm:gap-[0.6rem]"
                      onPasteCapture={handleOtpPaste}
                    >
                      {otpSlots.map((digit, idx) => {
                        const lockedGreen = !!digit && (otpFocusIdx !== idx || allSix);
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
                            id={idx === 0 ? "signup-verify-digit-1" : `signup-verify-digit-${idx + 1}`}
                            value={digit}
                            onFocus={() => setOtpFocusIdx(idx)}
                            onChange={(e) => handleOtpSlotChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className={`max-w-[50px] min-w-0 flex-1 shrink rounded-[13px] text-center tabular-nums outline-none transition-all duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${otpH} ${otpText} font-semibold`}
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
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="signup-cta-premium-outline relative z-[2] mt-1 w-full disabled:pointer-events-none disabled:opacity-35"
                  >
                    <span className="relative z-[2]">{isLoading ? "Verifica…" : "Conferma codice"}</span>
                  </button>
                </form>

                <p className={`mt-3.5 text-center ${embedded ? "text-[11.5px]" : "text-[12px]"}`} style={{ color: "rgba(169,180,208,0.58)" }}>
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
                      onClick={handleResendCode}
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
                  onClick={handleVerifyBackToForm}
                  className={`mt-2.5 w-full text-center text-[11.5px] transition-opacity duration-200 hover:opacity-80 ${embedded ? "sm:text-[12px]" : ""}`}
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  ← indietro
                </button>
              </>
              );
            })() : null}

            {step === "welcome" && (
              <div className={`relative mb-2 text-center ${embedded ? "py-2" : "py-4"}`}>
                <h1
                  className="signup-welcome-title text-white leading-tight tracking-tight"
                  style={{ fontSize: embedded ? "clamp(1.35rem, 5.5vw, 1.75rem)" : "clamp(1.85rem, 6vw, 2.5rem)" }}
                >
                  Congratulazioni!
                </h1>
                <SignupWelcomeCreditsReveal
                  embedded={embedded}
                  target={INITIAL_CREDITS}
                  welcomeNavigateEmbedded={welcomeNavigateEmbedded}
                  authSuccessCallbackUrl={authSuccessCallbackUrl}
                />
                <p
                  className={`${embedded ? "mt-2 text-[13px]" : "mt-4 text-[15px]"} leading-relaxed px-1`}
                  style={{ color: "rgba(169,180,208,0.85)" }}
                >
                  Benvenuto ufficialmente su{" "}
                  <span className="pm-logo-header__text signup-welcome-inline-brand inline-flex items-baseline align-baseline whitespace-nowrap">
                    <span className="pm-logo-header__prediction">Prediction</span>
                    <span className="pm-logo-header__master">Master</span>
                  </span>
                  .
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );

  if (embedded) {
    return card;
  }

  return (
    <div className="min-h-dvh text-fg flex flex-col" style={{ background: "#060a12" }}>
      <Header showCategoryStrip={false} />
      {/* Background ambient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(80,245,252,0.09) 0%, transparent 65%)",
            "radial-gradient(ellipse 60% 40% at 80% 100%, rgba(56,200,210,0.05) 0%, transparent 60%)",
          ].join(", "),
        }}
      />
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
