import OpenAI from "openai";
import { isOpenAIDisabled } from "@/lib/check-openai-disabled";
import type { SemanticTranslationResult, SourceMarket } from "./types";

function fallbackTranslation(source: SourceMarket): SemanticTranslationResult {
  const riskFlags = ["semantic_translation_fallback"];
  return {
    titleIt: source.title,
    descriptionIt: source.description || "Mercato importato da fonte esterna.",
    rulebookIt: source.rulebook.sourceRaw || "Regole non dettagliate nella fonte originaria.",
    edgeCasesIt: source.rulebook.edgeCases.length ? source.rulebook.edgeCases : ["Nessun edge case esplicito"],
    confidence: 0.35,
    usedAI: false,
    riskFlags,
  };
}

export async function translateMarketSemantically(source: SourceMarket): Promise<SemanticTranslationResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || isOpenAIDisabled()) {
    return fallbackTranslation(source);
  }

  const client = new OpenAI({ apiKey });
  const userPrompt = [
    "Sei un editor italiano senior per piattaforme di prediction market.",
    "Traduci e riscrivi in italiano naturale, chiaro e scorrevole: evita calchi parola-per-parola.",
    "Mantieni invariato il significato legale e operativo di regole, scadenze, edge case e fonte di risoluzione.",
    "Usa tono semplice per utente retail, ma precisione alta.",
    "Output JSON con: titleIt, descriptionIt, rulebookIt, edgeCasesIt(array), confidence(0-1).",
    "titleIt deve essere una domanda chiara in italiano.",
    "rulebookIt deve includere eventuali condizioni speciali e casi limite.",
    `TITLE_EN: ${source.title}`,
    `DESCRIPTION_EN: ${source.description}`,
    `RULEBOOK_EN: ${source.rulebook.sourceRaw}`,
    `RESOLUTION_SOURCE: ${source.rulebook.resolutionAuthorityHost}`,
    `EDGE_CASES_EN: ${(source.rulebook.edgeCases || []).join(" | ") || "none"}`,
  ].join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: process.env.REPLICA_TRANSLATION_AI_MODEL?.trim() || "gpt-4o-mini",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.1,
      max_tokens: 900,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return fallbackTranslation(source);
    const parsed = JSON.parse(raw) as {
      titleIt?: string;
      descriptionIt?: string;
      rulebookIt?: string;
      edgeCasesIt?: string[];
      confidence?: number;
    };

    const titleIt = (parsed.titleIt ?? "").trim() || source.title;
    const descriptionIt = (parsed.descriptionIt ?? "").trim() || source.description;
    const rulebookIt = (parsed.rulebookIt ?? "").trim() || source.rulebook.sourceRaw;
    const edgeCasesIt = Array.isArray(parsed.edgeCasesIt) && parsed.edgeCasesIt.length > 0
      ? parsed.edgeCasesIt.map((entry) => String(entry))
      : source.rulebook.edgeCases;

    const riskFlags: string[] = [];
    if (titleIt.toLowerCase() === source.title.toLowerCase()) {
      riskFlags.push("translation_title_unchanged");
    }
    if (!rulebookIt || rulebookIt.length < 30) {
      riskFlags.push("translation_rulebook_short");
    }

    return {
      titleIt,
      descriptionIt,
      rulebookIt,
      edgeCasesIt,
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? 0.65))),
      usedAI: true,
      riskFlags,
    };
  } catch {
    return fallbackTranslation(source);
  }
}
