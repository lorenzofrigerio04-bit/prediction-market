"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import OnboardingTour from "@/components/OnboardingTour";
import { FootballHomepage } from "@/components/home/football/FootballHomepage";
import { generateNotificationsOnDemand } from "@/lib/notifications/client";

const ONBOARDING_STORAGE_KEY = "prediction-market-onboarding-completed";

function HomeContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Debug panel only when ?debug=1 or NEXT_PUBLIC_DEBUG_MODE=true.
  const debugMode =
    searchParams.get("debug") === "1" ||
    (typeof process.env.NEXT_PUBLIC_DEBUG_MODE !== "undefined" &&
      process.env.NEXT_PUBLIC_DEBUG_MODE === "true");
  const { data: session, status, update: updateSession } = useSession();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [sessionSynced, setSessionSynced] = useState(false);
  const sessionSyncDone = useRef(false);

  const [debugInfo, setDebugInfo] = useState<{ version?: { commit: string; env: string; baseUrl: string }; health?: { dbConnected: boolean; markets_count: number } } | null>(null);

  useEffect(() => {
    if (!debugMode) return;
    Promise.all([fetch("/api/version").then((r) => r.ok ? r.json() : null), fetch("/api/health").then((r) => r.ok ? r.json() : null)])
      .then(([version, health]) => setDebugInfo({ version: version ?? undefined, health: health ?? undefined }))
      .catch(() => setDebugInfo(null));
  }, [debugMode]);

  useEffect(() => {
    if (status === "unauthenticated" || status === "loading") {
      setSessionSynced(true);
      return;
    }
    if (status === "authenticated" && !sessionSyncDone.current) {
      sessionSyncDone.current = true;
      updateSession()
        .then(() => setSessionSynced(true))
        .catch(() => setSessionSynced(true));
    }
  }, [status]);

  const [alreadyCompletedThisSession, setAlreadyCompletedThisSession] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(ONBOARDING_STORAGE_KEY) === "true") {
      setAlreadyCompletedThisSession(true);
    }
  }, []);

  const showOnboarding =
    pathname === "/" &&
    status === "authenticated" &&
    sessionSynced &&
    !!session?.user &&
    session.user?.onboardingCompleted === false &&
    !alreadyCompletedThisSession &&
    !onboardingDismissed;

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    }
    (async () => {
      try {
        const res = await fetch("/api/user/onboarding-complete", { method: "POST" });
        if (res.ok) await updateSession();
      } catch {
        updateSession().catch(() => {});
      }
    })();
  }, [updateSession]);

  // Nasconde scrollbar laterale sulla homepage
  useEffect(() => {
    if (pathname === "/") {
      document.documentElement.classList.add("scrollbar-hide");
      document.body.classList.add("scrollbar-hide");
    } else {
      document.documentElement.classList.remove("scrollbar-hide");
      document.body.classList.remove("scrollbar-hide");
    }
    return () => {
      document.documentElement.classList.remove("scrollbar-hide");
      document.body.classList.remove("scrollbar-hide");
    };
  }, [pathname]);

  // Ripristino scroll quando si torna indietro da un evento (solo se salvataggio recente)
  useEffect(() => {
    if (pathname !== "/" || typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("homeScroll");
      if (!raw) return;
      const data = JSON.parse(raw) as { y: number; t: number };
      sessionStorage.removeItem("homeScroll");
      const maxAge = 60 * 1000; // 1 minuto
      if (Number.isFinite(data.y) && Date.now() - (data.t || 0) < maxAge) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => window.scrollTo(0, data.y));
        });
      }
    } catch {
      sessionStorage.removeItem("homeScroll");
    }
  }, [pathname]);

  const handleEventClick = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "homeScroll",
        JSON.stringify({ y: window.scrollY, t: Date.now() })
      );
    }
  }, []);

  // Genera notifiche on-demand quando utente apre Home (best-effort)
  useEffect(() => {
    if (status === "authenticated") {
      generateNotificationsOnDemand();
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-bg">
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
      <Header showCategoryStrip={false} />
      <main id="main-content" className="mx-auto px-page-x pt-0 pb-page-y md:pt-0 md:pb-8 max-w-6xl">
        {/* Debug panel: only when ?debug=1 or NEXT_PUBLIC_DEBUG_MODE=true. */}
        {debugMode && (
          <div className="text-ds-micro text-fg-muted mb-2 p-2 rounded bg-white/5" aria-hidden>
            <p>debug: commit={debugInfo?.version?.commit ?? "—"} env={debugInfo?.version?.env ?? "—"} baseUrl={debugInfo?.version?.baseUrl ? `${debugInfo.version.baseUrl.slice(0, 40)}…` : "—"}</p>
            <p>dbConnected={String(debugInfo?.health?.dbConnected ?? "—")}</p>
          </div>
        )}

        <div className="pt-0 px-2 sm:px-4 max-w-6xl mx-auto">
          <FootballHomepage
            isLoggedIn={status === "authenticated"}
            onEventNavigate={handleEventClick}
          />
        </div>

      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
