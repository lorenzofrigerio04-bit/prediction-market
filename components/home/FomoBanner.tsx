'use client';

import Link from 'next/link';
import { useTodayFeed } from '@/hooks/useTodayFeed';
import { TODAY_FEED_CONSTANTS, TODAY_FEED_COPY } from '@/constants/todayFeed';

export function FomoBanner() {
  const { data, isLoading } = useTodayFeed();
  
  const closingTodayCount = data?.closingSoon?.totalCount || 0;
  const xpReward = TODAY_FEED_CONSTANTS.XP_REWARD_FOR_TODAY_PREDICTION;

  if (isLoading) {
    return (
      <div className="fomo-banner skeleton">
        <div className="fomo-banner-content">
          <span>⏳</span>
          <span className="skeleton-text">Caricamento...</span>
        </div>
      </div>
    );
  }

  if (closingTodayCount === 0) {
    return null;
  }

  return (
    <Link href="/eventi?filter=24h" className="fomo-banner">
      <div className="fomo-banner-content">
        <span>{TODAY_FEED_COPY.FOMO_BANNER_PREFIX}</span>
        <span>
          {closingTodayCount} {TODAY_FEED_COPY.FOMO_BANNER_SUFFIX.replace('{xp}', xpReward.toString())}
        </span>
      </div>
      <style jsx>{`
        .fomo-banner {
          display: block;
          background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
          color: white;
          text-decoration: none;
          position: sticky;
          top: 57px; /* navbar height */
          z-index: 40;
          transition: opacity 0.2s;
        }
        .fomo-banner:hover {
          opacity: 0.9;
        }
        .fomo-banner-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .fomo-banner.skeleton {
          background: var(--color-bg-secondary);
          cursor: default;
        }
        .skeleton-text {
          color: var(--color-text-light);
        }
      `}</style>
    </Link>
  );
}
