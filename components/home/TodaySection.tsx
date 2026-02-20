'use client';

import { ClosingSoonSection } from './ClosingSoonSection';
import { TrendingNowSection } from './TrendingNowSection';
import { StreakSection } from './StreakSection';
import { useTodayFeed } from '@/hooks/useTodayFeed';

export function TodaySection() {
  const { data, isLoading } = useTodayFeed();

  return (
    <div className="today-section">
      <div className="today-grid">
        <ClosingSoonSection
          events={data?.closingSoon?.events || []}
          isLoading={isLoading}
        />
        <TrendingNowSection
          events={data?.trendingNow?.events || []}
          isLoading={isLoading}
        />
        <StreakSection
          streakCount={data?.streakStatus?.streakCount || 0}
          hasPredictedToday={data?.streakStatus?.hasPredictedToday || false}
          isLoading={isLoading}
        />
      </div>
      <style jsx>{`
        .today-section {
          margin-top: 2rem;
        }
        .today-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .today-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .today-grid {
            gap: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
