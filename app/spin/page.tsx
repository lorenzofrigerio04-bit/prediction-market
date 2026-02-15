"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import CreditsWheel from "@/components/spin/CreditsWheel";
import MultiplierWheel from "@/components/spin/MultiplierWheel";
import {
  SpinChoiceModal,
  SpinCongratsModal,
  SpinMultiplierResultModal,
} from "@/components/spin/SpinModals";
import { SectionContainer, CTAButton, LoadingBlock } from "@/components/ui";

interface SpinStatus {
  canSpin: boolean;
  lastSpinAt: string | null;
  nextSpinAt: string | null;
  pendingCredits: number | null;
  payloadStatus: string | null;
}

export default function SpinPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statusData, setStatusData] = useState<SpinStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [wonCredits, setWonCredits] = useState<number | null>(null);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [showMultiplierWheel, setShowMultiplierWheel] = useState(false);
  const [showMultiplierResultModal, setShowMultiplierResultModal] = useState(false);
  const [multiplierResult, setMultiplierResult] = useState<{
    baseCredits: number;
    multiplier: number;
    totalCredits: number;
  } | null>(null);
  const [cashOutLoading, setCashOutLoading] = useState(false);

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

  useEffect(() => {
    if (!statusData) return;
    if (statusData.pendingCredits != null && statusData.pendingCredits > 0) {
      setWonCredits(statusData.pendingCredits);
      setShowChoiceModal(true);
    }
  }, [statusData?.pendingCredits]);

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
      fetchStatus();
      if (result.credits > 0) setShowChoiceModal(true);
    },
    [fetchStatus]
  );

  const handleCashOut = useCallback(async () => {
    setCashOutLoading(true);
    try {
      const res = await fetch("/api/spin/cash-out", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore incasso");
      setShowChoiceModal(false);
      setShowCongratsModal(true);
      fetchStatus();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Errore incasso");
    } finally {
      setCashOutLoading(false);
    }
  }, [fetchStatus]);

  const handleMultiplierChoice = useCallback(() => {
    setShowChoiceModal(false);
    setShowMultiplierWheel(true);
  }, []);

  const handleMultiplierSpin = useCallback(async () => {
    const res = await fetch("/api/spin/multiplier", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore ruota moltiplicatrice");
    return {
      multiplier: data.multiplier,
      baseCredits: data.baseCredits,
      totalCredits: data.totalCredits,
      segmentIndex: data.segmentIndex,
    };
  }, []);

  const handleMultiplierSuccess = useCallback(
    (result: {
      multiplier: number;
      baseCredits: number;
      totalCredits: number;
      segmentIndex: number;
    }) => {
      setMultiplierResult({
        baseCredits: result.baseCredits,
        multiplier: result.multiplier,
        totalCredits: result.totalCredits,
      });
      setShowMultiplierWheel(false);
      setShowMultiplierResultModal(true);
      fetchStatus();
    },
    [fetchStatus]
  );

  if (status === "loading" || (status === "authenticated" && loading && !statusData)) {
    return (
      <div className="min-h-screen dark bg-bg">
        <Header />
        <main className="mx-auto max-w-lg px-page-x py-page-y md:py-8">
          <LoadingBlock message="Caricamento..." />
        </main>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen dark bg-bg">
      <Header />
      <main className="mx-auto max-w-lg px-page-x py-page-y md:py-8">
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

        <div className="mt-8 text-center">
          <Link href="/wallet">
            <CTAButton variant="secondary">Vai al wallet</CTAButton>
          </Link>
        </div>
      </main>

      <SpinChoiceModal
        isOpen={showChoiceModal}
        credits={wonCredits ?? 0}
        onCash={handleCashOut}
        onMultiplier={handleMultiplierChoice}
        loading={cashOutLoading}
      />

      <SpinCongratsModal
        isOpen={showCongratsModal}
        credits={wonCredits ?? 0}
        onClose={() => setShowCongratsModal(false)}
      />

      {showMultiplierWheel && wonCredits != null && wonCredits > 0 && (
        <div className="spin-multiplier-overlay">
          <MultiplierWheel
            baseCredits={wonCredits}
            onSpin={handleMultiplierSpin}
            onSuccess={handleMultiplierSuccess}
            onClose={() => setShowMultiplierWheel(false)}
          />
        </div>
      )}

      {multiplierResult && (
        <SpinMultiplierResultModal
          isOpen={showMultiplierResultModal}
          baseCredits={multiplierResult.baseCredits}
          multiplier={multiplierResult.multiplier}
          totalCredits={multiplierResult.totalCredits}
          onClose={() => {
            setShowMultiplierResultModal(false);
            setMultiplierResult(null);
          }}
        />
      )}
    </div>
  );
}
