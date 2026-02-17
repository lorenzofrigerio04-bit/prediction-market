"use client";

import { useState } from "react";
import Link from "next/link";

import { getNotificationTitle, getNotificationMessage, getNotificationLink } from '@/lib/notification-templates';

interface Notification {
  id: string;
  type: string;
  data: any;
  readAt: string | null;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "EVENT_RESOLVED":
      return "✅";
    case "MISSION_COMPLETED":
      return "🎯";
    case "STREAK_AT_RISK":
      return "🔥";
    case "COMMENT_REPLY":
      return "💬";
    case "BADGE_AWARDED":
      return "🏆";
    default:
      return "🔔";
  }
};

const getLink = (notification: Notification): string | null => {
  return getNotificationLink(notification.type, notification.data);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Adesso";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minuto" : "minuti"} fa`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "ora" : "ore"} fa`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "giorno" : "giorni"} fa`;

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

export default function NotificationDropdown({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh,
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.readAt) {
      onMarkAsRead(notification.id);
    }
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const link = getLink(notification);
    const icon = getNotificationIcon(notification.type);
    const content = (
      <div
        className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
          !notification.readAt ? "bg-blue-50" : ""
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4
                className={`text-sm font-medium ${
                  !notification.readAt ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {getNotificationTitle(notification.type, notification.data)}
              </h4>
              {!notification.readAt && (
                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {getNotificationMessage(notification.type, notification.data)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(notification.createdAt)}
            </p>
          </div>
        </div>
      </div>
    );

    if (link) {
      return (
        <Link href={link} className="block border-b border-gray-100 last:border-0">
          {content}
        </Link>
      );
    }

    return <div className="border-b border-gray-100 last:border-0">{content}</div>;
  };

  return (
    <div className="absolute right-0 mt-2 w-96 glass rounded-2xl border border-border dark:border-white/10 shadow-xl z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifiche</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Segna tutte come lette
            </button>
          )}
          <button
            onClick={onRefresh}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Aggiorna"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Caricamento...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Nessuna notifica</p>
            <p className="text-sm text-gray-400 mt-1">
              Riceverai notifiche per eventi risolti, commenti e badge
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <Link
            href="/notifications"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Vedi tutte le notifiche
          </Link>
        </div>
      )}
    </div>
  );
}
