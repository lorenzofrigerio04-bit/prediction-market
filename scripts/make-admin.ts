import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script per promuovere un utente ad admin
 * 
 * Uso:
 *   npx tsx scripts/make-admin.ts <email>
 * 
 * Esempio:
 *   npx tsx scripts/make-admin.ts user@example.com
 */

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ Utente con email "${email}" non trovato`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`ℹ️  L'utente "${email}" è già admin`);
      process.exit(0);
    }

    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Utente "${email}" promosso ad admin con successo!`);
    console.log(`   Nome: ${user.name || "N/A"}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Ruolo: ADMIN`);
  } catch (error) {
    console.error("❌ Errore:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Prendi l'email dagli argomenti della riga di comando
const email = process.argv[2];

if (!email) {
  console.error("❌ Errore: Devi fornire un'email");
  console.log("\nUso: npx tsx scripts/make-admin.ts <email>");
  console.log("Esempio: npx tsx scripts/make-admin.ts user@example.com");
  process.exit(1);
}

makeAdmin(email);
