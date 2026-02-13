import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
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

    // Crea l'utente
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        credits: 1000, // crediti iniziali
      },
    });

    return NextResponse.json(
      {
        message: "Utente creato con successo",
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
    
    // Gestione errori più specifica
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Un utente con questa email esiste già" },
        { status: 400 }
      );
    }
    
    if (error.message?.includes("connect") || error.message?.includes("database")) {
      return NextResponse.json(
        { error: "Errore di connessione al database. Verifica che il database sia configurato correttamente." },
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
