/** Label breve per countdown chiusura mercato (card / badge). */
export function formatEventExpiryShort(closesAt: string): string {
  const d = new Date(closesAt);
  if (!isFinite(d.getTime())) return "";
  const now = Date.now();
  const diffMs = d.getTime() - now;
  if (diffMs <= 0) return "chiuso";
  const diffH = diffMs / 3_600_000;
  if (diffH < 1) return "< 1h";
  if (diffH < 24) return `${Math.floor(diffH)}h`;
  const diffD = diffMs / 86_400_000;
  if (diffD < 2) return "domani";
  if (diffD < 7) return `${Math.floor(diffD)}g`;
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" }).replace(".", "");
}
