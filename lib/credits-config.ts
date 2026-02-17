/**
 * Configurazione centralizzata di tutti i reward e valori crediti.
 * Unica fonte di verità: niente numeri casuali nel codice.
 */

/** Crediti assegnati alla registrazione (signup email; OAuth usa default schema) */
export const INITIAL_CREDITS = 1000;

/** Bonus giornaliero: importo base (prima del moltiplicatore streak) */
export const DAILY_BONUS_BASE = 50;

/** Moltiplicatore streak: +10% per ogni giorno consecutivo (es. 2 giorni = 1.2x) */
export const STREAK_MULTIPLIER_PER_DAY = 0.1;

/** Massimo giorni streak per il moltiplicatore (10 giorni = 2x, poi resta 2x) */
export const STREAK_CAP = 10;

/** Moltiplicatore massimo bonus giornaliero (2x = 100 crediti con base 50) */
export const DAILY_BONUS_MAX_MULTIPLIER = 2;

/**
 * Calcola l'importo del prossimo bonus giornaliero in base allo streak.
 * Streak = giorni consecutivi già completati; se può claimare oggi, il bonus si applica con streak+1.
 */
export function getNextDailyBonusAmount(
  currentStreak: number,
  canClaimToday: boolean
): number {
  const effectiveStreak = currentStreak + (canClaimToday ? 1 : 0);
  const multiplier = Math.min(
    DAILY_BONUS_MAX_MULTIPLIER,
    1 + Math.min(effectiveStreak, STREAK_CAP) * STREAK_MULTIPLIER_PER_DAY
  );
  return Math.round(DAILY_BONUS_BASE * multiplier);
}

/**
 * Calcola il moltiplicatore bonus per uno streak dato (per UI, es. "x1.2").
 */
export function getDailyBonusMultiplier(streak: number): number {
  const m = Math.min(
    DAILY_BONUS_MAX_MULTIPLIER,
    1 + Math.min(streak, STREAK_CAP) * STREAK_MULTIPLIER_PER_DAY
  );
  return Math.round(m * 100) / 100;
}

/** Tipi di transazione crediti (allineati al DB e alla UI) */
export const CREDIT_TRANSACTION_TYPES = {
  PREDICTION_BET: "PREDICTION_BET",
  PREDICTION_WIN: "PREDICTION_WIN",
  PREDICTION_LOSS: "PREDICTION_LOSS",
  DAILY_BONUS: "DAILY_BONUS",
  MISSION_REWARD: "MISSION_REWARD",
  ADMIN_ADJUSTMENT: "ADMIN_ADJUSTMENT",
  REFERRAL_BONUS: "REFERRAL_BONUS",
  SIGNUP_CREDITS: "SIGNUP_CREDITS",
  SPIN_REWARD: "SPIN_REWARD",
  /** Crediti vinti dalla ruota non ancora incassati (pending) */
  SPIN_PENDING: "SPIN_PENDING",
  /** Rimborso/ricarica crediti per utenti bot della simulazione */
  SIMULATED_TOPUP: "SIMULATED_TOPUP",
  /** Acquisto da shop (spesa crediti) */
  SHOP_PURCHASE: "SHOP_PURCHASE",
} as const;

export type CreditTransactionType =
  (typeof CREDIT_TRANSACTION_TYPES)[keyof typeof CREDIT_TRANSACTION_TYPES];
