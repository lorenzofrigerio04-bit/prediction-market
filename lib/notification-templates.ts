/**
 * Template notifiche in italiano (Fase 6 – THINGS_TO_DO).
 * Usare questi messaggi quando si creano notifiche lato server.
 */

import { NotificationType } from './notifications/types';
import type { NotificationData } from './notifications/types';

/** Evento risolto: "L'evento [titolo] è stato risolto: [SÌ/NO]." */
export function eventResolvedMessage(title: string, outcome: "YES" | "NO"): string {
  const result = outcome === "YES" ? "SÌ" : "NO";
  return `L'evento "${title}" è stato risolto: ${result}.`;
}

/** Missione completata: "Missione completata: +[X] crediti." */
export function missionCompletedMessage(credits: number): string {
  return `Missione completata: +${credits} crediti.`;
}

/** Serie a rischio: "La tua serie è a rischio. Fai login per mantenerla." */
export const STREAK_AT_RISK_MESSAGE =
  "La tua serie è a rischio. Fai login per mantenerla.";

export const STREAK_AT_RISK_TITLE = "Serie a rischio";

/**
 * Genera il titolo di una notifica dal suo tipo e dati
 */
export function getNotificationTitle(
  type: string,
  data: any
): string {
  switch (type) {
    case NotificationType.EVENT_CLOSING_SOON:
      return "Evento in chiusura";
    case NotificationType.EVENT_RESOLVED:
      return "Evento risolto";
    case NotificationType.RANK_UP:
      return "Salita in classifica";
    case NotificationType.STREAK_RISK:
      return STREAK_AT_RISK_TITLE;
    case NotificationType.COMMENT_REPLY:
      return "Nuova risposta al tuo commento";
    case NotificationType.BADGE_AWARDED:
      return "Badge sbloccato! 🎉";
    case NotificationType.MISSION_COMPLETED:
      return "Missione completata";
    default:
      return "Nuova notifica";
  }
}

/**
 * Genera il messaggio di una notifica dal suo tipo e dati
 */
export function getNotificationMessage(
  type: string,
  data: any
): string {
  switch (type) {
    case NotificationType.EVENT_CLOSING_SOON:
      return `"${data?.eventTitle || 'Evento'}" chiude tra poco!`;
    case NotificationType.EVENT_RESOLVED:
      return `"${data?.eventTitle || 'Evento'}" è stato risolto: ${data?.outcome === 'yes' ? 'Sì' : 'No'}`;
    case NotificationType.RANK_UP:
      return `Sei salito dalla posizione ${data?.oldRank || '?'} alla ${data?.newRank || '?'}! 🎉`;
    case NotificationType.STREAK_RISK:
      return `Attenzione! La tua streak di ${data?.currentStreak || 0} giorni rischia di finire. Fai una previsione entro ${data?.hoursUntilMidnight || 0} ore!`;
    case NotificationType.COMMENT_REPLY:
      return `${data?.replierName || 'Qualcuno'} ha risposto al tuo commento su "${data?.eventTitle || 'un evento'}"`;
    case NotificationType.BADGE_AWARDED:
      return `Hai sbloccato il badge "${data?.badgeName || 'Badge'}: ${data?.badgeDescription || ''}"`;
    case NotificationType.MISSION_COMPLETED:
      return `Missione completata: +${data?.reward || 0} crediti.`;
    default:
      return 'Nuova notifica';
  }
}

/**
 * Ottiene il link di riferimento per una notifica
 */
export function getNotificationLink(
  type: string,
  data: any
): string | null {
  switch (type) {
    case NotificationType.EVENT_CLOSING_SOON:
    case NotificationType.EVENT_RESOLVED:
      return data?.eventId ? `/events/${data.eventId}` : null;
    case NotificationType.COMMENT_REPLY:
      return data?.eventId ? `/events/${data.eventId}` : null;
    case NotificationType.BADGE_AWARDED:
    case NotificationType.MISSION_COMPLETED:
      return '/profile';
    case NotificationType.STREAK_RISK:
      return '/wallet';
    default:
      return null;
  }
}
