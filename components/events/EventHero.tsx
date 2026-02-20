'use client';

import { useState, useEffect } from 'react';
import { formatTimeRemaining } from '@/utils/time';

export interface EventHeroProps {
  event: {
    id: string;
    title: string;
    description: string;
    closesAt: string;
    category: string;
    velocity: number;
    participants: number;
    yesPct: number;
    noPct: number;
    pointsMultiplier: number;
    isClosed?: boolean;
  };
}

export function EventHero({ event }: EventHeroProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [totalTimeMs, setTotalTimeMs] = useState<number>(0);

  useEffect(() => {
    if (event.isClosed) {
      setTimeRemaining('Chiuso');
      setProgress(100);
      return;
    }

    const closesAt = new Date(event.closesAt);
    
    // Calcola il tempo totale dall'inizio (assumiamo che l'evento sia iniziato 7 giorni fa)
    // In produzione questo dovrebbe venire da event.createdAt
    const createdAt = new Date(closesAt.getTime() - 7 * 24 * 60 * 60 * 1000);
    const totalDuration = closesAt.getTime() - createdAt.getTime();
    setTotalTimeMs(totalDuration);

    const updateCountdown = () => {
      const now = new Date();
      const remaining = closesAt.getTime() - now.getTime();

      if (remaining <= 0) {
        setTimeRemaining('Chiuso');
        setProgress(100);
        return;
      }

      setTimeRemaining(formatTimeRemaining(remaining));
      
      // Calcola progress: quanto tempo è passato dall'inizio
      const elapsed = totalDuration - remaining;
      const progressPct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      setProgress(progressPct);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [event.closesAt, event.isClosed]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="event-hero">
      <div className="event-hero-header">
        <span className="event-category">{event.category}</span>
        <div className="event-stats">
          <span className="stat-item" aria-label={`Velocità: ${event.velocity} previsioni all'ora`}>
            🔥 {event.velocity}/h
          </span>
          <span className="stat-item" aria-label={`${event.participants} partecipanti`}>
            👥 {event.participants}
          </span>
          <span className="stat-item" aria-label={`Moltiplicatore punti: ${event.pointsMultiplier}x`}>
            ⚡ {event.pointsMultiplier}x
          </span>
        </div>
      </div>

      <h1 className="event-title">{event.title}</h1>
      <p className="event-description">{event.description}</p>

      <div className="countdown-section">
        <div className="countdown-display">
          <span className="countdown-label">Tempo rimanente</span>
          <span className="countdown-time" aria-live="polite">
            {timeRemaining}
          </span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso tempo: ${Math.round(progress)}%`}
          />
        </div>
        <span className="closes-at">Chiude: {formatDate(event.closesAt)}</span>
      </div>

      <style jsx>{`
        .event-hero {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .event-hero-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .event-category {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .event-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat-item {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text);
          background: var(--color-bg-secondary);
          padding: 0.375rem 0.75rem;
          border-radius: 999px;
        }

        .event-title {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.3;
          color: var(--color-text);
          margin: 0 0 1rem 0;
        }

        .event-description {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--color-text-light);
          margin: 0 0 2rem 0;
        }

        .countdown-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .countdown-display {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .countdown-label {
          font-size: 0.875rem;
          color: var(--color-text-light);
          font-weight: 500;
        }

        .countdown-time {
          font-size: 3rem;
          font-weight: 700;
          color: var(--color-danger);
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: var(--color-bg-secondary);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-danger));
          border-radius: 999px;
          transition: width 1s linear;
        }

        .closes-at {
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        @media (max-width: 768px) {
          .event-hero {
            padding: 1.5rem;
          }

          .event-title {
            font-size: 1.5rem;
          }

          .countdown-time {
            font-size: 2.5rem;
          }

          .event-hero-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
