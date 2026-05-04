"use client";

type MysteryRarity = "comune" | "raro" | "epico" | "leggendario";

export function mysteryRailPremiumMotion(rarity: MysteryRarity): boolean {
  return rarity === "epico" || rarity === "leggendario";
}

/** Raggio + fascio luminoso su card epiche/leggendarie nei rail mystery shop. */
export function MysteryRailPremiumFx({ variant }: { variant: "epic" | "legend" }) {
  const epic = variant === "epic";
  return (
    <>
      <span
        className={[
          "shop-mystery-rail-premium-scan pointer-events-none absolute inset-0 z-[3]",
          epic ? "shop-mystery-rail-premium-scan--epic" : "shop-mystery-rail-premium-scan--legend",
        ].join(" ")}
        aria-hidden
      />
      <span
        className={[
          "shop-mystery-rail-premium-flash pointer-events-none absolute inset-0 z-[2]",
          epic ? "shop-mystery-rail-premium-flash--epic" : "shop-mystery-rail-premium-flash--legend",
        ].join(" ")}
        aria-hidden
      />
    </>
  );
}
