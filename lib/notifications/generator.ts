/**
 * Generatore di notifiche on-demand
 * 
 * Questo modulo genera notifiche quando l'utente apre Home o Eventi.
 * Best-effort: non blocca se la generazione fallisce.
 */

import { NotificationType, type NotificationData } from './types';

export interface NotificationGenerationContext {
  userId: string;
  // Dati necessari per generare le notifiche
  events?: Array<{
    id: string;
    title: string;
    closesAt: Date | string;
    resolved: boolean;
    resolvedAt?: Date | string | null;
  }>;
  userPredictions?: Array<{
    eventId: string;
    createdAt: Date | string;
  }>;
  currentRank?: number;
  previousRank?: number;
  streakCount?: number;
  hasPredictedToday?: boolean;
}

/**
 * Genera notifiche EVENT_CLOSING_SOON
 * Notifica se evento chiude entro 1h e utente non ha ancora votato
 */
export function generateClosingSoonNotifications(
  context: NotificationGenerationContext
): Array<{ type: NotificationType; data: NotificationData['EVENT_CLOSING_SOON'] }> {
  if (!context.events || !context.userPredictions) return [];

  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  const notifications: Array<{ type: NotificationType; data: NotificationData['EVENT_CLOSING_SOON'] }> = [];

  for (const event of context.events) {
    // Solo eventi aperti
    if (event.resolved) continue;

    const closesAt = typeof event.closesAt === 'string' ? new Date(event.closesAt) : event.closesAt;
    
    // Chiude entro 1 ora
    if (closesAt > now && closesAt <= oneHourFromNow) {
      // Verifica se utente ha già votato
      const hasVoted = context.userPredictions.some(
        p => p.eventId === event.id
      );

      if (!hasVoted) {
        notifications.push({
          type: NotificationType.EVENT_CLOSING_SOON,
          data: {
            eventId: event.id,
            eventTitle: event.title,
            closesAt: closesAt.toISOString(),
          },
        });
      }
    }
  }

  return notifications;
}

/**
 * Genera notifiche EVENT_RESOLVED
 * Notifica quando evento viene risolto
 */
export function generateResolvedNotifications(
  context: NotificationGenerationContext
): Array<{ type: NotificationType; data: NotificationData['EVENT_RESOLVED'] }> {
  if (!context.events || !context.userPredictions) return [];

  const notifications: Array<{ type: NotificationType; data: NotificationData['EVENT_RESOLVED'] }> = [];

  for (const event of context.events) {
    // Solo eventi risolti di recente (ultime 24h)
    if (!event.resolved || !event.resolvedAt) continue;

    const resolvedAt = typeof event.resolvedAt === 'string' 
      ? new Date(event.resolvedAt) 
      : event.resolvedAt;
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    if (resolvedAt < oneDayAgo) continue; // Troppo vecchio

    // Verifica se utente ha votato su questo evento
    const hasVoted = context.userPredictions.some(
      p => p.eventId === event.id
    );

    if (hasVoted) {
      // Determina outcome (semplificato - in produzione verrebbe dal DB)
      notifications.push({
        type: NotificationType.EVENT_RESOLVED,
        data: {
          eventId: event.id,
          eventTitle: event.title,
          outcome: 'yes', // TODO: ottenere da DB
        },
      });
    }
  }

  return notifications;
}

/**
 * Genera notifiche RANK_UP
 * Notifica quando utente sale in classifica
 */
export function generateRankUpNotifications(
  context: NotificationGenerationContext
): Array<{ type: NotificationType; data: NotificationData['RANK_UP'] }> {
  if (
    context.currentRank === undefined ||
    context.previousRank === undefined ||
    context.currentRank >= context.previousRank
  ) {
    return [];
  }

  // Solo se sale di almeno 1 posizione
  if (context.previousRank - context.currentRank > 0) {
    return [{
      type: NotificationType.RANK_UP,
      data: {
        oldRank: context.previousRank,
        newRank: context.currentRank,
        period: 'weekly', // TODO: parametrizzare
      },
    }];
  }

  return [];
}

/**
 * Genera notifiche STREAK_RISK
 * Notifica se utente non ha predetto oggi e siamo in serata
 */
export function generateStreakRiskNotifications(
  context: NotificationGenerationContext
): Array<{ type: NotificationType; data: NotificationData['STREAK_RISK'] }> {
  if (context.hasPredictedToday || !context.streakCount || context.streakCount === 0) {
    return [];
  }

  const now = new Date();
  const hours = now.getHours();
  
  // Solo dopo le 18:00
  if (hours < 18) return [];

  // Calcola ore fino a mezzanotte
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const hoursUntilMidnight = Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));

  return [{
    type: NotificationType.STREAK_RISK,
    data: {
      currentStreak: context.streakCount,
      hoursUntilMidnight,
    },
  }];
}

/**
 * Genera tutte le notifiche per un utente
 */
export async function generateNotificationsForUser(
  context: NotificationGenerationContext
): Promise<Array<{ type: NotificationType; data: any }>> {
  const allNotifications: Array<{ type: NotificationType; data: any }> = [];

  // Genera tutte le notifiche
  allNotifications.push(...generateClosingSoonNotifications(context));
  allNotifications.push(...generateResolvedNotifications(context));
  allNotifications.push(...generateRankUpNotifications(context));
  allNotifications.push(...generateStreakRiskNotifications(context));

  return allNotifications;
}
