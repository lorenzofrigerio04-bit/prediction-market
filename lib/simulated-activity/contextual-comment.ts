/**
 * Step 10 – Commenti contestuali per bot (event comments).
 * Genera un commento breve su una notizia tramite LLM (titolo + categoria + tono).
 * Fallback: restituire null e usare i template in comment-templates.ts.
 */

const MAX_COMMENT_LENGTH = 200;

/** Abilita commenti generati da LLM (env: "true" | "1"). Se false o chiave assente, generateContextualComment restituirà null. */
export const ENABLE_LLM_COMMENTS =
  process.env.ENABLE_LLM_COMMENTS === "true" ||
  process.env.ENABLE_LLM_COMMENTS === "1";

export type CommentTone = "serious" | "light";

/**
 * Genera un commento breve in italiano su una notizia.
 * Usa OpenAI se OPENAI_API_KEY e ENABLE_LLM_COMMENTS sono impostati; altrimenti restituisce null.
 * Il chiamante deve usare i template come fallback.
 */
export async function generateContextualComment(
  eventTitle: string,
  category: string,
  tone: CommentTone = "serious"
): Promise<string | null> {
  if (process.env.DISABLE_OPENAI === "true" || process.env.DISABLE_OPENAI === "1") return null;
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || !ENABLE_LLM_COMMENTS) {
    return null;
  }

  const toneLabel = tone === "serious" ? "serio" : "leggero";
  const prompt = `Genera un solo commento breve in italiano su questa notizia. Titolo: ${eventTitle}. Categoria: ${category}. Tono: ${toneLabel}. Scrivi solo il commento, niente virgolette o prefissi. Massimo ${MAX_COMMENT_LENGTH} caratteri.`;

  try {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.GENERATION_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 80,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return null;

    const truncated =
      content.length > MAX_COMMENT_LENGTH
        ? content.slice(0, MAX_COMMENT_LENGTH).trim()
        : content;
    return truncated.length > 0 ? truncated : null;
  } catch {
    return null;
  }
}
