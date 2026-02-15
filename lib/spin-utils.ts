/** Inizio del giorno in UTC (00:00:00). */
export function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/** Il timestamp lastSpin.createdAt è oggi (UTC)? */
export function isTodayUTC(createdAt: Date): boolean {
  const now = new Date();
  const todayStart = startOfDayUTC(now);
  const spinStart = startOfDayUTC(new Date(createdAt));
  return spinStart.getTime() === todayStart.getTime();
}
