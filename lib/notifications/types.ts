/**
 * Tipi di notifiche supportate
 */
export enum NotificationType {
  EVENT_CLOSING_SOON = 'EVENT_CLOSING_SOON',
  EVENT_RESOLVED = 'EVENT_RESOLVED',
  RANK_UP = 'RANK_UP',
  STREAK_RISK = 'STREAK_RISK',
}

/**
 * Struttura dati per ogni tipo di notifica
 */
export interface NotificationData {
  EVENT_CLOSING_SOON: {
    eventId: string;
    eventTitle: string;
    closesAt: string; // ISO date string
  };
  EVENT_RESOLVED: {
    eventId: string;
    eventTitle: string;
    outcome: 'yes' | 'no';
  };
  RANK_UP: {
    oldRank: number;
    newRank: number;
    period: 'weekly' | 'monthly' | 'all-time';
  };
  STREAK_RISK: {
    currentStreak: number;
    hoursUntilMidnight: number;
  };
}

/**
 * Notifica generica
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  data: NotificationData[NotificationType];
  readAt: string | null;
  createdAt: string;
}

/**
 * Response API per lista notifiche
 */
export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
