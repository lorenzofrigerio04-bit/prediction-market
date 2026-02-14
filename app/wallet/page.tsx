"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import StreakBadge from "@/components/StreakBadge";

interface WalletStats {
  credits: number;
  totalEarned: number;
  totalSpent: number;
  streak: number;
  lastDailyBonus: string | null;
  canClaimDailyBonus: boolean;
  nextBonusAmount: number;
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
};

const TRANSACTION_TYPE_ICONS: Record<string, string> = {
  PREDICTION_BET: "💰",
  PREDICTION_WIN: "🎉",
  PREDICTION_LOSS: "❌",
  DAILY_BONUS: "🎁",
  MISSION_REWARD: "⭐",
  SHOP_PURCHASE: "🛒",
  ADMIN_ADJUSTMENT: "⚙️",
  REFERRAL_BONUS: "👥",
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
      const response = await fetch("/api/wallet/daily-bonus", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore nel riscatto del bonus");
      }

      setSuccessMessage(data.message);
      // Ricarica i dati
      await fetchWalletData();
    } catch (err: any) {
      console.error("Error claiming daily bonus:", err);
      setError(err.message || "Errore nel riscatto del bonus giornaliero");
    } finally {
      setClaimingBonus(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("it-IT").format(amount);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-fg-muted font-medium">Caricamento wallet...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!stats && !loading && error) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold text-fg mb-6">Il Mio Wallet</h1>
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400">
            <p className="mb-4">{error}</p>
            <button type="button" onClick={() => fetchWalletData()} className="min-h-[48px] px-5 py-2.5 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 focus-visible:ring-offset-bg">
              Riprova
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-2xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-fg mb-1">Il Mio Wallet</h1>
          <p className="text-fg-muted text-sm md:text-base">Crediti e transazioni</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-sm">
            {successMessage}
          </div>
        )}

        <div className="mb-6 p-5 md:p-6 rounded-2xl glass-elevated border-2 border-primary/20">
          <p className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-1">Crediti disponibili</p>
          <p className="text-3xl md:text-4xl font-bold text-primary">{formatAmount(stats.credits)}</p>
        </div>

        <p className="mb-6 text-sm text-fg-muted italic">
          I crediti sono virtuali e non hanno valore monetario. Non sono convertibili né prelevabili.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="glass rounded-2xl border border-border dark:border-white/10 p-4 md:p-6">
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-1">Guadagnati</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-500 dark:text-emerald-400">+{formatAmount(stats.totalEarned)}</p>
          </div>
          <div className="glass rounded-2xl border border-border dark:border-white/10 p-4 md:p-6">
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-1">Spesi</p>
            <p className="text-2xl md:text-3xl font-bold text-red-500 dark:text-red-400">−{formatAmount(stats.totalSpent)}</p>
          </div>
          <div className="glass rounded-2xl border border-border dark:border-white/10 p-4 md:p-6 col-span-2 lg:col-span-1 flex items-center">
            <StreakBadge streak={stats.streak} size="lg" />
          </div>
        </div>

        <div className="glass rounded-2xl border border-border dark:border-white/10 p-5 md:p-6 mb-6">
          <h2 className="text-lg font-bold text-fg mb-3">Ritira bonus giornaliero</h2>
          <p className="text-fg-muted text-sm mb-4">
            {stats.canClaimDailyBonus
              ? `Riscatta ${formatAmount(stats.nextBonusAmount)} crediti oggi.`
              : "Prossimo bonus domani."}
          </p>
          {stats.lastDailyBonus && <p className="text-xs text-fg-muted mb-3">Ultimo: {formatDate(stats.lastDailyBonus)}</p>}
          {stats.streak > 0 && <p className="text-xs text-fg-muted mb-4">Streak +{stats.streak * 10} crediti extra</p>}
          <button
            type="button"
            onClick={handleClaimDailyBonus}
            disabled={!stats.canClaimDailyBonus || claimingBonus}
            className={`w-full min-h-[48px] rounded-2xl font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:ring-amber-500 ${
              stats.canClaimDailyBonus && !claimingBonus
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-glow"
                : "bg-surface/50 text-fg-muted cursor-not-allowed border border-border dark:border-white/10"
            }`}
          >
            {claimingBonus ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Riscatto...
              </span>
            ) : stats.canClaimDailyBonus ? (
              <span className="flex items-center justify-center gap-2">🎁 Ritira bonus giornaliero</span>
            ) : (
              <span className="flex items-center justify-center gap-2">Prossimo bonus domani</span>
            )}
          </button>
        </div>

        <div className="glass rounded-2xl border border-border dark:border-white/10 p-5 md:p-6">
          <h2 className="text-lg font-bold text-fg mb-4">Storico transazioni</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-fg-muted text-sm">
              <p>Nessuna transazione ancora.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {transactions.map((transaction) => {
                  const isPositive = transaction.amount > 0;
                  const typeLabel = TRANSACTION_TYPE_LABELS[transaction.type] || transaction.type;
                  const typeIcon = TRANSACTION_TYPE_ICONS[transaction.type] || "💰";
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-border dark:border-white/10 hover:bg-surface/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{typeIcon}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-fg truncate">{typeLabel}</p>
                          <p className="text-xs text-fg-muted">{formatDate(transaction.createdAt)}</p>
                          {transaction.description && (
                            <p className="text-xs text-fg-muted truncate mt-0.5" title={transaction.description}>
                              {transaction.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-semibold ${isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                          {isPositive ? "+" : ""}{formatAmount(transaction.amount)}
                        </p>
                        <p className="text-xs text-fg-muted">Saldo {formatAmount(transaction.balanceAfter)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {pagination?.hasMore && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMoreTransactions}
                    disabled={loadingMore}
                    className="min-h-[44px] px-5 py-2.5 rounded-2xl border border-border dark:border-white/10 bg-surface/50 text-fg font-medium hover:bg-surface transition-colors disabled:opacity-60"
                  >
                    {loadingMore ? "Caricamento..." : "Carica altre"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
