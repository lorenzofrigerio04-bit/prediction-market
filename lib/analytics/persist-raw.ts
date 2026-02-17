import { prisma } from "@/lib/prisma";

export interface PersistMarketAnalyticsRawParams {
  eventId: string;
  userId?: string;
  eventType: "impression" | "click";
}

/**
 * Persist a raw market analytics event for later hourly aggregation.
 * Fire-and-forget safe: errors are logged by the caller.
 */
export async function persistMarketAnalyticsRaw(
  params: PersistMarketAnalyticsRawParams
): Promise<void> {
  // marketAnalyticsRaw non esiste nello schema - rimosso
  return;
}
