'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Notification, NotificationsResponse } from '@/lib/notifications/types';

interface UseNotificationsResult {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook per ottenere le notifiche paginate
 */
export function useNotifications(
  page: number = 1,
  limit: number = 20
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<UseNotificationsResult['pagination']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data: NotificationsResponse = await response.json();
      
      // Parse data field from JSON string if needed (fallback)
      const parsedNotifications = data.notifications.map(n => ({
        ...n,
        data: n.data && typeof n.data === 'string' ? JSON.parse(n.data) : n.data,
      }));

      setNotifications(parsedNotifications);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setNotifications([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    pagination,
    isLoading,
    error,
    refetch: fetchNotifications,
  };
}

interface UseMarkAsReadResult {
  markAsRead: (notificationIds?: string[]) => Promise<boolean>;
  isMarking: boolean;
  error: Error | null;
}

/**
 * Hook per marcare notifiche come lette
 */
export function useMarkAsRead(): UseMarkAsReadResult {
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const markAsRead = useCallback(async (notificationIds?: string[]): Promise<boolean> => {
    setIsMarking(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark as read: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return false;
    } finally {
      setIsMarking(false);
    }
  }, []);

  return {
    markAsRead,
    isMarking,
    error,
  };
}

interface UseUnreadCountResult {
  count: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook per ottenere il conteggio delle notifiche non lette
 */
export function useUnreadCount(): UseUnreadCountResult {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCount = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/unread-count');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.statusText}`);
      }

      const data = await response.json();
      setCount(data.count || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    
    // Poll ogni 30 secondi per aggiornare il conteggio
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return {
    count,
    isLoading,
    error,
    refetch: fetchCount,
  };
}
