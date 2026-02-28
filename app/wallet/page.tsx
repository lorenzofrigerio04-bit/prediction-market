"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import {
  PageHeader,
  SectionContainer,
  Card,
  StatCard,
  CTAButton,
  EmptyState,
  LoadingBlock,
} from "@/components/ui";
import {
  IconWallet,
  IconGift,
  IconSparkles,
  IconCurrency,
  IconCheck,
  IconTrendUp,
  IconTrendDown,
  IconTarget,
  IconCog,
  IconChat,
} from "@/components/ui/Icons";

interface WalletStats {
  credits: number;
  totalEarned: number;
  totalSpent: number;
  streak: number;
  lastDailyBonus: string | null;
  canClaimDailyBonus: boolean;
  nextBonusAmount: number;
  canSpinToday?: boolean;
  todaySpinCredits?: number | null;
  boostMultiplier?: number | null;
  boostExpiresAt?: string | null;
  hasActiveBoost?: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  balanceAfter: number;
  createdAt: string;
  referenceType: string | null;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  PREDICTION_BET: "Previsione",
  PREDICTION_WIN: "Risultato",
  PREDICTION_LOSS: "Risultato",
  DAILY_BONUS: "Bonus giornaliero",
  MISSION_REWARD: "Missione",
  SHOP_PURCHASE: "Acquisto", // storico: transazioni shop passate
  ADMIN_ADJUSTMENT: "Aggiustamento Admin",
  REFERRAL_BONUS: "Bonus Referral",
  SPIN_REWARD: "Spin of the Day",
};

