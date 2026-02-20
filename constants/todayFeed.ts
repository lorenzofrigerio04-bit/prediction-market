/**
 * Constants and copy for Today Feed
 * 
 * TODO: Move copy strings here for easy localization and updates
 */

export const TODAY_FEED_CONSTANTS = {
  MAX_CLOSING_SOON_CARDS: 3,
  MAX_TRENDING_CARDS: 3,
  CLOSING_SOON_HOURS: 6,
  XP_REWARD_FOR_TODAY_PREDICTION: 50,
} as const;

export const TODAY_FEED_COPY = {
  CLOSING_SOON_TITLE: 'Scadono entro 6 ore',
  TRENDING_TITLE: '🔥 Trend adesso',
  STREAK_TITLE: 'La tua streak',
  STREAK_CTA: 'Continua',
  REWARD_TITLE: 'Prossima ricompensa',
  FOMO_BANNER_PREFIX: '⏳',
  FOMO_BANNER_SUFFIX: 'eventi chiudono oggi · +{xp} XP se predici prima delle 23:59',
} as const;
