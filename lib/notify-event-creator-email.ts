import { prisma } from "@/lib/prisma";
import { getCanonicalBaseUrl } from "@/lib/canonical-base-url";
import { sendEventCreatedCongratulationsEmail } from "@/lib/email";

/**
 * Invia email di congratulazioni al creatore quando un evento viene pubblicato (non blocca la richiesta se fallisce).
 */
export async function notifyCreatorEventPublishedEmail(
  creatorUserId: string,
  eventId: string,
  eventTitle: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: creatorUserId },
    select: { email: true, role: true },
  });
  if (!user?.email) return;
  if (user.role === "BOT" || user.role === "SYSTEM") return;

  const base = getCanonicalBaseUrl();
  const url = `${base}/eventi/${eventId}`;
  const res = await sendEventCreatedCongratulationsEmail(user.email, eventTitle, url);
  if (!res.ok) {
    console.error("[notifyCreatorEventPublishedEmail]", res.error);
  }
}
