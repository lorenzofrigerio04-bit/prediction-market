'use client';

import { useState, useEffect } from 'react';
import { formatTimeRemaining } from '@/utils/time';

export interface EventCardEngagementProps {
  event: {
    id: string;
    title: string;
    description: string;
    closesAt: string;
    category: string;
    velocity: number; // previsioni/ora
    participants: number;
    yesPct: number; // percentuale SÌ
    noPct: number; // percentuale NO
    pointsMultiplier: number;
    isClosed?: boolean;
  };
  isAuthenticated: boolean;
  onVote: (eventId: string, vote: 'yes' | 'no') => void;
  onAuthRequired: () => void;
}

export function EventCardEngagement({
  event,
  isAuthenticated,
  onVote,
  onAuthRequired,
}: EventCardEngagementProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (event.isClosed) {
      setTimeRemaining('Chiuso');
      return;
    }

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
  }, [event.closesAt, event.isClosed]);

  const handleVote = async (vote: 'yes' | 'no') => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    setIsVoting(true);
    try {
      await onVote(event.id, vote);
    } finally {
      setIsVoting(false);
    }
  };

  const points = Math.round(100 * event.pointsMultiplier); // Base 100 crediti

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <article className="event-card-engagement" aria-labelledby={`event-title-${event.id}`}>
      {/* Header: countdown + velocity + participants */}
      <div className="event-header">
        <div className="event-header-left">
          <span className="event-countdown" aria-live="polite">
            {timeRemaining}
          </span>
          <span className="event-velocity-pill" aria-label={`Velocità: ${event.velocity} previsioni all'ora`}>
            🔥 {event.velocity}/h
          </span>
        </div>
        <span className="event-participants" aria-label={`${event.participants} partecipanti`}>
          👥 {event.participants}
        </span>
      </div>

      {/* Centro: titolo + descrizione */}
      <div className="event-content">
        <h3 id={`event-title-${event.id}`} className="event-title">
          {event.title}
        </h3>
        <p className="event-description">{event.description}</p>
      </div>

      {/* Barra community */}
      <div className="event-community-bar" role="status" aria-label="Risultati community">
        <span className="community-label">Community dice:</span>
        <div className="community-results">
          <span className="community-yes" aria-label={`${event.yesPct}% voti SÌ`}>
            SÌ <strong>{event.yesPct}%</strong>
          </span>
          <span className="community-separator" aria-hidden="true">·</span>
          <span className="community-no" aria-label={`${event.noPct}% voti NO`}>
            NO <strong>{event.noPct}%</strong>
          </span>
        </div>
      </div>

      {/* CTA inline: bottoni SÌ/NO */}
      {!event.isClosed && (
        <div className="event-vote-actions" role="group" aria-label="Vota su questo evento">
          <button
            type="button"
            className="vote-button vote-yes"
            onClick={() => handleVote('yes')}
            disabled={isVoting}
            aria-label={`Vota SÌ su: ${event.title}`}
          >
            SÌ
          </button>
          <button
            type="button"
            className="vote-button vote-no"
            onClick={() => handleVote('no')}
            disabled={isVoting}
            aria-label={`Vota NO su: ${event.title}`}
          >
            NO
          </button>
        </div>
      )}

      {/* Footer: punti possibili + data chiusura */}
      <div className="event-footer">
        <span className="event-points" aria-label={`Punti possibili: ${points}`}>
          Punti possibili: +{points}
        </span>
        <span className="event-closes-at" aria-label={`Chiude il ${formatDate(event.closesAt)}`}>
          Chiude: {formatDate(event.closesAt)}
        </span>
      </div>

      <style jsx>{`
        .event-card-engagement {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.2s;
        }

        .event-card-engagement:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-md);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .event-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .event-countdown {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-danger);
        }

        .event-velocity-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--color-bg-secondary);
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .event-participants {
          font-size: 0.875rem;
          color: var(--color-text-light);
          white-space: nowrap;
        }

        .event-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .event-title {
          font-size: 1.125rem;
          font-weight: 700;
          line-height: 1.4;
          color: var(--color-text);
          margin: 0;
        }

        .event-description {
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--color-text-light);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .event-community-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          background: var(--color-bg-secondary);
          border-radius: var(--radius);
          flex-wrap: wrap;
        }

        .community-label {
          font-size: 0.875rem;
          color: var(--color-text-light);
          font-weight: 500;
        }

        .community-results {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .community-yes,
        .community-no {
          color: var(--color-text);
        }

        .community-yes strong,
        .community-no strong {
          font-size: 1.25rem;
          font-weight: 700;
          margin-left: 0.25rem;
        }

        .community-yes strong {
          color: var(--color-success);
        }

        .community-no strong {
          color: var(--color-danger);
        }

        .community-separator {
          color: var(--color-text-light);
        }

        .event-vote-actions {
          display: flex;
          gap: 0.75rem;
        }

        .vote-button {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: var(--radius);
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .vote-button:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        .vote-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .vote-yes {
          background: var(--color-success);
          color: white;
        }

        .vote-yes:hover:not(:disabled) {
          background: #059669;
        }

        .vote-no {
          background: var(--color-danger);
          color: white;
        }

        .vote-no:hover:not(:disabled) {
          background: #dc2626;
        }

        .event-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--color-border-light);
          font-size: 0.875rem;
          flex-wrap: wrap;
        }

        .event-points {
          color: var(--color-primary);
          font-weight: 600;
        }

        .event-closes-at {
          color: var(--color-text-light);
        }

        @media (max-width: 768px) {
          .event-card-engagement {
            padding: 1rem;
          }

          .event-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .event-community-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          .community-results {
            width: 100%;
            justify-content: space-between;
          }

          .event-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </article>
  );
}
