/**
 * Verifica la coerenza tra scadenza scommessa (closesAt) e data esito dell'evento.
 * Per ogni evento: estrae dalla titolo/descrizione la data in cui l'esito è verificabile;
 * se presente, controlla che closesAt sia circa = data esito - ore prima (es. 1h).
 *
 * Uso: npx tsx scripts/check-events-coherence.ts
 */

import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import { parseOutcomeDateFromText } from "../lib/event-generation/closes-at";
import { getClosureRules } from "../lib/event-generation/config";

const prisma = new PrismaClient();

/** Tolleranza in ms: closesAt può essere fino a TOLERANCE_MS prima della data esito (oltre a hoursBeforeEvent). */
const TOLERANCE_MS = 48 * 60 * 60 * 1000; // 48 ore

type CoherenceStatus = "COERENTE" | "INCOERENTE" | "NESSUNA_DATA" | "ESITO_NEL_PASSATO";

interface CheckResult {
  id: string;
  title: string;
  category: string;
  closesAt: Date;
  resolved: boolean;
  status: CoherenceStatus;
  outcomeDateFromText: Date | null;
  expectedClosesAt: Date | null;
  reason: string;
}

function checkEvent(
  event: { id: string; title: string; description: string | null; category: string; closesAt: Date; resolved: boolean }
): CheckResult {
  const text = [event.title, event.description ?? ""].filter(Boolean).join(" ");
  const outcomeDateRaw = parseOutcomeDateFromText(text);
  const outcomeDate =
    outcomeDateRaw && !Number.isNaN(outcomeDateRaw.getTime()) ? outcomeDateRaw : null;
  const rules = getClosureRules();
  const now = new Date();
  const safeIso = (d: Date) => (Number.isNaN(d.getTime()) ? "invalid" : d.toISOString().slice(0, 16));
  const safeIsoDateOnly = (d: Date) => (Number.isNaN(d.getTime()) ? "invalid" : d.toISOString().slice(0, 10));

  if (!outcomeDate) {
    return {
      id: event.id,
      title: event.title,
      category: event.category,
      closesAt: event.closesAt,
      resolved: event.resolved,
      status: "NESSUNA_DATA",
      outcomeDateFromText: null,
      expectedClosesAt: null,
      reason: "Nessuna data esito esplicita nel titolo/descrizione (evento a termine generico).",
    };
  }

  if (outcomeDate.getTime() < now.getTime()) {
    return {
      id: event.id,
      title: event.title,
      category: event.category,
      closesAt: event.closesAt,
      resolved: event.resolved,
      status: "ESITO_NEL_PASSATO",
      outcomeDateFromText: outcomeDate,
      expectedClosesAt: null,
      reason: `La data esito estratta (${safeIsoDateOnly(outcomeDate)}) è nel passato. L'evento non dovrebbe essere aperto.`,
    };
  }

  const hoursBefore =
    typeof rules.hoursBeforeEvent === "number" && !Number.isNaN(rules.hoursBeforeEvent)
      ? rules.hoursBeforeEvent
      : 1;
  const expectedClosesAt = new Date(
    outcomeDate.getTime() - hoursBefore * 60 * 60 * 1000
  );
  const closesAtTime = new Date(event.closesAt).getTime();
  const expectedTime = Number.isNaN(expectedClosesAt.getTime()) ? closesAtTime : expectedClosesAt.getTime();
  const diffMs = Math.abs(closesAtTime - expectedTime);

  if (diffMs <= TOLERANCE_MS) {
    return {
      id: event.id,
      title: event.title,
      category: event.category,
      closesAt: event.closesAt,
      resolved: event.resolved,
      status: "COERENTE",
      outcomeDateFromText: outcomeDate,
      expectedClosesAt,
      reason: `closesAt (${safeIso(new Date(event.closesAt))}) coerente con data esito ${safeIsoDateOnly(outcomeDate)}.`,
    };
  }

  return {
    id: event.id,
    title: event.title,
    category: event.category,
    closesAt: event.closesAt,
    resolved: event.resolved,
    status: "INCOERENTE",
    outcomeDateFromText: outcomeDate,
    expectedClosesAt,
    reason: `closesAt (${safeIso(new Date(event.closesAt))}) non coerente con data esito ${safeIsoDateOnly(outcomeDate)}. Atteso circa: ${safeIso(expectedClosesAt)}.`,
  };
}

async function main() {
  console.log("=== Check coerenza eventi: scadenza scommessa vs data esito ===\n");

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      closesAt: true,
      resolved: true,
    },
  });

  if (events.length === 0) {
    console.log("Nessun evento nel database.");
    return;
  }

  const results: CheckResult[] = events.map((e) => checkEvent(e));

  const byStatus = {
    COERENTE: results.filter((r) => r.status === "COERENTE"),
    INCOERENTE: results.filter((r) => r.status === "INCOERENTE"),
    NESSUNA_DATA: results.filter((r) => r.status === "NESSUNA_DATA"),
    ESITO_NEL_PASSATO: results.filter((r) => r.status === "ESITO_NEL_PASSATO"),
  };

  console.log(`Totale eventi: ${events.length}`);
  console.log(`  COERENTE:           ${byStatus.COERENTE.length}`);
  console.log(`  INCOERENTE:        ${byStatus.INCOERENTE.length}`);
  console.log(`  NESSUNA_DATA:      ${byStatus.NESSUNA_DATA.length} (termine generico, non verificabile)`);
  console.log(`  ESITO_NEL_PASSATO: ${byStatus.ESITO_NEL_PASSATO.length}`);
  console.log("");

  if (byStatus.INCOERENTE.length > 0) {
    console.log("--- Eventi INCOERENTI (scadenza scommessa ≠ data esito) ---");
    byStatus.INCOERENTE.forEach((r) => {
      console.log(`  [${r.category}] ${r.title.slice(0, 60)}...`);
      console.log(`    ${r.reason}`);
    });
    console.log("");
  }

  if (byStatus.ESITO_NEL_PASSATO.length > 0) {
    console.log("--- Eventi con data esito nel passato ---");
    byStatus.ESITO_NEL_PASSATO.forEach((r) => {
      console.log(`  [${r.category}] ${r.title.slice(0, 60)}...`);
      console.log(`    ${r.reason}`);
    });
    console.log("");
  }

  console.log("--- Dettaglio per evento ---");
  results.forEach((r, i) => {
    const icon =
      r.status === "COERENTE"
        ? "✅"
        : r.status === "INCOERENTE"
          ? "❌"
          : r.status === "ESITO_NEL_PASSATO"
            ? "⚠️"
            : "➖";
    console.log(`${i + 1}. ${icon} [${r.status}] ${r.title}`);
    console.log(`   Chiude: ${r.closesAt.toISOString().slice(0, 16)} | ${r.reason}`);
  });

  const hasProblems = byStatus.INCOERENTE.length > 0 || byStatus.ESITO_NEL_PASSATO.length > 0;
  if (hasProblems) {
    process.exitCode = 1;
    console.log("\n⚠️  Trovati eventi incoerenti o con esito nel passato. Correggere scadenze o descrizioni.");
  } else {
    console.log("\n✅ Coerenza OK (eventi con data esplicita coerenti; altri a termine generico).");
  }
}

main()
  .catch((e) => {
    console.error("Errore:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
