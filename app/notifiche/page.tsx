'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNotifications, useMarkAsRead } from '@/hooks/useNotifications';
import { NotificationType } from '@/lib/notifications/types';
import type { Notification } from '@/lib/notifications/types';

function formatNotificationMessage(notification: Notification): string {
  switch (notification.type) {
    case NotificationType.EVENT_CLOSING_SOON:
      return `"${notification.data.eventTitle}" chiude tra poco!`;
    case NotificationType.EVENT_RESOLVED:
      return `"${notification.data.eventTitle}" è stato risolto: ${notification.data.outcome === 'yes' ? 'Sì' : 'No'}`;
    case NotificationType.RANK_UP:
      return `Sei salito dalla posizione ${notification.data.oldRank} alla ${notification.data.newRank}! 🎉`;
    case NotificationType.STREAK_RISK:
      return `Attenzione! La tua streak di ${notification.data.currentStreak} giorni rischia di finire. Fai una previsione entro ${notification.data.hoursUntilMidnight} ore!`;
    default:
      return 'Nuova notifica';
  }
}

function formatNotificationTime(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Adesso';
  if (diffMins < 60) return `${diffMins} minuti fa`;
  if (diffHours < 24) return `${diffHours} ore fa`;
  if (diffDays < 7) return `${diffDays} giorni fa`;
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function NotifichePage() {
  const [page, setPage] = useState(1);
  const { notifications, pagination, isLoading, refetch } = useNotifications(page, 20);
  const { markAsRead, isMarking } = useMarkAsRead();

  const handleMarkAllAsRead = async () => {
    const success = await markAsRead();
    if (success) {
      refetch();
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await markAsRead([notification.id]);
      refetch();
    }
  };

  return (
    <div className="notifiche-page">
      <div className="container">
        <div className="notifiche-header">
          <h1>Notifiche</h1>
          {notifications.some(n => !n.readAt) && (
            <button
              className="notifiche-mark-all-read"
              onClick={handleMarkAllAsRead}
              disabled={isMarking}
            >
              {isMarking ? 'Caricamento...' : 'Segna tutte come lette'}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="notifiche-loading">
            <p>Caricamento notifiche...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifiche-empty">
            <p>Nessuna notifica</p>
            <Link href="/" className="notifiche-empty-link">
              Torna alla home
            </Link>
          </div>
        ) : (
          <>
            <div className="notifiche-list">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={
                    notification.type === NotificationType.EVENT_CLOSING_SOON ||
                    notification.type === NotificationType.EVENT_RESOLVED
                      ? `/eventi/${notification.data.eventId}`
                      : '#'
                  }
                  className={`notifiche-item ${notification.readAt ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notifiche-item-content">
                    <p className="notifiche-item-message">
                      {formatNotificationMessage(notification)}
                    </p>
                    <span className="notifiche-item-time">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.readAt && (
                    <span className="notifiche-item-dot" aria-label="Non letta" />
                  )}
                </Link>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="notifiche-pagination">
                <button
                  className="notifiche-pagination-button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Precedente
                </button>
                <span className="notifiche-pagination-info">
                  Pagina {pagination.page} di {pagination.totalPages}
                </span>
                <button
                  className="notifiche-pagination-button"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Successiva
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .notifiche-page {
          min-height: 100vh;
          padding-top: 2rem;
          padding-bottom: 3rem;
        }

        .notifiche-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .notifiche-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .notifiche-mark-all-read {
          padding: 0.5rem 1rem;
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .notifiche-mark-all-read:hover:not(:disabled) {
          background-color: var(--color-primary-dark);
        }

        .notifiche-mark-all-read:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .notifiche-loading,
        .notifiche-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-text-light);
        }

        .notifiche-empty-link {
          display: inline-block;
          margin-top: 1rem;
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;
        }

        .notifiche-empty-link:hover {
          text-decoration: underline;
        }

        .notifiche-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .notifiche-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background-color: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          text-decoration: none;
          color: var(--color-text);
          transition: all 0.2s;
        }

        .notifiche-item:hover {
          background-color: var(--color-bg-secondary);
          border-color: var(--color-primary);
        }

        .notifiche-item.unread {
          background-color: rgba(var(--color-primary-rgb, 59, 130, 246), 0.05);
          border-color: var(--color-primary);
        }

        .notifiche-item-content {
          flex: 1;
          min-width: 0;
        }

        .notifiche-item-message {
          margin: 0 0 0.5rem 0;
          font-size: 0.9375rem;
          line-height: 1.5;
          color: var(--color-text);
        }

        .notifiche-item-time {
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        .notifiche-item-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--color-primary);
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .notifiche-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border);
        }

        .notifiche-pagination-button {
          padding: 0.5rem 1rem;
          background-color: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          color: var(--color-text);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .notifiche-pagination-button:hover:not(:disabled) {
          background-color: var(--color-bg-secondary);
          border-color: var(--color-primary);
        }

        .notifiche-pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .notifiche-pagination-info {
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        @media (max-width: 768px) {
          .notifiche-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .notifiche-mark-all-read {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
