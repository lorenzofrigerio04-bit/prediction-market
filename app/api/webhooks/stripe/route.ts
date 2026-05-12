import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";

export const dynamic = "force-dynamic";

// Raw body is required for Stripe signature verification.
// Next.js App Router provides it via request.text().
export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, credits, bundleId } = session.metadata ?? {};

  if (!userId || !credits || !bundleId) {
    console.error("Stripe webhook: missing metadata on session", session.id);
    return;
  }

  const creditsAmount = parseInt(credits, 10);
  if (isNaN(creditsAmount) || creditsAmount <= 0) {
    console.error("Stripe webhook: invalid credits value in metadata", credits);
    return;
  }

  // Idempotency: skip if we already credited this Stripe session.
  const existing = await prisma.transaction.findFirst({
    where: { referenceId: session.id },
    select: { id: true },
  });
  if (existing) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    console.error("Stripe webhook: user not found", userId);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await applyCreditTransaction(tx, userId, "CREDIT_PURCHASE", creditsAmount, {
      referenceId: session.id,
      referenceType: "stripe_checkout",
      description: `Acquisto crediti — bundle ${bundleId}`,
    });
  });

  console.log(`Stripe: credited ${creditsAmount} credits to user ${userId} (session ${session.id})`);
}
