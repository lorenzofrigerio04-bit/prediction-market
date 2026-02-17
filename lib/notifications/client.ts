/**
 * Client-side utilities per generare notifiche
 */

/**
 * Chiama l'endpoint per generare notifiche on-demand
 * Best-effort: non blocca se fallisce
 */
export async function generateNotificationsOnDemand(): Promise<void> {
  try {
    await fetch('/api/notifications/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Best-effort: silenzioso fallimento
    console.debug('Failed to generate notifications (non-blocking):', error);
  }
}
