/**
 * ClosesAt Deterministico
 * BLOCCO 4: Calcolo closesAt da horizonDays del template
 * 
 * Regole:
 * - closesAt = now + horizonDays (scegli in range template: preferisci min per momentum alto, max per momentum medio)
 * - clamp: minimo now + 30min, massimo now + 365 giorni
 * - arrotonda a HH:00 UTC (default)
 */

/**
 * Calcola closesAt deterministically
 * 
 * @param horizonDaysMin - Giorni minimi dal template
 * @param horizonDaysMax - Giorni massimi dal template
 * @param momentum - Momentum della storyline (0-1)
 * @param now - Data corrente
 * @returns Date closesAt arrotondata a HH:00 UTC
 */
export function computeClosesAt(
  horizonDaysMin: number,
  horizonDaysMax: number,
  momentum: number,
  now: Date = new Date()
): Date {
  // Scegli giorni in base a momentum:
  // momentum alto (>0.7) -> preferisci min per momentum alto
  // momentum medio/basso -> preferisci max
  let horizonDays: number;
  if (momentum > 0.7) {
    horizonDays = horizonDaysMin;
  } else {
    horizonDays = horizonDaysMax;
  }
  
  // Calcola data base
  const baseDate = new Date(now.getTime() + horizonDays * 24 * 60 * 60 * 1000);
  
  // Clamp: minimo now + 30min, massimo now + 365 giorni
  const minClose = new Date(now.getTime() + 30 * 60 * 1000); // +30 minuti
  const maxClose = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // +365 giorni
  
  let clampedDate = baseDate;
  if (clampedDate.getTime() < minClose.getTime()) {
    clampedDate = minClose;
  } else if (clampedDate.getTime() > maxClose.getTime()) {
    clampedDate = maxClose;
  }
  
  // Arrotonda a HH:00 UTC
  const utcDate = new Date(clampedDate.toISOString());
  utcDate.setUTCMinutes(0);
  utcDate.setUTCSeconds(0);
  utcDate.setUTCMilliseconds(0);
  
  return utcDate;
}
