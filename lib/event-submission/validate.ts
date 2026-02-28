/**
 * Validazione automatica per eventi proposti dagli utenti.
 * Usa gli stessi criteri del sistema di generazione eventi.
 */

import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { ensureAmmStateForEvent } from "@/lib/amm/ensure-amm-state";
import { getBParameterOrDefault } from "@/lib/pricing/initialization";
import { handleMissionEvent } from "@/lib/missions/mission-progress-service";
import { checkAndAwardBadges } from "@/lib/badges";

export const ALLOWED_CATEGORIES = [
  "Sport",
  "Politica",
  "Tecnologia",
  "Economia",
  "Cultura",
  "Scienza",
  "Intrattenimento",
] as const;

export type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

const VAGUE_KEYWORDS = [
  "potrebbe",
  "forse",
  "si dice",
  "sembra",
  "rumors",
  "rumour",
  "voci",
  "ipotesi",
  "chissà",
  "incerto",
  "mistero",
  "gossip",
  "ultim'ora",
  "breaking",
  "shock",
  "incredibile",
  "da non credere",
];

const NON_BINARY_KEYWORDS = [
  "quanto",
  "quanti",
  "chi vincerà",
  "chi vince",
  "quale",
  "quali",
  "quando esattamente",
  "in che modo",
  "come",
  "perché",
  "dove",
];

const MIN_TITLE_LENGTH = 15;
const MAX_TITLE_LENGTH = 200;
const MIN_HOURS_BEFORE_CLOSE = 24;
const MAX_DAYS_BEFORE_CLOSE = 730; // ~2 anni

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface EventSubmissionInput {
  title: string;
  description?: string | null;
  category: string;
  closesAt: Date;
  resolutionSource?: string | null;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!:"']/g, "");
}

function computeDedupKey(title: string, closesAt: Date): string {
  const normalizedTitle = normalizeText(title);
  const dateStr = closesAt.toISOString().split("T")[0];
  const combined = `${normalizedTitle}|${dateStr}|user-submission`;
  return createHash("sha256").update(combined).digest("hex");
}

function validateTitle(title: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const trimmed = title.trim();

  if (trimmed.length < MIN_TITLE_LENGTH) {
    errors.push(
      `Il titolo è troppo corto. Minimo ${MIN_TITLE_LENGTH} caratteri.`
    );
  }

  if (trimmed.length > MAX_TITLE_LENGTH) {
    errors.push(
      `Il titolo è troppo lungo. Massimo ${MAX_TITLE_LENGTH} caratteri.`
    );
  }

  if (!trimmed.endsWith("?")) {
    errors.push(
      'Il titolo deve essere una domanda e terminare con "?". Es: "L\'Italia vincerà gli Europei?"'
    );
  }

  const lower = trimmed.toLowerCase();

  for (const keyword of VAGUE_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) {
      errors.push(
        `Il titolo contiene termini vaghi ("${keyword}"). Riformula la domanda in modo più preciso.`
      );
      break;
    }
  }

  for (const keyword of NON_BINARY_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) {
      errors.push(
        `La domanda deve avere risposta SÌ o NO. Evita "${keyword}" e riformula come domanda binaria.`
      );
      break;
    }
  }

  const multipleQuestions =
    (trimmed.match(/\?/g) || []).length > 1 ||
    lower.includes(" o ") ||
    lower.includes(" oppure ");
  if (multipleQuestions) {
    errors.push(
      "Il titolo deve contenere una sola domanda semplice, senza alternative."
    );
  }

  return { valid: errors.length === 0, errors };
}

function validateCategory(category: string): {
  valid: boolean;
  errors: string[];
  normalized: string | null;
} {
  const errors: string[] = [];
  const trimmed = category.trim();

  const normalized = ALLOWED_CATEGORIES.find(
    (c) => c.toLowerCase() === trimmed.toLowerCase()
  );

  if (!normalized) {
    errors.push(
      `Categoria "${trimmed}" non valida. Categorie ammesse: ${ALLOWED_CATEGORIES.join(", ")}.`
    );
    return { valid: false, errors, normalized: null };
  }

  return { valid: true, errors: [], normalized };
}

