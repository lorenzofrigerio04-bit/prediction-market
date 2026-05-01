"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import VirtualCreditsGlyph from "@/components/ui/VirtualCreditsGlyph";

function formatCredits(n: number): string {
  try {
    return new Intl.NumberFormat("it-IT", {
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return String(Math.floor(n));
  }
}

/** Saldo nell’header: pill come “Registrati”, liquid glass minimal */
export default function HeaderCreditsBadge() {
  const { status } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (status !== "authenticated") {
      setCredits(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/credits", { cache: "no-store" });
      if (!res.ok) {
        setCredits(null);
        return;
      }
      const data = (await res.json()) as { credits?: number };
      setCredits(typeof data.credits === "number" ? data.credits : null);
    } catch {
      setCredits(null);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [status, load]);

  if (status !== "authenticated") return null;

  const display =
    loading || credits === null ? "···" : formatCredits(credits);

  return (
    <Link
      href="/shop"
      className="header-auth-btn header-credits-pill"
      aria-label={`Saldo crediti: ${loading || credits === null ? "caricamento" : formatCredits(credits)}. Apri lo shop`}
    >
      <span className="header-credits-pill__shine" aria-hidden />
      <span className="header-credits-pill__inner relative z-[1] flex items-center gap-1.5 min-w-0">
        <span className="header-credits-pill__mark header-credits-pill__currency" aria-hidden>
          <VirtualCreditsGlyph className="size-[15px] shrink-0" aria-hidden />
        </span>
        <span className="flex items-baseline gap-1.5 min-w-0 leading-none">
          <span className="tabular-nums font-semibold tracking-tight text-[12px] text-white">
            {display}
          </span>
          <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
            cr
          </span>
        </span>
      </span>
    </Link>
  );
}
