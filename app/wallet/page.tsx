"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StreakBadge from "@/components/StreakBadge";
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
  IconTrendUp,
  IconTrendDown,
  IconTarget,
  IconShop,
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
  bonusMultiplier?: number;
  canSpinToday?: boolean;
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
  SHOP_PURCHASE: "Acquisto shop",
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
  SHOP_PURCHASE: IconShop,
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
  const [claimingBonus, setClaimingBonus] = useState(false);
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

      if (!statsRes.ok) throw new Error("Errore nel caricamento delle statistiche");
      if (!transactionsRes.ok) throw new Error("Errore nel caricamento delle transazioni");

      const statsData = await statsRes.json();
      const transactionsData: TransactionsResponse = await transactionsRes.json();

      setStats(statsData);
      if (append) {
        setTransactions((prev) => [...prev, ...transactionsData.transactions]);
      } else {
        setTransactions(transactionsData.transactions);
      }
      setPagination(transactionsData.pagination);
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError("Errore nel caricamento dei dati del wallet");
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

  const handleClaimDailyBonus = async () => {
    if (!stats?.canClaimDailyBonus || claimingBonus) return;

    setClaimingBonus(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/wallet/daily-bonus", { method: "POST" });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Errore nel riscatto del bonus");

      setSuccessMessage(data.message);
      await fetchWalletData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore nel riscatto del bonus giornaliero");
    } finally {
      setClaimingBonus(false);
    }
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
        <main className="mx-auto max-w-2xl px-page-x py-page-y md:py-8">
          <LoadingBlock message="Caricamento wallet..." />
        </main>
      </div>
    );
  }

  if (!session) return null;

  if (!stats && !loading && error) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto max-w-2xl px-page-x py-page-y md:py-8">
          <PageHeader title="Il Mio Wallet" />
          <EmptyState description={error} action={{ label: "Riprova", onClick: () => fetchWalletData() }} />
        </main>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto max-w-2xl px-page-x py-page-y md:py-8">
        <PageHeader title="Il Mio Wallet" description="Saldo, bonus e storico crediti" />

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

        {/* 1. Crediti giocatore */}
        <SectionContainer>
          <h2 className="mb-2 text-ds-label uppercase tracking-wide text-fg-muted">Crediti giocatore</h2>
          <p className="mb-4 text-ds-body-sm text-fg-muted">
            Il tuo saldo totale. Ogni movimento ha una motivazione (previsioni, bonus, missioni, shop).
          </p>
          <StatCard
            label="Saldo"
            value={formatAmount(stats.credits)}
            variant="primary"
            elevated
            icon={<IconWallet className="w-5 h-5 md:w-6 md:h-6" />}
          />
        </SectionContainer>

        {/* 2. Disponibili */}
        <SectionContainer>
          <h2 className="mb-2 text-ds-label uppercase tracking-wide text-fg-muted">Disponibili</h2>
          <p className="mb-3 text-ds-body-sm text-fg-muted">
            Crediti utilizzabili subito per fare previsioni o acquisti nello shop. Nessun blocco.
          </p>
          <div className="rounded-2xl border border-border bg-surface/50 p-4 dark:border-white/10">
            <p className="text-2xl font-bold font-numeric text-fg md:text-3xl">{formatAmount(stats.credits)}</p>
            <p className="mt-1 text-ds-micro text-fg-muted">crediti disponibili</p>
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
          Guadagni: bonus giornaliero, missioni, vincite previsioni. Spese: scommesse e acquisti shop.
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
                <p className="mt-1 text-ds-body-sm text-fg-muted">
                  {stats.canClaimDailyBonus
                    ? `Riscatta ${formatAmount(stats.nextBonusAmount)} crediti oggi.`
                    : "Prossimo bonus domani."}
                </p>
                {stats.streak > 0 && (
                  <p className="mt-2">
                    <StreakBadge streak={stats.streak} size="sm" />
                    {stats.bonusMultiplier != null && (
                      <span className="ml-2 text-ds-body-sm text-fg-muted">
                        Moltiplicatore: ×{stats.bonusMultiplier} (fino a ×2 con 10 giorni consecutivi)
                      </span>
                    )}
                  </p>
                )}
                {stats.lastDailyBonus && (
                  <p className="mt-1 text-ds-micro text-fg-muted">Ultimo riscatto: {formatDate(stats.lastDailyBonus)}</p>
                )}
              </div>
              <CTAButton
                fullWidth={false}
                disabled={!stats.canClaimDailyBonus || claimingBonus}
                onClick={handleClaimDailyBonus}
                variant="primary"
                className={
                  !stats.canClaimDailyBonus || claimingBonus
                    ? "!border-border !bg-surface/50 !text-fg-muted dark:!border-white/10"
                    : ""
                }
              >
                {claimingBonus ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
                    Riscatto...
                  </span>
                ) : stats.canClaimDailyBonus ? (
                  <span className="flex items-center gap-2">
                    <IconGift className="w-4 h-4" />
                    Ritira bonus
                  </span>
                ) : (
                  "Prossimo domani"
                )}
              </CTAButton>
            </div>
          </Card>

          <Card className="mb-4 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-ds-h3 font-bold text-fg">Spin of the Day</h3>
                <p className="mt-1 text-ds-body-sm text-fg-muted">
                  {stats.canSpinToday
                    ? "Un spin gratuito ogni giorno. Crediti o boost moltiplicatore!"
                    : "Hai già usato lo spin di oggi. Torna domani."}
                </p>
                {stats.hasActiveBoost && stats.boostMultiplier != null && stats.boostExpiresAt && (
                  <p className="mt-2 text-ds-body-sm font-medium text-primary">
                    Boost attivo: ×{stats.boostMultiplier} fino alle{" "}
                    {new Date(stats.boostExpiresAt).toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
              <CTAButton
                href="/spin"
                fullWidth={false}
                variant="primary"
                className={!stats.canSpinToday ? "!border-border !bg-surface/50 !text-fg-muted dark:!border-white/10" : ""}
              >
                {stats.canSpinToday ? (
                  <span className="flex items-center gap-2">
                    <IconSparkles className="w-4 h-4" />
                    Gira la ruota
                  </span>
                ) : (
                  "Vedi la ruota"
                )}
              </CTAButton>
            </div>
          </Card>

          <Card className="border-dashed border-border bg-surface/30 p-5 dark:border-white/10 md:p-6">
            <h3 className="text-ds-h3 font-bold text-fg">Missioni</h3>
            <p className="mt-1 text-ds-body-sm text-fg-muted">
              Completa missioni giornaliere e settimanali per crediti extra. Le ricompense sono definite per ogni missione.
            </p>
            <Link
              href="/missions"
              className="mt-4 inline-block text-ds-body-sm font-medium text-primary hover:underline"
            >
              Vai alle missioni →
            </Link>
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
              <div className="py-8 text-center text-ds-body-sm text-fg-muted">Nessuna transazione ancora.</div>
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
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border p-4 transition-colors hover:bg-surface/30 dark:border-white/10"
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
