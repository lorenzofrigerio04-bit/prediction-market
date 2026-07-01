import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Restituisce il client Stripe, istanziandolo alla prima chiamata.
 * L'istanza (e il controllo della chiave) avvengono a runtime, non al
 * momento dell'import: così `next build` può raccogliere i dati delle
 * route che importano questo modulo anche senza STRIPE_SECRET_KEY.
 */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  _stripe = new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
  });
  return _stripe;
}
