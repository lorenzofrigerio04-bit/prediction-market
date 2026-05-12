"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import starterPackArt from "@/assets/shop/starter-pack.png";
import proPackArt from "@/assets/shop/pro-pack.png";
import elitePackArt from "@/assets/shop/elite-pack.png";
import { CREDIT_BUNDLES_EUR } from "@/lib/shop-display-config";
import ShopPaymentModal from "@/components/shop/ShopPaymentModal";

/** Copie pubbliche allineate a `assets/shop/*.png` (import sotto). */
const STARTER_IMAGE = "/shop/starter-pack.png";
const PRO_IMAGE = "/shop/pro-pack.png";
const ELITE_IMAGE = "/shop/elite-pack.png";

const IMAGE_BUNDLE_META: Record<
  "credit_bundle_starter" | "credit_bundle_pro" | "credit_bundle_elite",
  { src: string; alt: string; imagePriority: boolean }
> = {
  credit_bundle_starter: {
    src: STARTER_IMAGE,
    alt: "Pacchetto Starter — 10.000 crediti, 0,99 € — PredictionMaster",
    imagePriority: true,
  },
  credit_bundle_pro: {
    src: PRO_IMAGE,
    alt: "Pacchetto Pro — 50.000 crediti, Il più acquistato, 3,99 € — PredictionMaster",
    imagePriority: false,
  },
  credit_bundle_elite: {
    src: ELITE_IMAGE,
    alt: "Pacchetto Elite — 150.000 crediti, 9,99 € — PredictionMaster",
    imagePriority: false,
  },
};

const PACK_ART_BY_ID: Record<
  "credit_bundle_starter" | "credit_bundle_pro" | "credit_bundle_elite",
  StaticImageData
> = {
  credit_bundle_starter: starterPackArt,
  credit_bundle_pro: proPackArt,
  credit_bundle_elite: elitePackArt,
};

/**
 * Micro-calibrazione visiva: le PNG hanno il prezzo a Y leggermente diverse.
 * Solo traslazioni sub-pixel / object-position: il resto del layout resta invariato.
 */
type PackId = "credit_bundle_starter" | "credit_bundle_pro" | "credit_bundle_elite";
const PACK_IMAGE_ALIGN: Record<PackId, { objectPosition: string; translateYpx: number }> = {
  credit_bundle_starter: { objectPosition: "50% 0", translateYpx: 0 },
  credit_bundle_pro: { objectPosition: "51.5% 0", translateYpx: 1 },
  credit_bundle_elite: { objectPosition: "50% 0", translateYpx: -1 },
};

const PACK_CORNERS = "rounded-xl sm:rounded-2xl md:rounded-3xl";

/** Contorno hairline + alone cyan morbido (coerente con --primary-glow), senza overflow sul wrapper così l'ombra non viene tagliata. */
const PACK_PREMIUM_EDGE =
  "shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_0_36px_-12px_rgb(128_250_255/0.14),0_0_1px_0_rgb(128_250_255/0.32)] transition-[box-shadow] duration-300 ease-out hover:shadow-[0_0_0_1px_rgb(255_255_255/0.14),0_0_44px_-10px_rgb(128_250_255/0.19),0_0_1px_0_rgb(128_250_255/0.45)]";

/** Stesse proporzioni dello Starter (681×1024): tutti i box hanno la stessa altezza per colonna. */
const PACK_FRAME_ASPECT = `relative block w-full min-h-0 overflow-hidden aspect-[681/1024] ${PACK_CORNERS}`;

const IMAGE_PACK_BTN =
  "relative w-full min-w-0 self-stretch";

export default function ShopCreditBundlesSection() {
  const [paymentTarget, setPaymentTarget] = useState<{
    bundleId: string;
    name: string;
    priceEur: number;
    credits: number;
  } | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 items-stretch gap-1.5 min-[400px]:gap-2 sm:gap-3 md:gap-4 lg:gap-5">
        {CREDIT_BUNDLES_EUR.map((bundle) => {
          const imageMeta = IMAGE_BUNDLE_META[bundle.id];
          const packArt = PACK_ART_BY_ID[bundle.id];
          const align = PACK_IMAGE_ALIGN[bundle.id];

          return (
            <button
              key={bundle.id}
              type="button"
              onClick={() =>
                setPaymentTarget({
                  bundleId: bundle.id,
                  name: bundle.name,
                  priceEur: bundle.priceEur,
                  credits: bundle.credits,
                })
              }
              className={`${IMAGE_PACK_BTN} ${PACK_CORNERS} ${PACK_PREMIUM_EDGE} block cursor-pointer border-0 bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-bg`}
              aria-label={`Apri pagamento pacchetto ${bundle.name}`}
            >
              <span className="block h-full w-full leading-[0] [overflow-anchor:none]">
                <div className={PACK_FRAME_ASPECT}>
                  <Image
                    src={packArt}
                    alt={imageMeta.alt}
                    fill
                    sizes="(max-width: 639px) 33vw, (max-width: 1279px) 28vw, 400px"
                    className="object-cover select-none"
                    style={{
                      objectPosition: align.objectPosition,
                      transform:
                        align.translateYpx !== 0
                          ? `translate3d(0, ${align.translateYpx}px, 0)`
                          : undefined,
                    }}
                    priority={imageMeta.imagePriority}
                    unoptimized
                    draggable={false}
                  />
                </div>
              </span>
            </button>
          );
        })}
      </div>

      <ShopPaymentModal target={paymentTarget} onClose={() => setPaymentTarget(null)} />
    </>
  );
}
