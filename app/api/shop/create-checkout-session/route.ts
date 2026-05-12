import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { CREDIT_BUNDLES_EUR, type CreditBundleEurDisplay } from "@/lib/shop-display-config";

const BUNDLE_MAP = new Map<string, CreditBundleEurDisplay>(
  CREDIT_BUNDLES_EUR.map((b) => [b.id, b])
);

function getSiteUrl(): string {
  return (
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Devi essere autenticato per acquistare" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const bundleId: string | undefined = body?.bundleId;

  if (!bundleId || typeof bundleId !== "string") {
    return NextResponse.json({ error: "bundleId è obbligatorio" }, { status: 400 });
  }

  const bundle = BUNDLE_MAP.get(bundleId);
  if (!bundle) {
    return NextResponse.json({ error: "Bundle non trovato" }, { status: 404 });
  }

  const siteUrl = getSiteUrl();
  const priceInCents = Math.round(bundle.priceEur * 100);

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: priceInCents,
            product_data: {
              name: `PredictionMaster — Pacchetto ${bundle.name}`,
              description: `${new Intl.NumberFormat("it-IT").format(bundle.credits)} crediti`,
            },
          },
        },
      ],
      metadata: {
        userId: session.user.id,
        bundleId: bundle.id,
        credits: String(bundle.credits),
      },
      customer_email: session.user.email ?? undefined,
      success_url: `${siteUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/shop`,
      locale: "it",
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del checkout" },
      { status: 500 }
    );
  }
}
