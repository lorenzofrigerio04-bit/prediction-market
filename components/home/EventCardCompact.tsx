'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatTimeRemaining } from '@/utils/time';

interface EventCardCompactProps {
  event: {
    id: string;
    title: string;
    closesAt: string;
    category: string;
    volume?: number;
  };
  showCountdown: boolean;
}

export function EventCardCompact({ event, showCountdown }: EventCardCompactProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!showCountdown) return;

    const updateCountdown = () => {
      const closesAt = new Date(event.closesAt);
      const now = new Date();
      const diff = closesAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Chiuso');
        return;
      }

      setTimeRemaining(formatTimeRemaining(diff));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [event.closesAt, showCountdown]);

  return (
    <Link href={`/eventi/${event.id}`} className="event-card-compact">
      <div className="event-header">
        <span className="event-category">{event.category}</span>
        {showCountdown && timeRemaining && (
          <span className="event-countdown">{timeRemaining}</span>
        )}
      </div>
      <h3 className="event-title">{event.title}</h3>
      {event.volume !== undefined && (
        <div className="event-volume">
          Volume: {event.volume.toLocaleString()} crediti
        </div>
      )}
      <style jsx>{`
        .event-card-compact {
          display: block;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius);
          padding: 1rem;
          text-decoration: none;
          color: var(--color-text);
          transition: all 0.2s;
        }
        .event-card-compact:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-sm);
        }
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .event-category {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .event-countdown {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-danger);
        }
        .event-title {
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }
        .event-volume {
          font-size: 0.75rem;
          color: var(--color-text-light);
        }
      `}</style>
    </Link>
  );
}