const TRANSACTION_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PREDICTION_BET: IconCurrency,
  PREDICTION_WIN: IconTrendUp,
  PREDICTION_LOSS: IconTrendDown,
  DAILY_BONUS: IconGift,
  MISSION_REWARD: IconTarget,
  SHOP_PURCHASE: IconCurrency, // storico
  ADMIN_ADJUSTMENT: IconCog,
  REFERRAL_BONUS: IconChat,
  SPIN_REWARD: IconSparkles,
};

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<TransactionsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const TRANSACTION_PAGE_SIZE = 20;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchWalletData();
    }
  }, [status, router]);

  const fetchWalletData = async (append = false) => {
    if (!append) setLoading(true);
    setError(null);
    const offset = append ? (pagination?.offset ?? 0) + (pagination?.limit ?? TRANSACTION_PAGE_SIZE) : 0;
    try {
      const [statsRes, transactionsRes] = await Promise.all([
        fetch("/api/wallet/stats"),
        fetch(`/api/wallet/transactions?limit=${TRANSACTION_PAGE_SIZE}&offset=${offset}`),
      ]);

      if (!statsRes.ok) {
        const body = await statsRes.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Errore nel caricamento delle statistiche");
      }

      const statsData = await statsRes.json();
      setStats(statsData);

      if (!transactionsRes.ok) {
        const body = await transactionsRes.json().catch(() => ({}));
        const msg = (body as { error?: string }).error ?? "Errore nel caricamento delle transazioni";
        setError(msg);
        if (!append) {
          setTransactions([]);
          setPagination({ total: 0, limit: TRANSACTION_PAGE_SIZE, offset: 0, hasMore: false });
        }
      } else {
        const transactionsData: TransactionsResponse = await transactionsRes.json();
        if (append) {
          setTransactions((prev) => [...prev, ...transactionsData.transactions]);
        } else {
          setTransactions(transactionsData.transactions);
        }
        setPagination(transactionsData.pagination);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError(err instanceof Error ? err.message : "Errore nel caricamento dei dati del wallet");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTransactions = () => {
    if (!pagination?.hasMore || loadingMore) return;
    setLoadingMore(true);
    fetchWalletData(true);
  };

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));

  const formatAmount = (amount: number) => new Intl.NumberFormat("it-IT").format(amount);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main id="main-content" className="mx-auto max-w-2xl px-page-x py-page-y md:py-8">
          <LoadingBlock message="Caricamento…" />
        </main>
      </div>
    );
  }

  if (!session) return null;

  if (!stats && !loading && error) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main id="main-content" className="mx-auto max-w-2xl px-page-x py-page-y md:py-8">
          <PageHeader title="Il tuo wallet" />
          <EmptyState description={error} action={{ label: "Riprova", onClick: () => fetchWalletData() }} />
        </main>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main id="main-content" className="mx-auto max-w-2xl px-page-x py-page-y md:py-8">
        <PageHeader title="Il tuo wallet" description="Saldo, bonus e storico in un colpo d'occhio." />

        {error && (
          <div className="mb-6 rounded-2xl border border-danger/30 bg-danger-bg/90 p-4 text-ds-body-sm text-danger dark:bg-danger-bg/50">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-2xl border border-success/30 bg-success-bg/90 p-4 text-ds-body-sm text-success dark:bg-success-bg/50">
            {successMessage}
          </div>
        )}

        {/* 1. Saldo in evidenza + primary CTA */}
        <SectionContainer>
          <StatCard
            label="Saldo"
            value={formatAmount(stats.credits)}
            variant="primary"
            elevated
            icon={<IconWallet className="w-5 h-5 md:w-6 md:h-6" />}
          />
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <CTAButton href="/discover" variant="primary" fullWidth className="min-h-[48px]">
              Prevedi ora
            </CTAButton>
            {stats.canClaimDailyBonus && (
              <CTAButton
                fullWidth={false}
                disabled={claimingBonus}
                onClick={handleClaimDailyBonus}
                variant="secondary"
                className="min-h-[48px]"
              >
                {claimingBonus ? "Riscatto…" : "Riscatta bonus"}
              </CTAButton>
            )}
          </div>
        </SectionContainer>

        {/* 2. Disponibili */}
        <SectionContainer>
          <h2 className="mb-2 text-ds-label uppercase tracking-wide text-fg-muted">Disponibili</h2>
          <p className="mb-3 text-ds-body-sm text-fg-muted">
            Crediti utilizzabili subito per fare previsioni. Nessun blocco.
          </p>
          <div className="pill-credits rounded-2xl p-4">
            <p className="text-2xl font-bold font-numeric text-white md:text-3xl">{formatAmount(stats.credits)}</p>
            <p className="mt-1 text-ds-micro text-white/80">crediti disponibili</p>
          </div>
          <p className="mt-4 text-ds-micro italic text-fg-muted">
            I crediti sono virtuali e non hanno valore monetario. Non sono convertibili né prelevabili.
          </p>
        </SectionContainer>

        {/* Riepilogo motivato: da dove vengono i numeri */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4">
          <StatCard
            label="Totale guadagnato"
            value={`+${formatAmount(stats.totalEarned)}`}
            variant="success"
          />
          <StatCard
            label="Totale speso"
            value={`−${formatAmount(stats.totalSpent)}`}
            variant="danger"
          />
        </div>
        <p className="mb-8 text-ds-micro text-fg-muted">
          Guadagni: bonus giornaliero, missioni, vincite previsioni. Spese: scommesse.
        </p>

        {/* 3. Bonus attivi */}
        <SectionContainer>
          <h2 className="mb-2 text-ds-label uppercase tracking-wide text-fg-muted">Bonus attivi</h2>
          <p className="mb-4 text-ds-body-sm text-fg-muted">
            Bonus che puoi riscattare o su cui stai lavorando. Ogni importo è definito dalla configurazione del gioco.
          </p>

          <Card className="mb-4 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-ds-h3 font-bold text-fg">Bonus giornaliero</h3>
                {stats.canSpinToday ? (
                  <p className="mt-1 text-ds-body font-bold text-fg">
                    Riscatta il tuo bonus giornaliero!
                  </p>
                ) : (
                  <>
                    <p className="mt-1 flex items-center gap-1.5 text-ds-h2 font-sans leading-none">
                      <span className="font-semibold tabular-nums text-white">
                        {stats.todaySpinCredits != null ? stats.todaySpinCredits.toLocaleString("it-IT") : "—"}
                      </span>
                      <svg className="h-[0.9em] w-[0.9em] shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden style={{ verticalAlign: "middle" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </p>
                    <p className="mt-1.5 flex items-center gap-2 text-ds-body-sm text-fg-muted">
                      <IconCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />
                      Ruota già girata
                    </p>
                  </>
                )}
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-ds-body font-semibold text-fg">
                    La tua streak: {stats.streak} <span className="inline-block text-lg leading-none" aria-hidden>🔥</span>
                  </p>
                </div>
              </div>
              {stats.canSpinToday && (
                <CTAButton
                  href="/spin"
                  fullWidth={false}
                  variant="primary"
                >
                  <span className="flex items-center gap-2">
                    <IconSparkles className="w-4 h-4" />
                    Gira la ruota
                  </span>
                </CTAButton>
              )}
            </div>
          </Card>

          <Card className="border-dashed border-white/15 p-5 md:p-6">
            <h3 className="text-ds-h3 font-bold text-fg">Missioni</h3>
            <p className="mt-1 text-ds-body-sm text-fg-muted">
              Completa missioni giornaliere e settimanali per crediti extra. Le ricompense sono definite per ogni missione.
            </p>
            <div className="mt-4 flex justify-end">
              <Link
                href="/missions"
                className="text-ds-body-sm font-medium text-primary hover:underline"
              >
                Vai alle missioni →
              </Link>
            </div>
          </Card>
        </SectionContainer>

        {/* 4. Storico transazioni */}
        <SectionContainer>
          <h2 className="mb-2 text-ds-label uppercase tracking-wide text-fg-muted">Storico transazioni</h2>
          <p className="mb-4 text-ds-body-sm text-fg-muted">
            Ogni movimento è registrato con tipo, importo e saldo dopo l’operazione.
          </p>
          <Card className="p-5 md:p-6">
            {transactions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-ds-body-sm text-fg-muted mb-4">Nessuna transazione ancora.</p>
                <CTAButton href="/discover" variant="secondary">Esplora eventi</CTAButton>
              </div>
            ) : (
              <>
                <ul className="space-y-2">
                  {transactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    const typeLabel = TRANSACTION_TYPE_LABELS[tx.type] ?? tx.type;
                    const TypeIcon = TRANSACTION_TYPE_ICONS[tx.type] ?? IconCurrency;
                    return (
                      <li
                        key={tx.id}
                        className="flex items-center justify-between gap-3 rounded-2xl box-raised hover-lift p-4 transition-colors"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="shrink-0 text-fg-muted"><TypeIcon className="w-5 h-5" /></span>
                          <div className="min-w-0">
                            <p className="font-medium text-fg truncate">{typeLabel}</p>
                            <p className="text-xs text-fg-muted">{formatDate(tx.createdAt)}</p>
                            {tx.description && (
                              <p className="mt-0.5 truncate text-xs text-fg-muted" title={tx.description}>
                                {tx.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className={`font-semibold font-numeric ${
                              isPositive ? "text-success" : "text-danger"
                            }`}
                          >
                            {isPositive ? "+" : ""}{formatAmount(tx.amount)}
                          </p>
                          <p className="text-ds-micro text-fg-muted font-numeric">Saldo {formatAmount(tx.balanceAfter)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {pagination?.hasMore && (
                  <div className="mt-4 flex justify-center">
                    <CTAButton variant="secondary" onClick={loadMoreTransactions} disabled={loadingMore}>
                      {loadingMore ? "Caricamento..." : "Carica altre"}
                    </CTAButton>
                  </div>
                )}
              </>
            )}
          </Card>
        </SectionContainer>
      </main>
    </div>
  );
}
