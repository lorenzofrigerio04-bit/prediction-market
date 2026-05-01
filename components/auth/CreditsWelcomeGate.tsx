"use client";

import { useSession, getSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";
import CreditsWelcomeModal from "@/components/auth/CreditsWelcomeModal";
import { PM_WELCOME_CREDITS_PARAM } from "@/lib/auth-welcome-credits-url";
import {
  clearAllWelcomeCreditsDismissedClient,
  isWelcomeCreditsDismissedClient,
  setWelcomeCreditsDismissedClient,
} from "@/lib/welcome-credits-client-dismissed";

/**
 * Dopo primo login (es. Google) o finché l'utente non ha completato il reveal crediti:
 * stesso popup della registrazione (contatore → chiusura automatica).
 *
 * `?pmWelcomeCredits=1` (aggiunto da /auth/success) forza l'apertura immediata appena atterrati
 * sulla piattaforma, senza aspettare un giro extra di session client.
 */
function CreditsWelcomeGateInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const welcomeForced = searchParams.get(PM_WELCOME_CREDITS_PARAM) === "1";

  const signupPathActive =
    pathname === "/auth/signup" || (typeof pathname === "string" && pathname.startsWith("/auth/signup/"));

  const stripWelcomeParamFromUrl = useCallback(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has(PM_WELCOME_CREDITS_PARAM)) return;
    params.delete(PM_WELCOME_CREDITS_PARAM);
    const q = params.toString();
    const path = pathname ?? window.location.pathname;
    window.history.replaceState({}, "", `${path}${q ? `?${q}` : ""}`);
  }, [pathname]);

  useEffect(() => {
    if (status === "unauthenticated") {
      clearAllWelcomeCreditsDismissedClient();
    }
  }, [status]);

  const uid = session?.user?.id;
  const dismissedClient = Boolean(uid && isWelcomeCreditsDismissedClient(uid));

  useEffect(() => {
    if (status !== "authenticated" || !uid || !dismissedClient) return;
    if (searchParams.get(PM_WELCOME_CREDITS_PARAM) !== "1") return;
    stripWelcomeParamFromUrl();
  }, [status, uid, dismissedClient, searchParams, stripWelcomeParamFromUrl]);

  const gateBlockedBySignupPath = signupPathActive && !welcomeForced;

  const open =
    !gateBlockedBySignupPath &&
    status === "authenticated" &&
    Boolean(session?.user) &&
    Boolean(uid) &&
    !dismissedClient &&
    (session?.user?.showCreditsWelcome === true || welcomeForced);

  const handleClose = useCallback(async () => {
    const closeUid = session?.user?.id;
    try {
      const res = await fetch("/api/user/credits-welcome-dismiss", {
        method: "POST",
        credentials: "same-origin",
      });
      if (res.ok && closeUid) setWelcomeCreditsDismissedClient(closeUid);
    } catch {
      /* ignore */
    }
    try {
      await getSession();
    } catch {
      /* ignore */
    }
    stripWelcomeParamFromUrl();
    router.refresh();
  }, [router, session?.user?.id, stripWelcomeParamFromUrl]);

  const handleWelcomeDone = useCallback(() => {
    const doneUid = session?.user?.id;
    if (doneUid) setWelcomeCreditsDismissedClient(doneUid);
    stripWelcomeParamFromUrl();
    router.refresh();
  }, [router, session?.user?.id, stripWelcomeParamFromUrl]);

  if (!open) return null;

  const authSuccessCallbackUrl =
    typeof pathname === "string" && pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/";

  return (
    <CreditsWelcomeModal
      open={open}
      onClose={handleClose}
      welcomeNavigateEmbedded={handleWelcomeDone}
      authSuccessCallbackUrl={authSuccessCallbackUrl}
    />
  );
}

export default function CreditsWelcomeGate() {
  return (
    <Suspense fallback={null}>
      <CreditsWelcomeGateInner />
    </Suspense>
  );
}
