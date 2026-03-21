/**
 * Get event generator user ID for system-created events.
 * Extracted from event-generation for shared use (odds, seed scripts).
 */

import type { PrismaClient } from "@prisma/client";

const SYSTEM_USER_EMAIL = "event-generator@system";

/**
 * Restituisce l'id dell'utente da usare come creatore degli eventi generati:
 * EVENT_GENERATOR_USER_ID da env, oppure utente event-generator@system, oppure primo admin.
 */
export async function getEventGeneratorUserId(prisma: PrismaClient): Promise<string> {
  const envId = process.env.EVENT_GENERATOR_USER_ID?.trim();
  if (envId) {
    const user = await prisma.user.findUnique({ where: { id: envId }, select: { id: true } });
    if (user) return user.id;
  }
  const systemUser = await prisma.user.findUnique({
    where: { email: SYSTEM_USER_EMAIL },
    select: { id: true },
  });
  if (systemUser) return systemUser.id;
  const firstAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (firstAdmin) return firstAdmin.id;
  throw new Error(
    "Nessun utente disponibile per la creazione eventi: imposta EVENT_GENERATOR_USER_ID o esegui il seed (utente sistema o admin)."
  );
}
