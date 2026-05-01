import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createAndSendVerificationEmail } from "@/lib/email-verification";

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
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password sono obbligatori" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, emailVerified: true },
    });

    if (existingUser?.emailVerified) {
      return NextResponse.json(
        { error: "Un utente con questa email esiste già" },
        { status: 400 }
      );
    }

    if (existingUser && !existingUser.emailVerified) {
      const oauthLinks = await prisma.account.count({ where: { userId: existingUser.id } });
      if (oauthLinks > 0) {
        return NextResponse.json(
          {
            error:
              "Questa email è associata a un account non ancora verificato. Accedi con Google oppure dalla pagina di login.",
          },
          { status: 400 }
        );
      }
      await prisma.user.delete({ where: { id: existingUser.id } }).catch(() => {});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailResult = await createAndSendVerificationEmail(email, {
      pendingPasswordHash: hashedPassword,
      pendingName: name || null,
    });
    if (!emailResult.ok) {
      console.error("[signup] verification email failed:", emailResult.error ?? "unknown");
    }

    return NextResponse.json(
      {
        pendingVerification: true,
        ...(emailResult.ok
          ? {}
          : {
              verificationEmailError:
                emailResult.error ??
                "Non siamo riusciti a inviare l’email. Usa «Reinvia» tra un attimo.",
            }),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Errore durante la registrazione:", error);
    const err = error as { code?: string; message?: string };

    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Un utente con questa email esiste già" },
        { status: 400 }
      );
    }

    if (err.code === "P2021" || err.message?.includes("does not exist")) {
      return NextResponse.json(
        {
          error:
            "Il database non ha ancora le tabelle. Esegui dal tuo computer: DATABASE_URL=\"la_tua_url_neon\" npx prisma db push && npm run db:seed",
        },
        { status: 500 }
      );
    }

    if (
      err.message?.includes("connect") ||
      err.message?.includes("database") ||
      err.code === "P1001" ||
      err.code === "P1017"
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
        error: err.message || "Errore durante la registrazione",
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
