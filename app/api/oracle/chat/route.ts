import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { fetchEventsForTopic, buildEventsContextText } from "@/lib/oracle/events-context";
import { getOracleSystemPrompt, getOracleUserPrompt } from "@/lib/oracle/prompts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RATE_LIMIT_REPORTS_PER_HOUR = 10;

/** Rate limit semplice: conta report ultima ora per userId. */
async function checkRateLimit(userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.oracleReport.count({
    where: {
      chat: { userId },
      createdAt: { gte: oneHourAgo },
    },
  });
  return count < RATE_LIMIT_REPORTS_PER_HOUR;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    if (process.env.DISABLE_OPENAI === "true" || process.env.DISABLE_OPENAI === "1") {
      return NextResponse.json(
        { error: "Oracle disabilitato (DISABLE_OPENAI attivo)" },
        { status: 503 }
      );
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Oracle non configurato (OPENAI_API_KEY mancante)" },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json(
        { error: "Campo 'message' obbligatorio" },
        { status: 400 }
      );
    }

    const allowed = await checkRateLimit(userId);
    if (!allowed) {
      return NextResponse.json(
        { error: "Limite di report raggiunto. Riprova tra un'ora." },
        { status: 429 }
      );
    }

    const events = await fetchEventsForTopic(message);
    const eventsContext = buildEventsContextText(events);
    const systemPrompt = getOracleSystemPrompt(eventsContext);
    const userPrompt = getOracleUserPrompt(message);

    const client = new OpenAI({ apiKey });
    const stream = await client.chat.completions.create({
      model: process.env.ORACLE_MODEL ?? "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      temperature: 0.5,
    });

    const encoder = new TextEncoder();
    let fullContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              controller.enqueue(encoder.encode(delta));
            }
          }
          controller.close();

          // Salva il report dopo lo stream
          if (fullContent && userId) {
            let chat = await prisma.oracleChat.findFirst({
              where: { userId },
              orderBy: { createdAt: "desc" },
            });
            if (!chat) {
              chat = await prisma.oracleChat.create({
                data: { userId },
              });
            }
            await prisma.oracleReport.create({
              data: {
                chatId: chat.id,
                userQuery: message,
                reportText: fullContent,
                topic: message.slice(0, 100),
              },
            });
          }
        } catch (err) {
          console.error("Oracle stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("Oracle chat error:", message, stack);

    const isDev = process.env.NODE_ENV === "development";
    let userMessage = "Errore durante la generazione del report";

    if (isDev && message) {
      userMessage = `Errore: ${message}`;
    } else if (message?.includes("OPENAI_API_KEY") || message?.includes("api_key")) {
      userMessage = "Chiave API OpenAI non valida. Verifica OPENAI_API_KEY in .env.local";
    } else if (message?.includes("rate_limit") || message?.includes("429")) {
      userMessage = "Limite di richieste OpenAI raggiunto. Riprova tra poco.";
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
