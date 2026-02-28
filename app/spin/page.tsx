"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import CreditsWheel from "@/components/spin/CreditsWheel";
import { SpinCongratsModal } from "@/components/spin/SpinModals";
import { SectionContainer, CTAButton, LoadingBlock } from "@/components/ui";

interface SpinStatus {
  canSpin: boolean;
  lastSpinAt: string | null;
  nextSpinAt: string | null;
  pendingCredits: number | null;
  payloadStatus: string | null;
  streak?: number;
}

export default function SpinPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statusData, setStatusData] = useState<SpinStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [wonCredits, setWonCredits] = useState<number | null>(null);
  const [showCongratsModal, setShowCongratsModal] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/spin/status");
      if (!res.ok) throw new Error("Errore caricamento");
      const data = await res.json();
      setStatusData(data);
      setError(null);
      return data;
    } catch (e) {
      setError("Impossibile caricare lo stato dello spin.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") fetchStatus();
  }, [status, router, fetchStatus]);

  const handleFirstSpin = useCallback(async () => {
    const res = await fetch("/api/spin/claim", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore durante lo spin");
    return {
      credits: data.credits,
      segmentIndex: data.segmentIndex,
    };
  }, []);

  const handleFirstSpinSuccess = useCallback(
    (result: { credits: number; segmentIndex: number }) => {
      setWonCredits(result.credits);
      setShowCongratsModal(true);
      fetchStatus();
    },
    [fetchStatus]
  );

  if (status === "loading" || (status === "authenticated" && loading && !statusData)) {
    return (
      <div className="min-h-screen dark bg-bg">
        <Header />
        <main id="main-content" className="mx-auto max-w-lg px-page-x py-page-y md:py-8">
          <LoadingBlock message="Caricamento..." />
        </main>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen dark bg-bg">
      <Header />
      <main id="main-content" className="mx-auto max-w-lg px-page-x py-page-y md:py-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-ds-body-sm text-red-400">
            {error}
          </div>
        )}

        <SectionContainer>
          {statusData && (
            <CreditsWheel
              canSpin={statusData.canSpin}
              onSpin={handleFirstSpin}
              onSuccess={handleFirstSpinSuccess}
            />
          )}
        </SectionContainer>

        <p className="mt-4 text-center text-ds-body-sm text-fg-muted">
          Un giro al giorno. Ogni giorno un risultato diverso.
        </p>

        <div className="mt-8 text-center">
          <Link href="/wallet">
            <CTAButton variant="secondary">Vai al wallet</CTAButton>
          </Link>
        </div>
      </main>

      <SpinCongratsModal
        isOpen={showCongratsModal}
        credits={wonCredits ?? 0}
        onClose={() => setShowCongratsModal(false)}
      />
    </div>
  );
}
