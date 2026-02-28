import type { PrismaClient } from "@prisma/client";
import { getUserStats } from "./user-stats";
import { validateConstraints } from "./constraints";

export type MissionEventType =
  | "PLACE_PREDICTION"
  | "WIN_PREDICTION"
  | "LOSE_PREDICTION"
  | "VIEW_EVENT_DETAILS"
  | "FOLLOW_EVENT"
  | "LOGIN_STREAK_DAYS"
  | "CREATE_EVENT";

export interface PlacePredictionPayload {
  eventId: string;
  category: string;
  probability?: number;
  outcome: string;
  amount?: number;
  assignedCategory?: string;
}

export interface WinLosePayload {
  eventId: string;
  outcome: string;
  won: boolean;
}

export interface ViewEventDetailsPayload {
  eventId: string;
  category?: string;
}

export interface FollowEventPayload {
  eventId: string;
}

export interface LoginStreakPayload {
  streak: number;
}

export interface CreateEventPayload {
  eventId?: string;
}

export type MissionEventPayload =
  | PlacePredictionPayload
  | WinLosePayload
  | ViewEventDetailsPayload
  | FollowEventPayload
  | LoginStreakPayload
  | CreateEventPayload;

/**
 * Handle a domain event and update progress for all matching active missions.
 * Does not award credits - that happens on claim.
 */
export async function handleMissionEvent(
  prisma: PrismaClient,
  userId: string,
  eventType: MissionEventType,
  payload: MissionEventPayload
): Promise<{ completed: string[] }> {
  const completed: string[] = [];

  const activeMissions = await prisma.userMission.findMany({
    where: {
      userId,
      status: "ACTIVE",
      missionTemplateId: { not: null },
    },
    include: {
      missionTemplate: true,
    },
  });

  if (activeMissions.length === 0) return { completed };

  const metricsForEvent = getProgressMetricsForEvent(eventType);
  const userStats = await getUserStats(prisma, userId);

  for (const um of activeMissions) {
    const template = um.missionTemplate;
    if (!template || !metricsForEvent.includes(template.progressMetric))
      continue;

    const target = um.targetValue ?? template.targetValue;
    const payloadObj = payload as Record<string, unknown>;

    if (!validateConstraints(template.constraints, payloadObj, userStats))
      continue;

    let newProgress = um.progressValue;

    switch (template.progressMetric) {
      case "PREDICTIONS_COUNT":
        newProgress = Math.min((um.progressValue ?? 0) + 1, target);
        break;
      case "VIEW_EVENT_DETAILS_COUNT":
        newProgress = Math.min((um.progressValue ?? 0) + 1, target);
        break;
      case "FOLLOW_EVENT_COUNT":
        newProgress = Math.min((um.progressValue ?? 0) + 1, target);
        break;
      case "EVENTS_CREATED_COUNT":
        newProgress = Math.min((um.progressValue ?? 0) + 1, target);
        break;
      case "WINS_COUNT":
        if (eventType === "WIN_PREDICTION")
          newProgress = Math.min((um.progressValue ?? 0) + 1, target);
        break;
      case "WIN_STREAK":
        if (eventType === "WIN_PREDICTION" || eventType === "LOSE_PREDICTION") {
          const streak = userStats.winStreakCurrent;
          newProgress = Math.min(streak, target);
        }
        break;
      case "LOGIN_STREAK_DAYS": {
        const streak = (payload as LoginStreakPayload).streak;
        newProgress = Math.min(streak, target);
        break;
      }
      case "ACCURACY_PERCENT":
        if (eventType === "WIN_PREDICTION" || eventType === "LOSE_PREDICTION") {
          newProgress = Math.min(userStats.accuracyPercent, target);
          if (template.constraints) {
            try {
              const c = JSON.parse(template.constraints) as { minResolved?: number };
              if (c.minResolved != null && userStats.resolvedPredictions < c.minResolved)
                continue;
            } catch {
              /* ignore */
            }
          }
        }
        break;
      case "PREDICTIONS_CATEGORIES_COUNT":
        if (eventType === "PLACE_PREDICTION") {
          newProgress = Math.min(userStats.categoriesUsedCount, target);
          const constraints = template.constraints
            ? (JSON.parse(template.constraints) as { minPredictionsPerCategory?: number })
            : {};
          const minPer = constraints.minPredictionsPerCategory ?? 1;
          const withMin = userStats.categoriesByCount.filter(
            (c) => c.count >= minPer
          ).length;
          newProgress = Math.min(withMin, target);
        }
        break;
      case "ROI_PERCENT":
        if (eventType === "WIN_PREDICTION" || eventType === "LOSE_PREDICTION") {
          const positive = userStats.weeklyRealizedPlMicros > 0 ? 1 : 0;
          newProgress = Math.min(positive, target);
        }
        break;
      default:
        continue;
    }

    const justCompleted = newProgress >= target;

    await prisma.userMission.update({
      where: { id: um.id },
      data: {
        progressValue: newProgress,
        ...(justCompleted && {
          status: "COMPLETED",
          completedAt: new Date(),
        }),
      },
    });

    if (justCompleted) {
      completed.push(template.title);
      await prisma.notification.create({
        data: {
          userId,
          type: "MISSION_COMPLETED",
          data: JSON.stringify({
            userMissionId: um.id,
            missionTitle: template.title,
            templateCode: template.code,
          }),
        },
      }).catch(() => {});
    }
  }

  return { completed };
}

function getProgressMetricsForEvent(
  eventType: MissionEventType
): string[] {
  switch (eventType) {
    case "PLACE_PREDICTION":
      return ["PREDICTIONS_COUNT", "PREDICTIONS_CATEGORIES_COUNT"];
    case "WIN_PREDICTION":
    case "LOSE_PREDICTION":
      return [
        "WINS_COUNT",
        "WIN_STREAK",
        "ACCURACY_PERCENT",
        "ROI_PERCENT",
      ];
    case "VIEW_EVENT_DETAILS":
      return ["VIEW_EVENT_DETAILS_COUNT"];
    case "FOLLOW_EVENT":
      return ["FOLLOW_EVENT_COUNT"];
    case "LOGIN_STREAK_DAYS":
      return ["LOGIN_STREAK_DAYS"];
    case "CREATE_EVENT":
      return ["EVENTS_CREATED_COUNT"];
    default:
      return [];
  }
}
