/**
 * LLM abstraction for the BRAIN layer.
 * Supports OpenAI and Anthropic (Claude). Falls back gracefully.
 *
 * Strategy:
 * - Analyst & Verifier: prefer Claude (better at structured reasoning) → fallback GPT-4o
 * - Creative: prefer GPT-4o (more creative) → fallback Claude
 * - Resolver: GPT-4o-mini (fast, cheap, structured output)
 */

import OpenAI from "openai";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AgentRole = "analyst" | "creative" | "verifier" | "resolver";

interface LLMResponse {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number };
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function getModelPreferences(): Record<AgentRole, { primary: string; fallback: string }> {
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY?.trim();
  const hasOpenAI = !!process.env.OPENAI_API_KEY?.trim();
  return {
    analyst: {
      primary: hasAnthropic ? "claude-sonnet" : "gpt-4o",
      fallback: hasOpenAI ? "gpt-4o" : "claude-sonnet",
    },
    creative: {
      primary: hasOpenAI ? "gpt-4o" : "claude-sonnet",
      fallback: hasAnthropic ? "claude-sonnet" : "gpt-4o-mini",
    },
    verifier: {
      primary: hasAnthropic ? "claude-sonnet" : "gpt-4o",
      fallback: hasOpenAI ? "gpt-4o" : "claude-sonnet",
    },
    resolver: {
      primary: hasOpenAI ? "gpt-4o-mini" : "claude-sonnet",
      fallback: hasAnthropic ? "claude-sonnet" : "gpt-4o-mini",
    },
  };
}

const TEMPERATURE: Record<AgentRole, number> = {
  analyst: 0.3,
  creative: 0.7,
  verifier: 0.2,
  resolver: 0.15,
};

const MAX_TOKENS: Record<AgentRole, number> = {
  analyst: 4000,
  creative: 6000,
  verifier: 4000,
  resolver: 3000,
};

// ---------------------------------------------------------------------------
// Clients (lazy init)
// ---------------------------------------------------------------------------

let _openai: OpenAI | null = null;
let _anthropic: import("@anthropic-ai/sdk").default | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) throw new Error("OPENAI_API_KEY not configured");
    _openai = new OpenAI({ apiKey: key });
  }
  return _openai;
}

async function getAnthropic(): Promise<import("@anthropic-ai/sdk").default | null> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
  if (!_anthropic) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    _anthropic = new Anthropic({ apiKey: key });
  }
  return _anthropic;
}

// ---------------------------------------------------------------------------
// Call implementations
// ---------------------------------------------------------------------------

async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  model: string,
  role: AgentRole
): Promise<LLMResponse> {
  const openaiModel = model === "gpt-4o-mini" ? "gpt-4o-mini" : "gpt-4o";
  const client = getOpenAI();

  const completion = await client.chat.completions.create({
    model: openaiModel,
    temperature: TEMPERATURE[role],
    max_tokens: MAX_TOKENS[role],
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  return {
    content,
    model: openaiModel,
    usage: completion.usage
      ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
        }
      : undefined,
  };
}

async function callAnthropic(
  systemPrompt: string,
  userMessage: string,
  role: AgentRole
): Promise<LLMResponse> {
  const client = await getAnthropic();
  if (!client) throw new Error("Anthropic not available");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: MAX_TOKENS[role],
    temperature: TEMPERATURE[role],
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const content = textBlock && "text" in textBlock ? textBlock.text.trim() : "";

  return {
    content,
    model: "claude-sonnet",
    usage: {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
    },
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Call the appropriate LLM for an agent role with automatic fallback.
 */
export async function callAgent(
  role: AgentRole,
  systemPrompt: string,
  userMessage: string
): Promise<LLMResponse> {
  const prefs = getModelPreferences()[role];

  // Try primary
  try {
    if (prefs.primary === "claude-sonnet") {
      return await callAnthropic(systemPrompt, userMessage, role);
    }
    return await callOpenAI(systemPrompt, userMessage, prefs.primary, role);
  } catch (err) {
    console.warn(
      `[BRAIN/${role}] Primary model (${prefs.primary}) failed: ${err instanceof Error ? err.message : err}. Falling back to ${prefs.fallback}.`
    );
  }

  // Fallback
  if (prefs.fallback === "claude-sonnet") {
    return await callAnthropic(systemPrompt, userMessage, role);
  }
  return await callOpenAI(systemPrompt, userMessage, prefs.fallback, role);
}

/**
 * Parse JSON from LLM response, handling markdown fences.
 */
export function parseJsonResponse<T>(raw: string): T | null {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to extract JSON object/array from surrounding text
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
