"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

interface Notification {
  id: string;
  type: string;
  data: any;
  readAt: string | null;
  createdAt: string;
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

import { getNotificationTitle, getNotificationMessage, getNotificationLink as getLinkFromData } from '@/lib/notification-templates';

const getNotificationLink = (notification: Notification): string | null => {
  return getLinkFromData(notification.type, notification.data);
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
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session, status, router]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=100");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "read-all" }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
        );
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-fg-muted font-medium">Caricamento notifiche...</p>
          </div>
        </main>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-2xl">
        <div className="glass rounded-2xl border border-border dark:border-white/10 p-5 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-fg">Notifiche</h1>
              <p className="text-sm text-fg-muted mt-1">
                {unreadCount > 0
                  ? `${unreadCount} non ${unreadCount === 1 ? "letta" : "lette"}`
                  : "Tutte lette"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="shrink-0 px-4 py-2.5 rounded-2xl bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                {markingAll ? "Elaborazione..." : "Tutte lette"}
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="glass rounded-2xl border border-border dark:border-white/10 p-12 text-center">
            <div className="text-5xl mb-4" aria-hidden>🔔</div>
            <p className="text-fg-muted font-medium">Nessuna notifica.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-border dark:border-white/10 overflow-hidden divide-y divide-border dark:divide-white/10">
            {notifications.map((notification) => {
              const icon = getNotificationIcon(notification.type);
              const link = getNotificationLink(notification);
              const content = (
                <div
                  className={`p-4 transition-colors flex items-start gap-4 ${
                    !notification.readAt ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-surface/30"
                  }`}
                  onClick={() => !notification.readAt && handleMarkAsRead(notification.id)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !notification.readAt) {
                      e.preventDefault();
                      handleMarkAsRead(notification.id);
                    }
                  }}
                  role={link ? undefined : "button"}
                  tabIndex={link ? undefined : 0}
                >
                  <span className="text-2xl flex-shrink-0" aria-hidden>{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-base font-semibold ${!notification.readAt ? "text-fg" : "text-fg-muted"}`}>
                        {getNotificationTitle(notification.type, notification.data)}
                      </h3>
                      {!notification.readAt && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="shrink-0 text-xs font-medium text-primary hover:underline"
                        >
                          Marca come letta
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-fg-muted mt-1">{getNotificationMessage(notification.type, notification.data)}</p>
                    <p className="text-xs text-fg-subtle mt-2">{formatDate(notification.createdAt)}</p>
                  </div>
                </div>
              );

              if (link) {
                return (
                  <Link key={notification.id} href={link} className="block">
                    {content}
                  </Link>
                );
              }

              return <div key={notification.id}>{content}</div>;
            })}
          </div>
        )}
      </main>
    </div>
  );
}
