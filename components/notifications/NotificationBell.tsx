'use client';

import { useState } from 'react';
import { useUnreadCount } from '@/hooks/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { count } = useUnreadCount();

  return (
    <div className="notification-bell-container" style={{ position: 'relative' }}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifiche${count > 0 ? ` (${count} non lette)` : ''}`}
        aria-expanded={isOpen}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="notification-bell-badge" aria-label={`${count} notifiche non lette`}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}

      <style jsx>{`
        .notification-bell-container {
          position: relative;
        }

        .notification-bell-button {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          color: var(--color-text);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .notification-bell-button:hover {
          color: var(--color-primary);
        }

        .notification-bell-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--color-danger);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
}
