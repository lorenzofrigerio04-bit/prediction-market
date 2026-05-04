"use client";

import { MYSTERY_BOXES } from "@/lib/shop-display-config";
import MysteryBoxMarquee from "@/components/shop/MysteryBoxMarquee";
import Card from "@/components/ui/Card";
import CTAButton from "@/components/ui/CTAButton";

const pointsFmt = new Intl.NumberFormat("it-IT");

const tierEyebrow: Record<(typeof MYSTERY_BOXES)[number]["tier"], string> = {
  bronze: "text-amber-200/90",
  silver: "text-slate-200",
  gold: "text-amber-100",
};

export default function ShopLoyaltyMysterySection() {
  return (
    <div className="grid gap-8 lg:gap-10">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
        <p className="text-ds-body-sm text-fg-muted leading-relaxed">
          <span className="font-semibold text-fg">Punti fedeltà (in arrivo).</span> Gli acquisti con punti e le
          regole di earning saranno collegati da qui: per ora vedi prezzi e premi in anteprima. Gli id delle box (
          <code className="rounded bg-black/25 px-1 font-mono text-ds-micro text-accent-secondary">
            mystery_bronze
          </code>
          ,{" "}
          <code className="rounded bg-black/25 px-1 font-mono text-ds-micro text-accent-secondary">
            mystery_silver
          </code>
          ,{" "}
          <code className="rounded bg-black/25 px-1 font-mono text-ds-micro text-accent-secondary">
            mystery_gold
          </code>
          ) restano stabili per le prossime API.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {MYSTERY_BOXES.map((box) => (
          <Card
            key={box.id}
            elevated={box.tier === "gold"}
            className={`relative flex flex-col overflow-hidden p-0 ${
              box.tier === "gold"
                ? "ring-1 ring-amber-400/30 shadow-[0_0_48px_-10px_rgba(250,204,21,0.25)]"
                : ""
            }`}
          >
            <div className="border-b border-white/10 p-5 md:p-6">
              <p
                className={`text-ds-label uppercase tracking-label font-bold ${tierEyebrow[box.tier]}`}
              >
                Mystery
              </p>
              <h3 className="mt-1 font-display text-ds-h2 font-extrabold text-fg">{box.name}</h3>
              <p className="mt-2 text-ds-body-sm text-fg-muted leading-snug">{box.description}</p>
              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-stats text-xl md:text-2xl text-fg tracking-tight">
                  {pointsFmt.format(box.loyaltyPointsPrice)}
                </span>
                <span className="text-ds-label uppercase tracking-label text-fg-subtle">punti</span>
              </div>
              <p className="mt-1 text-ds-micro text-fg-subtle">Valore provvisorio</p>
            </div>

            <div className="px-4 pb-2 pt-4 md:px-5">
              <p className="mb-2 text-center text-ds-micro uppercase tracking-widest text-fg-subtle">
                Premi in anteprima
              </p>
              <MysteryBoxMarquee tier={box.tier} prizes={box.prizes} durationSec={box.marqueeDurationSec} />
            </div>

            <div className="mt-auto p-5 md:p-6 pt-4">
              <CTAButton type="button" variant="secondary" fullWidth disabled className="min-h-[48px]">
                Scambio punti — disponibile a breve
              </CTAButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
