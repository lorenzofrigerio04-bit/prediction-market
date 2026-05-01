/**
 * Evita che il popup crediti benvenuto si riapra mentre la sessione NextAuth
 * client è ancora obsoleta (showCreditsWelcome === true dopo dismiss sul server).
 */

const PREFIX = "pm_welcome_credits_done_";

export function setWelcomeCreditsDismissedClient(userId: string) {
  try {
    sessionStorage.setItem(PREFIX + userId, "1");
  } catch {
    /* private mode / quota */
  }
}

export function isWelcomeCreditsDismissedClient(userId: string): boolean {
  try {
    return sessionStorage.getItem(PREFIX + userId) === "1";
  } catch {
    return false;
  }
}

export function clearAllWelcomeCreditsDismissedClient() {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(PREFIX)) sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}
