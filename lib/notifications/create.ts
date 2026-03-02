import { prisma } from "@/lib/prisma";
import { NotificationType } from "./types";
import type { NotificationData } from "./types";

/**
 * Crea una notifica per un utente. I dati vengono serializzati in JSON.
 * Best-effort: non lancia se il DB fallisce (es. per non bloccare like/comment).
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  data: NotificationData[NotificationType]
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        data: JSON.stringify(data),
      },
    });
  } catch (err) {
    console.error("[createNotification]", type, userId, err);
  }
}
