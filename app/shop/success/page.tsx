import Link from "next/link";
import Header from "@/components/Header";

export const metadata = { title: "Acquisto completato — PredictionMaster" };

export default function ShopSuccessPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header showCategoryStrip={false} />
      <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(10,186,181,0.12)] ring-1 ring-[rgba(10,186,181,0.35)]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden
          >
            <path
              d="M5 14.5l7 7L23 7"
              stroke="#21B9B4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mt-6 font-kalshi text-3xl font-bold tracking-[-0.02em] text-white">
          Pagamento completato
        </h1>
        <p className="mt-3 text-ds-body leading-relaxed text-white/55">
          I tuoi crediti sono stati accreditati sul tuo account. Puoi usarli subito
          per fare previsioni.
        </p>

        <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
          <Link href="/discover" className="signup-cta-premium text-center">
            Esplora gli eventi
          </Link>
          <Link
            href="/shop"
            className="py-2.5 text-ds-body-sm text-white/40 transition-colors hover:text-white/70"
          >
            Torna allo shop
          </Link>
        </div>
      </main>
    </div>
  );
}
