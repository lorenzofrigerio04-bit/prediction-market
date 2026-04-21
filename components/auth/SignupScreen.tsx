"use client";

import { useState, useCallback, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || null }),
      });

      let data: { error?: string; details?: string };
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
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto. Riprova tra poco.");
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

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  };
  const inputFocusStyle = {
    background: "rgba(80,245,252,0.05)",
    border: "1px solid rgba(80,245,252,0.35)",
    boxShadow: "0 0 0 3px rgba(80,245,252,0.08)",
  };
  const inputBlurStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "none",
  };

  const card = (
    <div
      className="relative w-full max-w-[400px]"
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
          style={{ background: "rgba(7, 10, 20, 0.96)", backdropFilter: "blur(40px)" }}
        >
          {/* Top glow line */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(80,245,252,0.6) 30%, rgba(80,245,252,0.9) 50%, rgba(80,245,252,0.6) 70%, transparent 100%)",
            }}
          />
          {/* Inner ambient */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 rounded-full opacity-15"
            style={{ background: "radial-gradient(ellipse, rgba(80,245,252,0.5) 0%, transparent 70%)" }}
          />

          <div className="relative p-6 sm:p-8">
            {/* Back button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-1.5 mb-7 transition-colors duration-200 group"
              style={{ color: "rgba(169,180,208,0.35)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(169,180,208,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(169,180,208,0.35)")}
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

            {/* Title */}
            <div className="mb-7">
              <h1
                className="font-display font-bold text-white leading-none tracking-tight"
                style={{ fontSize: "clamp(2.4rem, 8vw, 3.2rem)" }}
              >
                Inizia ora.
              </h1>
              <p className="mt-2 text-[13px]" style={{ color: "rgba(169,180,208,0.6)" }}>
                Crea il tuo account e ricevi{" "}
                <span style={{ color: "rgba(80,245,252,0.8)" }} className="font-semibold">100 crediti</span>
                {" "}per iniziare a prevedere.
              </p>
            </div>

            {/* Error */}
            {error && (
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
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name */}
              <div className="relative">
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(169,180,208,0.35)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-[52px] pl-11 pr-4 rounded-xl text-[15px] text-white placeholder:text-white/25 transition-all duration-200 focus:outline-none"
                  style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, inputBlurStyle)}
                  placeholder="Nome (opzionale)"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(169,180,208,0.35)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 9l10 6 10-6" />
                  </svg>
                </div>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-[52px] pl-11 pr-4 rounded-xl text-[15px] text-white placeholder:text-white/25 transition-all duration-200 focus:outline-none"
                  style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, inputBlurStyle)}
                  placeholder="Email"
                />
              </div>

              {/* Password */}
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
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-[52px] pl-11 pr-12 rounded-xl text-[15px] text-white placeholder:text-white/25 transition-all duration-200 focus:outline-none"
                  style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, inputBlurStyle)}
                  placeholder="Password (min. 6 caratteri)"
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
                  {showPassword ? eyeOpen : eyeClosed}
                </button>
              </div>

              {/* Confirm password */}
              <div className="relative">
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "rgba(169,180,208,0.35)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path d="M9 12l2 2 4-4" />
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="signup-confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-[52px] pl-11 pr-12 rounded-xl text-[15px] text-white placeholder:text-white/25 transition-all duration-200 focus:outline-none"
                  style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, inputBlurStyle)}
                  placeholder="Conferma password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                  style={{ color: "rgba(169,180,208,0.4)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(169,180,208,0.75)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(169,180,208,0.4)")}
                  aria-label={showPassword ? "Nascondi conferma" : "Mostra conferma"}
                >
                  {showPassword ? eyeOpen : eyeClosed}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full h-[52px] rounded-xl font-semibold text-[15px] tracking-wide transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
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
                {isLoading ? "Registrazione…" : "Crea account"}
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
              disabled={isLoading}
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
              Hai già un account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold transition-colors duration-200"
                style={{ color: "rgba(80,245,252,0.7)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(80,245,252,1)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(80,245,252,0.7)")}
              >
                Accedi
              </Link>
            </p>
            <p className="mt-3 text-center text-[11px] leading-relaxed px-1" style={{ color: "rgba(169,180,208,0.35)" }}>
              Registrandoti accetti i{" "}
              <Link
                href="/legal/terms"
                className="transition-colors hover:underline underline-offset-2"
                style={{ color: "rgba(169,180,208,0.55)" }}
              >
                Termini di servizio
              </Link>{" "}
              e la{" "}
              <Link
                href="/legal/privacy"
                className="transition-colors hover:underline underline-offset-2"
                style={{ color: "rgba(169,180,208,0.55)" }}
              >
                Privacy policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );

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
