'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ActivityToast {
  id: string;
  nickname: string;
  vote: 'yes' | 'no';
  timestamp: number;
}

export interface ActivityToastsProps {
  activities?: ActivityToast[];
  maxToasts?: number;
  rateLimitMs?: number;
}

export function ActivityToasts({
  activities = [],
  maxToasts = 3,
  rateLimitMs = 2000,
}: ActivityToastsProps) {
  const [toasts, setToasts] = useState<ActivityToast[]>([]);
  const [lastToastTime, setLastToastTime] = useState<number>(0);

  const addToast = useCallback(
    (activity: ActivityToast) => {
      const now = Date.now();
      
      // Rate limiting: non aggiungere toast se è passato troppo poco tempo
      if (now - lastToastTime < rateLimitMs) {
        return;
      }

      setLastToastTime(now);
      setToasts((prev) => {
        const newToasts = [activity, ...prev].slice(0, maxToasts);
        return newToasts;
      });

      // Rimuovi toast dopo 5 secondi
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== activity.id));
      }, 5000);
    },
    [lastToastTime, rateLimitMs, maxToasts]
  );

  useEffect(() => {
    // Simula attività mock se non ci sono attività reali
    if (activities.length === 0) {
      const mockActivities: ActivityToast[] = [
        { id: '1', nickname: 'CryptoMaster', vote: 'yes', timestamp: Date.now() - 1000 },
        { id: '2', nickname: 'TechGuru', vote: 'no', timestamp: Date.now() - 2000 },
        { id: '3', nickname: 'PredictionPro', vote: 'yes', timestamp: Date.now() - 3000 },
      ];

      const timeouts: NodeJS.Timeout[] = [];

      // Aggiungi toast con delay per simulare attività reale
      mockActivities.forEach((activity, index) => {
        const timeout = setTimeout(() => {
          addToast(activity);
        }, index * rateLimitMs);
        timeouts.push(timeout);
      });

      // Continua ad aggiungere toast mock ogni 5 secondi
      const interval = setInterval(() => {
        const mockNicknames = ['User1', 'User2', 'User3', 'TraderX', 'AnalystY'];
        const randomNickname = mockNicknames[Math.floor(Math.random() * mockNicknames.length)];
        const randomVote: 'yes' | 'no' = Math.random() > 0.5 ? 'yes' : 'no';
        
        addToast({
          id: `mock-${Date.now()}`,
          nickname: randomNickname,
          vote: randomVote,
          timestamp: Date.now(),
        });
      }, 5000);

      return () => {
        clearInterval(interval);
        timeouts.forEach((timeout) => clearTimeout(timeout));
      };
    } else {
      // Usa attività reali
      activities.forEach((activity) => {
        addToast(activity);
      });
    }
  }, [activities, addToast, rateLimitMs]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="activity-toasts">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.vote}`}
          role="status"
          aria-live="polite"
        >
          <span className="toast-content">
            <strong>{toast.nickname}</strong> ha appena votato{' '}
            <strong>{toast.vote === 'yes' ? 'SÌ' : 'NO'}</strong>
          </span>
        </div>
      ))}

      <style jsx>{`
        .activity-toasts {
          position: fixed;
          top: 80px;
          right: 1rem;
          z-index: 200;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 320px;
        }

        .toast {
          padding: 0.875rem 1rem;
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
          animation: slideIn 0.3s ease-out;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
        }

        .toast-yes {
          border-left: 4px solid var(--color-success);
        }

        .toast-no {
          border-left: 4px solid var(--color-danger);
        }

        .toast-content {
          font-size: 0.875rem;
          color: var(--color-text);
          line-height: 1.5;
        }

        .toast-content strong {
          font-weight: 600;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .activity-toasts {
            right: 0.5rem;
            left: 0.5rem;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}
