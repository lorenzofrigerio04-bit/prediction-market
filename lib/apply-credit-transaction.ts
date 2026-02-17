import type { PrismaClient } from "@prisma/client";
import type { CreditTransactionType } from "./credits-config";

/** Client Prisma o transaction client (stessa interfaccia per user + transaction) */
type PrismaTx = Pick<PrismaClient, "user" | "transaction">;

export interface ApplyCreditTransactionOptions {
  description?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  /** Se true, non modifica user.credits/totalEarned/totalSpent (solo registra in storico, es. PREDICTION_LOSS) */
  skipUserUpdate?: boolean;
  /** Se true e amount > 0, applica il moltiplicatore boost attivo (Spin of the Day) */
  applyBoost?: boolean;
}

/**
 * Applica una transazione crediti: aggiorna user (credits, totalEarned/totalSpent) e crea riga Transaction.
 * Usare sempre questa funzione per ogni movimento crediti (missioni, bonus, previsioni, ecc.).
 *
 * @param tx - Prisma client o transaction client (da $transaction)
 * @param userId - ID utente
 * @param type - Tipo transazione (PREDICTION_BET, DAILY_BONUS, ...)
 * @param amount - Importo: positivo = accredito, negativo = addebito
 * @param options - referenceId, skipUserUpdate (solo storico), applyBoost
 * @returns Nuovo saldo crediti dopo la transazione
 */
export async function applyCreditTransaction(
  tx: PrismaTx,
  userId: string,
  type: CreditTransactionType,
  amount: number,
  options?: ApplyCreditTransactionOptions
): Promise<number> {
  const {
    description = null,
    referenceId = null,
    referenceType = null,
    skipUserUpdate = false,
    applyBoost = false,
  } = options ?? {};

  if (amount === 0) {
    const u = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    return u?.credits ?? 0;
  }

  if (skipUserUpdate) {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    const balanceAfter = user?.credits ?? 0;
    await tx.transaction.create({
      data: {
        userId,
        type,
        amount,
        referenceId,
      },
    });
    return balanceAfter;
  }

  const isCredit = amount > 0;
  let effectiveAmount = Math.abs(amount);
  if (isCredit && applyBoost) {
  if (isCredit && applyBoost) {
    // boostMultiplier e boostExpiresAt non esistono nello schema - nessun boost applicato
    effectiveAmount = Math.abs(amount);
  }
  }

  const updated = await tx.user.update({
    where: { id: userId },
    data: {
      credits: { [isCredit ? "increment" : "decrement"]: effectiveAmount },
      ...(isCredit
        ? { totalEarned: { increment: effectiveAmount } }
        : { totalSpent: { increment: effectiveAmount } }),
    },
    select: { credits: true },
  });

  await tx.transaction.create({
    data: {
      userId,
      type,
      amount: isCredit ? effectiveAmount : -effectiveAmount,
      referenceId,
    },
  });

  return updated.credits;
}
