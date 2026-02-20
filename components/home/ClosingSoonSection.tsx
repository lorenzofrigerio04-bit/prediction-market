'use client';

import { EventCardCompact } from './EventCardCompact';
import { SectionSkeleton } from './SectionSkeleton';
import { TODAY_FEED_CONSTANTS, TODAY_FEED_COPY } from '@/constants/todayFeed';

interface ClosingSoonSectionProps {
  events: Array<{
    id: string;
    title: string;
    closesAt: string;
    category: string;
  }>;
  isLoading: boolean;
}

export function ClosingSoonSection({ events, isLoading }: ClosingSoonSectionProps) {
  if (isLoading) {
    return (
      <SectionSkeleton
        title={TODAY_FEED_COPY.CLOSING_SOON_TITLE}
        maxCards={TODAY_FEED_CONSTANTS.MAX_CLOSING_SOON_CARDS}
      />
    );
  }

  const displayEvents = events.slice(0, TODAY_FEED_CONSTANTS.MAX_CLOSING_SOON_CARDS);

  return (
    <div className="section">
      <h2 className="section-title">{TODAY_FEED_COPY.CLOSING_SOON_TITLE}</h2>
      {displayEvents.length === 0 ? (
        <div className="empty-state">
          Nessun evento in scadenza
        </div>
      ) : (
        <div className="section-cards">
          {displayEvents.map((event) => (
            <EventCardCompact
              key={event.id}
              event={event}
              showCountdown
            />
          ))}
        </div>
      )}
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
        .section-cards {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .empty-state {
          color: var(--color-text-light);
          font-size: 0.875rem;
          padding: 1rem 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
