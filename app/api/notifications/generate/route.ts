/**
 * API Route per generare notifiche on-demand
 * POST /api/notifications/generate
 * 
 * Chiamato quando utente apre Home o Eventi per generare notifiche best-effort
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateNotificationsForUser } from '@/lib/notifications/generator';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Best-effort: non bloccare se fallisce
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const todayStart = new Date(now.setHours(0, 0, 0, 0));

      // Fetch dati necessari dal DB
      const [events, userPredictions, user] = await Promise.all([
        prisma.event.findMany({
          where: {
            OR: [
              { resolved: false, closesAt: { lte: oneHourFromNow } },
              { resolved: true, resolvedAt: { gte: oneDayAgo } },
            ],
          },
          select: { 
            id: true,
            title: true,
            closesAt: true, 
            resolved: true, 
            resolvedAt: true,
          },
        }),
        prisma.prediction.findMany({
          where: { userId },
          select: { eventId: true, createdAt: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { 
            id: true,
            streakCount: true,
          },
        }),
      ]);

      // Calcola hasPredictedToday
      const hasPredictedToday = userPredictions.some(
        p => new Date(p.createdAt) >= todayStart
      );

      // TODO: Fetch rank corrente e precedente dalla leaderboard
      // Per ora lasciamo undefined - può essere implementato quando la leaderboard è pronta
      const currentRank = undefined;
      const previousRank = undefined;

      const context = {
        userId,
        events: events.map(e => ({
          id: e.id,
          title: e.title,
          closesAt: e.closesAt,
          resolved: e.resolved,
          resolvedAt: e.resolvedAt,
        })),
        userPredictions: userPredictions.map(p => ({
          eventId: p.eventId,
          createdAt: p.createdAt,
        })),
        currentRank,
        previousRank,
        streakCount: user?.streakCount || 0,
        hasPredictedToday,
      };

      const notificationsToCreate = await generateNotificationsForUser(context);

      // Crea notifiche nel DB (evita duplicati)
      let createdCount = 0;
      for (const notif of notificationsToCreate) {
        // Verifica se notifica simile esiste già (ultime 24h)
        // Note: data is a JSON string, so we can't use Prisma JSON filters
        // Filtering by type and createdAt should be sufficient to avoid duplicates
        const exists = await prisma.notification.findFirst({
          where: {
            userId,
            type: notif.type,
            createdAt: { gte: oneDayAgo },
          },
        });

        if (!exists) {
          await prisma.notification.create({
            data: {
              userId,
              type: notif.type,
              data: notif.data,
            },
          });
          createdCount++;
        }
      }

      return NextResponse.json({
        success: true,
        generated: notificationsToCreate.length,
        created: createdCount,
      });
    } catch (error) {
      // Best-effort: logga ma non fallisce
      console.error('Error generating notifications (best-effort):', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate notifications (non-blocking)',
      });
    }
  } catch (error) {
    console.error('Error in generate notifications endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate notifications' },
      { status: 500 }
    );
  }
}
