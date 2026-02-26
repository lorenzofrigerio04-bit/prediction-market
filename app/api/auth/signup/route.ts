import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { track } from "@/lib/analytics";
import { CREDITS_SCALE, INITIAL_CREDITS } from "@/lib/credits-config";

const SIGNUP_LIMIT = 5; // richieste signup per IP per minuto

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(`signup:${ip}`, SIGNUP_LIMIT);
  if (limited) {
    return NextResponse.json(
      { error: "Troppe richieste di registrazione. Riprova tra un minuto." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password sono obbligatori" },
        { status: 400 }
      );
    }

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utente con questa email esiste già" },
        { status: 400 }
      );
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        credits: INITIAL_CREDITS,
        creditsMicros: BigInt(INITIAL_CREDITS) * BigInt(CREDITS_SCALE),
      },
    });

    track("USER_SIGNUP", { userId: user.id }, { request });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Errore durante la registrazione:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Un utente con questa email esiste già" },
        { status: 400 }
      );
    }

    // Tabelle mancanti: eseguire prisma db push sul DB di produzione
    if (error.code === "P2021" || error.message?.includes("does not exist")) {
      return NextResponse.json(
        {
          error:
            "Il database non ha ancora le tabelle. Esegui dal tuo computer: DATABASE_URL=\"la_tua_url_neon\" npx prisma db push && npm run db:seed",
        },
        { status: 500 }
      );
    }
    
    if (
      error.message?.includes("connect") ||
      error.message?.includes("database") ||
      error.code === "P1001" ||
      error.code === "P1017"
    ) {
      return NextResponse.json(
        {
          error:
            "Errore di connessione al database. Verifica DATABASE_URL su Vercel, che Neon sia attivo e che usi l'URL con \"-pooler\" (connection pooler).",
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Errore durante la registrazione",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
