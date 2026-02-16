"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { trackView } from "@/lib/analytics-client";

interface ShopItem {
  id: string;
  name: string;
  type: string;
  priceCredits: number;
  description: string | null;
  active: boolean;
  createdAt: string;
}

export default function ShopPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      trackView("SHOP_VIEWED");
      fetchShopData();
    }
  }, [status, router]);

  const fetchShopData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch("/api/shop/items"),
        fetch("/api/wallet/stats"),
      ]);

      if (!itemsRes.ok) throw new Error("Errore nel caricamento dei prodotti");
      const itemsData = await itemsRes.json();
      setItems(itemsData);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setUserCredits(stats.credits);
      }
    } catch (err) {
      console.error("Error fetching shop data:", err);
      setError("Errore nel caricamento dello shop");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    if (userCredits !== null && userCredits < item.priceCredits) {
      setError("Crediti insufficienti");
      return;
    }
    setPurchasingId(item.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Errore durante l'acquisto");
        return;
      }

      setSuccessMessage(data.message);
      setUserCredits(data.newCredits);
    } catch (err) {
      console.error("Error purchasing:", err);
      setError("Errore durante l'acquisto");
    } finally {
      setPurchasingId(null);
    }
  };

  const formatAmount = (n: number) => new Intl.NumberFormat("it-IT").format(n);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-fg-muted font-medium">Caricamento shop...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-2xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-fg mb-1">Credit Shop</h1>
          <p className="text-fg-muted text-sm md:text-base">Acquista con i tuoi crediti virtuali</p>
        </div>

        <div className="mb-6 p-4 rounded-2xl bg-warning-bg/90 border border-warning/30 text-warning dark:bg-warning-bg/50 dark:text-warning text-sm">
          Tutti gli acquisti usano crediti virtuali. I crediti non hanno valore reale e non sono prelevabili o convertibili.
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-success-bg/90 border border-success/30 rounded-2xl text-success dark:bg-success-bg/50 dark:text-success text-sm">
            {successMessage}
          </div>
        )}

        {userCredits !== null && (
          <p className="mb-4 text-sm text-fg-muted">
            Crediti disponibili: <span className="font-semibold text-primary">{formatAmount(userCredits)}</span>
            {" · "}
            <Link href="/wallet" className="text-primary hover:underline">
              Vai al Wallet
            </Link>
          </p>
        )}

        {items.length === 0 ? (
          <div className="glass rounded-2xl border border-border dark:border-white/10 p-8 text-center">
            <p className="text-fg-muted">Nessun prodotto disponibile al momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const canAfford = userCredits !== null && userCredits >= item.priceCredits;
              const isPurchasing = purchasingId === item.id;
              return (
                <div
                  key={item.id}
                  className="glass rounded-2xl border border-border dark:border-white/10 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-fg">{item.name}</h2>
                    {item.description && (
                      <p className="text-sm text-fg-muted mt-1">{item.description}</p>
                    )}
                    <p className="mt-2 text-primary font-semibold">{formatAmount(item.priceCredits)} crediti</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford || isPurchasing}
                    className={`shrink-0 min-h-[48px] px-6 py-3 rounded-2xl font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-bg ${
                      canAfford && !isPurchasing
                        ? "bg-primary text-white hover:bg-primary-hover"
                        : "bg-surface/50 text-fg-muted cursor-not-allowed border border-border dark:border-white/10"
                    }`}
                  >
                    {isPurchasing ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        Acquisto...
                      </span>
                    ) : canAfford ? (
                      "Acquista"
                    ) : (
                      "Crediti insufficienti"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
