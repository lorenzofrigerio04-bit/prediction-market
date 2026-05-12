"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import {
  MYSTERY_TIER_COST_MASTER_COINS,
  pickMysteryWinner,
  type MysteryUnboxingRarity,
  type MysteryUnboxingTier,
} from "@/lib/shop-mystery-unboxing";

const ShopMysteryUnboxingOverlay = dynamic(
  () => import("@/components/shop/ShopMysteryUnboxingOverlay"),
  { ssr: false }
);

export interface MysteryUnboxingSession {
  /** id univoco, cambia ad ogni open per re-mount completo dell'arena. */
  sessionId: string;
  tier: MysteryUnboxingTier;
  winner: MysteryUnboxingRarity;
  costMasterCoins: number;
}

interface MysteryUnboxingContextValue {
  isOpen: boolean;
  open: (tier: MysteryUnboxingTier) => void;
  close: () => void;
  reroll: () => void;
}

const MysteryUnboxingContext = createContext<MysteryUnboxingContextValue | null>(null);

export function useMysteryUnboxing(): MysteryUnboxingContextValue {
  const ctx = useContext(MysteryUnboxingContext);
  if (!ctx) {
    throw new Error("useMysteryUnboxing deve essere usato dentro <ShopMysteryUnboxingProvider>");
  }
  return ctx;
}

export default function ShopMysteryUnboxingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<MysteryUnboxingSession | null>(null);
  const { data: authSession } = useSession();
  const isAdmin = authSession?.user?.role === "ADMIN";
  const isAdminRef = useRef(isAdmin);
  useEffect(() => { isAdminRef.current = isAdmin; }, [isAdmin]);

  const open = useCallback((tier: MysteryUnboxingTier) => {
    /**
     * NOTE — checkpoint server-side da agganciare:
     *   1. POST /api/shop/mystery/open { tier }
     *   2. Backend valida saldo Master coin, addebita costo, **estrae il vincitore**
     *      e ritorna `{ rarity, prizeId, balanceMasterCoins }`.
     *   3. Qui usiamo il `rarity` ricevuto invece di `pickMysteryWinner`.
     * Per ora simulazione client-side per costruire UX premium completa.
     *
     * Admin override: per il Gold Box, l'account admin ottiene sempre il premio
     * leggendario (garantisce un'esperienza demo perfetta e consente testing).
     */
    const winner: MysteryUnboxingRarity =
      tier === "gold" && isAdminRef.current ? "leggendario" : pickMysteryWinner(tier);
    setSession({
      sessionId: `mb-${tier}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      tier,
      winner,
      costMasterCoins: MYSTERY_TIER_COST_MASTER_COINS[tier],
    });
  }, []);

  const close = useCallback(() => {
    setSession(null);
  }, []);

  const reroll = useCallback(() => {
    setSession((cur) => {
      if (!cur) return cur;
      const winner: MysteryUnboxingRarity =
        cur.tier === "gold" && isAdminRef.current ? "leggendario" : pickMysteryWinner(cur.tier);
      return {
        ...cur,
        sessionId: `mb-${cur.tier}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        winner,
      };
    });
  }, []);

  const value = useMemo<MysteryUnboxingContextValue>(
    () => ({ isOpen: session !== null, open, close, reroll }),
    [session, open, close, reroll]
  );

  return (
    <MysteryUnboxingContext.Provider value={value}>
      {children}
      {session ? (
        <ShopMysteryUnboxingOverlay
          key={session.sessionId}
          session={session}
          onClose={close}
          onReroll={reroll}
        />
      ) : null}
    </MysteryUnboxingContext.Provider>
  );
}
