import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  evaluateAdminCapability,
  type AdminCapabilityAction,
} from "@/lib/integration/adapters/admin-capability-adapter";

/**
 * Verifica se l'utente corrente è un admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return false;
  }

  // Controlla il ruolo dalla sessione
  if (session.user.role === "ADMIN") {
    return true;
  }

  // Fallback: controlla direttamente dal database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

/**
 * Ottiene l'utente corrente e verifica se è admin
 * Lancia un errore se non è autenticato o non è admin
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Non autenticato");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const role = session.user.role ?? dbUser?.role ?? null;
  const decision = evaluateAdminCapability("events:create", {
    userId: session.user.id,
    role,
  });
  if (!decision.allowed) throw new Error(decision.reason ?? "Accesso negato");

  return session.user;
}

/**
 * Verifica capability admin specifica (bridge verso layer policy/governance).
 */
export async function requireAdminCapability(action: AdminCapabilityAction) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Non autenticato");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const role = session.user.role ?? dbUser?.role ?? null;
  const decision = evaluateAdminCapability(action, {
    userId: session.user.id,
    role,
  });
  if (!decision.allowed) {
    throw new Error(decision.reason ?? "Accesso negato");
  }

  return session.user;
}
