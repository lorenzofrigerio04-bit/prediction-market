/**
 * API Route per marcare notifiche come lette
 * POST /api/notifications/mark-read
 * Body: { notificationIds?: string[] } - Se vuoto, marca tutte come lette
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds } = body || {};

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Marca specifiche notifiche come lette
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId, // Sicurezza: solo le proprie notifiche
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });
    } else {
      // Marca tutte le notifiche non lette come lette
      await prisma.notification.updateMany({
        where: {
          userId,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
