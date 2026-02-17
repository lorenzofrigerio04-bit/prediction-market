'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useNotifications, useMarkAsRead } from '@/hooks/useNotifications';
import type { Notification } from '@/lib/notifications/types';
import { NotificationType } from '@/lib/notifications/types';

interface NotificationDropdownProps {
  onClose?: () => void;
}

function formatNotificationMessage(notification: Notification): string {
  switch (notification.type) {
    case NotificationType.EVENT_CLOSING_SOON:
      return `"${(typeof notification.data === "string" ? JSON.parse(notification.data) : notification.data || {}).eventTitle}" chiude tra poco!`;
    case NotificationType.EVENT_RESOLVED:
      return `"${(typeof notification.data === "string" ? JSON.parse(notification.data) : notification.data || {}).eventTitle}" è stato risolto: ${(typeof notification.data === "string" ? JSON.parse(notification.data) : notification.data || {}).outcome === 'yes' ? 'Sì' : 'No'}`;
    case NotificationType.RANK_UP:
      return `Sei salito dalla posizione ${(typeof notification.data === "string" ? JSON.parse(notification.data) : notification.data || {}).oldRank} alla ${(typeof notification.data === "string" ? JSON.parse(notification.data) : notification.data || {}).newRank}! 🎉`;
    case NotificationType.STREAK_RISK:
      return `Attenzione! La tua streak di ${(typeof notification.data === "string" ? JSON.parse(notification.data) : notification.data || {}).currentStreak} giorni rischia di finire. Fai una previsione entro ${(typeof notification.data === "string" ? JSON.parse(notification.data) : notification.data || {}).hoursUntilMidnight} ore!`;
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
  if (diffMins < 60) return `${diffMins}m fa`;
  if (diffHours < 24) return `${diffHours}h fa`;
  if (diffDays < 7) return `${diffDays}g fa`;
  return date.toLocaleDateString('it-IT');
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, isLoading } = useNotifications(1, 5); // Ultime 5
  const { markAsRead } = useMarkAsRead();
  const [isOpen, setIsOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await markAsRead([notification.id]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="notification-dropdown"
      role="menu"
      aria-label="Notifiche"
    >
      <div className="notification-dropdown-header">
        <h3>Notifiche</h3>
        <Link
          href="/notifiche"
          className="notification-dropdown-view-all"
          onClick={() => {
            setIsOpen(false);
            onClose?.();
          }}
        >
          Vedi tutte
        </Link>
      </div>

      <div className="notification-dropdown-list">
        {isLoading ? (
          <div className="notification-dropdown-loading">
            <p>Caricamento...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-dropdown-empty">
            <p>Nessuna notifica</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Link
              key={notification.id}
              href={
                notification.type === NotificationType.EVENT_CLOSING_SOON ||
                notification.type === NotificationType.EVENT_RESOLVED
                  ? `/eventi/${(typeof notification.data === "string" ? JSON.parse(notification.data) : notification.data || {})?.eventId || ""}`
                  : '/notifiche'
              }
              className={`notification-dropdown-item ${notification.readAt ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-dropdown-item-content">
                <p className="notification-dropdown-item-message">
                  {formatNotificationMessage(notification)}
                </p>
                <span className="notification-dropdown-item-time">
                  {formatNotificationTime(notification.createdAt)}
                </span>
              </div>
              {!notification.readAt && (
                <span className="notification-dropdown-item-dot" aria-label="Non letta" />
              )}
            </Link>
          ))
        )}
      </div>

      <style jsx>{`
        .notification-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 360px;
          max-width: calc(100vw - 2rem);
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          max-height: 500px;
          display: flex;
          flex-direction: column;
        }

        .notification-dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--color-border);
        }

        .notification-dropdown-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .notification-dropdown-view-all {
          font-size: 0.875rem;
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;
        }

        .notification-dropdown-view-all:hover {
          text-decoration: underline;
        }

        .notification-dropdown-list {
          overflow-y: auto;
          max-height: 400px;
        }

        .notification-dropdown-loading,
        .notification-dropdown-empty {
          padding: 2rem 1rem;
          text-align: center;
          color: var(--color-text-light);
          font-size: 0.875rem;
        }

        .notification-dropdown-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          border-bottom: 1px solid var(--color-border-light);
          text-decoration: none;
          color: var(--color-text);
          transition: background-color 0.2s;
        }

        .notification-dropdown-item:hover {
          background-color: var(--color-bg-secondary);
        }

        .notification-dropdown-item.unread {
          background-color: var(--color-primary) / 0.05;
        }

        .notification-dropdown-item-content {
          flex: 1;
          min-width: 0;
        }

        .notification-dropdown-item-message {
          margin: 0 0 0.25rem 0;
          font-size: 0.875rem;
          line-height: 1.4;
          color: var(--color-text);
        }

        .notification-dropdown-item-time {
          font-size: 0.75rem;
          color: var(--color-text-light);
        }

        .notification-dropdown-item-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--color-primary);
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        @media (max-width: 768px) {
          .notification-dropdown {
            width: calc(100vw - 1rem);
            right: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