function validateClosesAt(closesAt: Date): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const now = new Date();

  const minClose = new Date(now.getTime() + MIN_HOURS_BEFORE_CLOSE * 60 * 60 * 1000);
  if (closesAt < minClose) {
    errors.push(
      `La data di chiusura deve essere almeno ${MIN_HOURS_BEFORE_CLOSE} ore nel futuro.`
    );
  }

  const maxClose = new Date(now.getTime() + MAX_DAYS_BEFORE_CLOSE * 24 * 60 * 60 * 1000);
  if (closesAt > maxClose) {
    errors.push(
      `La data di chiusura non può essere oltre ${MAX_DAYS_BEFORE_CLOSE} giorni (~2 anni) nel futuro.`
    );
  }

  if (isNaN(closesAt.getTime())) {
    errors.push("Data di chiusura non valida.");
  }

  return { valid: errors.length === 0, errors };
}

async function checkDuplicate(
  title: string,
  closesAt: Date
): Promise<{ isDuplicate: boolean; existingEventId?: string }> {
  const dedupKey = computeDedupKey(title, closesAt);

  const existing = await prisma.event.findFirst({
    where: {
      dedupKey,
      status: "OPEN",
      closesAt: { gt: new Date() },
    },
    select: { id: true },
  });

  if (existing) {
    return { isDuplicate: true, existingEventId: existing.id };
  }

  const normalizedTitle = normalizeText(title);
  const similarEvent = await prisma.event.findFirst({
    where: {
      status: "OPEN",
      closesAt: { gt: new Date() },
    },
    select: { id: true, title: true },
  });

  if (similarEvent) {
    const similarNormalized = normalizeText(similarEvent.title);
    const similarity = calculateSimilarity(normalizedTitle, similarNormalized);
    if (similarity > 0.85) {
      return { isDuplicate: true, existingEventId: similarEvent.id };
    }
  }

  return { isDuplicate: false };
}

function calculateSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(" ").filter((w) => w.length > 2));
  const wordsB = new Set(b.split(" ").filter((w) => w.length > 2));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = wordsA.size + wordsB.size - intersection;
  return intersection / union;
}

export async function validateEventSubmission(
  input: EventSubmissionInput
): Promise<ValidationResult & { normalizedCategory?: string; dedupKey?: string }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const titleValidation = validateTitle(input.title);
  errors.push(...titleValidation.errors);

  const categoryValidation = validateCategory(input.category);
  errors.push(...categoryValidation.errors);

  const closesAtValidation = validateClosesAt(input.closesAt);
  errors.push(...closesAtValidation.errors);

  if (!input.resolutionSource?.trim()) {
    warnings.push(
      "Consigliamo di specificare una fonte di risoluzione (es. sito ufficiale, comunicato stampa)."
    );
  }

  if (errors.length === 0) {
    const duplicateCheck = await checkDuplicate(input.title, input.closesAt);
    if (duplicateCheck.isDuplicate) {
      errors.push(
        "Esiste già un evento simile sulla piattaforma. Prova con una domanda diversa."
      );
    }
  }

  const dedupKey =
    errors.length === 0
      ? computeDedupKey(input.title, input.closesAt)
      : undefined;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedCategory: categoryValidation.normalized ?? undefined,
    dedupKey,
  };
}

export async function createEventFromSubmission(
  input: EventSubmissionInput,
  submittedById: string,
  dedupKey: string,
  normalizedCategory: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const event = await prisma.event.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        category: normalizedCategory,
        closesAt: input.closesAt,
        resolutionSourceUrl: input.resolutionSource?.trim() || null,
        resolutionNotes: input.resolutionSource
          ? `Evento creato dalla community. Fonte: ${input.resolutionSource}`
          : "Evento creato dalla community.",
        createdById: submittedById,
        dedupKey,
        b: getBParameterOrDefault(normalizedCategory),
        resolutionBufferHours: 24,
        resolved: false,
        resolutionStatus: "PENDING",
        status: "OPEN",
        tradingMode: "AMM",
      },
    });
    await ensureAmmStateForEvent(prisma, event.id);

    // Missione "Primo evento" e badge FIRST_EVENT_CREATED
    handleMissionEvent(prisma, submittedById, "CREATE_EVENT", { eventId: event.id }).catch((e) =>
      console.error("Mission progress (CREATE_EVENT) error:", e)
    );
    checkAndAwardBadges(prisma, submittedById).catch((e) =>
      console.error("Badge check after event create error:", e)
    );

    return { success: true, eventId: event.id };
  } catch (error: unknown) {
    console.error("Error creating event from submission:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "Esiste già un evento identico. Prova con una domanda diversa.",
      };
    }

    return {
      success: false,
      error: "Errore durante la creazione dell'evento. Riprova più tardi.",
    };
  }
}
