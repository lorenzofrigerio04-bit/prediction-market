import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) {
    throw new Error("Accesso negato: richiesti privilegi admin");
  }

  return session.user;
}
