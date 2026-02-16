/**
 * Fase 5: Creazione eventi in DB da eventi generati (LLM/pipeline).
 * Usa utente "sistema" (EVENT_GENERATOR_USER_ID o primo admin) e scrive in AuditLog.
 */

import type { PrismaClient } from "@prisma/client";
import { createAuditLog } from "@/lib/audit";
import { validateMarket } from "@/lib/validator";
import { getBParameter } from "@/lib/pricing/initialization";
import { getBufferHoursForCategory } from "@/lib/markets";
import type { GeneratedEvent } from "./types";
import { ALLOWED_CATEGORIES } from "./types";

const SYSTEM_USER_EMAIL = "event-generator@system";

/**
 * Restituisce l'id dell'utente da usare come creatore degli eventi generati:
 * EVENT_GENERATOR_USER_ID da env, oppure utente event-generator@system, oppure primo admin.
 */
export async function getEventGeneratorUserId(prisma: PrismaClient): Promise<string> {
  const envId = process.env.EVENT_GENERATOR_USER_ID?.trim();
  if (envId) {
    const user = await prisma.user.findUnique({ where: { id: envId }, select: { id: true } });
    if (user) return user.id;
  }
  const systemUser = await prisma.user.findUnique({
    where: { email: SYSTEM_USER_EMAIL },
    select: { id: true },
  });
  if (systemUser) return systemUser.id;
  const firstAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (firstAdmin) return firstAdmin.id;
  throw new Error(
    "Nessun utente disponibile per la creazione eventi: imposta EVENT_GENERATOR_USER_ID o esegui il seed (utente sistema o admin)."
  );
}

/**
 * Normalizza il titolo per il confronto anti-duplicati (lowercase, trim, spazi multipli → singolo).
 */
export function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export type ValidationResult = { ok: true } | { ok: false; error: string };

/**
 * Valida un singolo evento generato contro il modello Event (stesse regole di POST admin/events).
 * Gli eventi passati qui provengono da generateEventsFromCandidates, che calcola sempre closesAt
 * con computeClosesAt (coerenza scadenza scommessa ↔ data esito); non si usa closesAt random.
 */
export function validateEventPayload(event: GeneratedEvent): ValidationResult {
  if (!event.title || typeof event.title !== "string" || !event.title.trim()) {
    return { ok: false, error: "Titolo obbligatorio" };
  }
  if (!event.category || !(ALLOWED_CATEGORIES as readonly string[]).includes(event.category)) {
    return { ok: false, error: "Categoria obbligatoria e deve essere una di: " + ALLOWED_CATEGORIES.join(", ") };
  }
  if (!event.closesAt || typeof event.closesAt !== "string") {
    return { ok: false, error: "Data di chiusura (closesAt) obbligatoria" };
  }
  const closesAtDate = new Date(event.closesAt);
  if (isNaN(closesAtDate.getTime())) {
    return { ok: false, error: "Data di chiusura non valida" };
  }
  if (closesAtDate <= new Date()) {
    return { ok: false, error: "La data di chiusura deve essere nel futuro" };
  }
  if (!event.resolutionSourceUrl || typeof event.resolutionSourceUrl !== "string" || !event.resolutionSourceUrl.trim()) {
    return { ok: false, error: "URL fonte di risoluzione obbligatorio" };
  }
  if (!event.resolutionNotes || typeof event.resolutionNotes !== "string" || !event.resolutionNotes.trim()) {
    return { ok: false, error: "Note di risoluzione obbligatorie" };
  }
  return { ok: true };
}

export type CreateEventsResult = {
  created: number;
  skipped: number;
  errors: Array<{ index: number; title: string; reason: string }>;
  eventIds: string[];
};

/**
 * Crea in DB gli eventi generati, con utente sistema e audit.
 * - Valida ogni payload (titolo, categoria, closesAt, resolutionSourceUrl, resolutionNotes).
 * - Ignora duplicati: stesso titolo normalizzato già presente e non risolto.
 * - Per ogni evento creato scrive una riga in AuditLog (EVENT_CREATE, entityType event).
 */
export async function createEventsFromGenerated(
  prisma: PrismaClient,
  generatedEvents: GeneratedEvent[]
): Promise<CreateEventsResult> {
  const result: CreateEventsResult = { created: 0, skipped: 0, errors: [], eventIds: [] };
  const creatorId = await getEventGeneratorUserId(prisma);

  const unresolved = await prisma.event.findMany({
    where: { resolved: false },
    select: { title: true },
  });
  const existingNormalizedTitles = new Set(unresolved.map((e) => normalizeTitle(e.title)));

  for (let i = 0; i < generatedEvents.length; i++) {
    const ev = generatedEvents[i];
    const validation = validateEventPayload(ev);
    if (!validation.ok) {
      result.errors.push({ index: i, title: ev.title.slice(0, 50), reason: validation.error });
      continue;
    }

    const marketValidation = validateMarket({
      title: ev.title,
      description: ev.description ?? null,
      closesAt: ev.closesAt,
      resolutionSourceUrl: ev.resolutionSourceUrl ?? null,
      resolutionNotes: ev.resolutionNotes ?? null,
    });
    if (!marketValidation.valid) {
      result.errors.push({
        index: i,
        title: ev.title.slice(0, 50),
        reason: `Validator (hard fail): ${marketValidation.reasons.join("; ")}`,
      });
      continue;
    }

    const normalized = normalizeTitle(ev.title);
    if (existingNormalizedTitles.has(normalized)) {
      result.skipped++;
      continue;
    }

    try {
      const closesAtDate = new Date(ev.closesAt);
      const b = getBParameter(ev.category as Parameters<typeof getBParameter>[0], "Medium");
      const resolutionBufferHours = getBufferHoursForCategory(ev.category);
      const event = await prisma.event.create({
        data: {
          title: ev.title.trim(),
          description: ev.description?.trim() || null,
          category: ev.category,
          closesAt: closesAtDate,
          resolutionSourceUrl: ev.resolutionSourceUrl.trim(),
          resolutionNotes: ev.resolutionNotes.trim(),
          createdById: creatorId,
          resolutionStatus: marketValidation.needsReview ? "NEEDS_REVIEW" : "PENDING",
          b,
          resolutionBufferHours,
        },
      });
      result.created++;
      result.eventIds.push(event.id);
      existingNormalizedTitles.add(normalized);

      await createAuditLog(prisma, {
        userId: creatorId,
        action: "EVENT_CREATE",
        entityType: "event",
        entityId: event.id,
        payload: {
          title: event.title,
          category: event.category,
          source: "event-generation",
          ...(marketValidation.needsReview && {
            needsReview: true,
            validationReasons: marketValidation.reasons,
          }),
        },
      });
    } catch (err) {
      result.errors.push({
        index: i,
        title: ev.title.slice(0, 50),
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}
