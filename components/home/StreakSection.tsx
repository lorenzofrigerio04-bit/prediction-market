'use client';

import Link from 'next/link';
import { StreakSkeleton } from './StreakSkeleton';
import { TODAY_FEED_COPY } from '@/constants/todayFeed';

interface StreakSectionProps {
  streakCount: number;
  hasPredictedToday: boolean;
  isLoading: boolean;
}

export function StreakSection({
  streakCount,
  hasPredictedToday,
  isLoading,
}: StreakSectionProps) {
  if (isLoading) {
    return <StreakSkeleton />;
  }

  return (
    <div className="section streak-section">
      <h2 className="section-title">{TODAY_FEED_COPY.STREAK_TITLE}</h2>
      <div className="streak-content">
        <div className="streak-count">
          <span className="streak-number">{streakCount}</span>
          <span className="streak-label">giorni</span>
        </div>
        {!hasPredictedToday && (
          <Link href="/eventi" className="streak-cta">
            {TODAY_FEED_COPY.STREAK_CTA}
          </Link>
        )}
      </div>
      <style jsx>{`
        .section {
          background: var(--color-bg);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        .section-title {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--color-text);
        }
        .streak-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .streak-count {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        .streak-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--color-primary);
          line-height: 1;
        }
        .streak-label {
          font-size: 0.875rem;
          color: var(--color-text-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .streak-cta {
          display: inline-block;
          background: var(--color-primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          text-decoration: none;
          font-weight: 600;
          transition: background 0.2s;
        }
        .streak-cta:hover {
          background: var(--color-primary-dark);
        }
      `}</style>
    </div>
  );
}
