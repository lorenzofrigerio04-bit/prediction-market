"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import SpinWheel from "@/components/spin/SpinWheel";
import { PageHeader, SectionContainer, CTAButton, LoadingBlock } from "@/components/ui";

interface SpinStatus {
  canSpin: boolean;
  lastSpinAt: string | null;
  nextSpinAt: string | null;
}

export default function SpinPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statusData, setStatusData] = useState<SpinStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/spin/status");
      if (!res.ok) throw new Error("Errore caricamento");
      const data = await res.json();
      setStatusData(data);
      setError(null);
    } catch (e) {
      setError("Impossibile caricare lo stato dello spin.");
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

  const handleSpin = useCallback(async () => {
    const res = await fetch("/api/spin/claim", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore durante lo spin");
    return {
      rewardIndex: data.rewardIndex,
      reward: {
        label: data.reward.label,
        kind: data.reward.kind,
        amount: data.reward.amount,
        multiplier: data.reward.multiplier,
        durationMinutes: data.reward.durationMinutes,
      },
    };
  }, []);

  const handleSuccess = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (status === "loading" || (status === "authenticated" && loading && !statusData)) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto max-w-lg px-page-x py-page-y md:py-8">
          <LoadingBlock message="Caricamento..." />
        </main>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto max-w-lg px-page-x py-page-y md:py-8">
        <PageHeader
          title="Spin of the Day"
          description="Un spin gratuito ogni giorno. Vinci crediti o un boost moltiplicatore temporaneo!"
        />

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-ds-body-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <SectionContainer>
          {statusData && (
            <>
              <div className="mb-6 text-center text-ds-body-sm text-fg-muted">
                {statusData.canSpin
                  ? "Clicca su «Gira la ruota» per usare il tuo spin gratuito di oggi."
                  : "Hai già usato lo spin di oggi. Torna domani per un altro tentativo!"}
              </div>
              <SpinWheel
                canSpin={statusData.canSpin}
                onSpin={handleSpin}
                onSuccess={handleSuccess}
              />
            </>
          )}
        </SectionContainer>

        <div className="mt-8 text-center">
          <Link href="/wallet">
            <CTAButton variant="secondary">Vai al wallet</CTAButton>
          </Link>
        </div>
      </main>
    </div>
  );
}
