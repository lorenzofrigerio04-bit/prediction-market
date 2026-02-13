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
  PREDICTION_BET: "Scommessa",
  PREDICTION_WIN: "Vincita",
  PREDICTION_LOSS: "Perdita",
  DAILY_BONUS: "Bonus Giornaliero",
  MISSION_REWARD: "Ricompensa Missione",
  ADMIN_ADJUSTMENT: "Aggiustamento Admin",
  REFERRAL_BONUS: "Bonus Referral",
};

const TRANSACTION_TYPE_ICONS: Record<string, string> = {
  PREDICTION_BET: "💰",
  PREDICTION_WIN: "🎉",
  PREDICTION_LOSS: "❌",
  DAILY_BONUS: "🎁",
  MISSION_REWARD: "⭐",
  ADMIN_ADJUSTMENT: "⚙️",
  REFERRAL_BONUS: "👥",
};

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchWalletData();
    }
  }, [status, router]);

  const fetchWalletData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, transactionsRes] = await Promise.all([
        fetch("/api/wallet/stats"),
        fetch("/api/wallet/transactions?limit=50"),
      ]);

      if (!statsRes.ok) throw new Error("Errore nel caricamento delle statistiche");
      if (!transactionsRes.ok) throw new Error("Errore nel caricamento delle transazioni");

      const statsData = await statsRes.json();
      const transactionsData: TransactionsResponse = await transactionsRes.json();

      setStats(statsData);
      setTransactions(transactionsData.transactions);
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError("Errore nel caricamento dei dati del wallet");
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Caricamento wallet...</p>
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Il Mio Wallet</h1>
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchWalletData}
              className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
            >
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Il Mio Wallet</h1>
          <p className="text-gray-600">Gestisci i tuoi crediti e visualizza le transazioni</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Credits Balance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Crediti Attuali</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatAmount(stats.credits)}</p>
          </div>

          {/* Total Earned */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Totali Guadagnati</h3>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatAmount(stats.totalEarned)}</p>
          </div>

          {/* Total Spent */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Totali Spesi</h3>
              <span className="text-2xl">📉</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{formatAmount(stats.totalSpent)}</p>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Streak</h3>
            </div>
            <div className="flex items-center justify-start">
              <StreakBadge streak={stats.streak} size="lg" />
            </div>
          </div>
        </div>

        {/* Daily Bonus Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Bonus Giornaliero</h2>
              <p className="text-gray-600 mb-1">
                {stats.canClaimDailyBonus
                  ? `Riscatta ${formatAmount(stats.nextBonusAmount)} crediti oggi!`
                  : "Hai già riscattato il bonus giornaliero oggi"}
              </p>
              {stats.lastDailyBonus && (
                <p className="text-sm text-gray-500">
                  Ultimo riscatto: {formatDate(stats.lastDailyBonus)}
                </p>
              )}
              {stats.streak > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Il tuo streak aumenta il bonus di {stats.streak * 10} crediti!
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClaimDailyBonus}
              disabled={!stats.canClaimDailyBonus || claimingBonus}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 ${
                stats.canClaimDailyBonus && !claimingBonus
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {claimingBonus ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Riscatto...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>🎁</span>
                  Riscatta Bonus
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Storico Transazioni</h2>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessuna transazione ancora.</p>
              <p className="text-sm mt-2">Le tue transazioni appariranno qui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isPositive = transaction.amount > 0;
                const typeLabel =
                  TRANSACTION_TYPE_LABELS[transaction.type] || transaction.type;
                const typeIcon =
                  TRANSACTION_TYPE_ICONS[transaction.type] || "💰";

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeIcon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{typeLabel}</p>
                        {transaction.description && (
                          <p className="text-sm text-gray-500">{transaction.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {formatAmount(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Saldo: {formatAmount(transaction.balanceAfter)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
