/**
 * Reimposta la password dell'admin (admin@predictionmarket.it) a Admin123!
 * Usa lo stesso .env/.env.local del dev server così il DB è lo stesso.
 *
 * Uso: npm run reset-admin-password
 */

import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@predictionmarket.it';
const NEW_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin123!';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL non configurato. Verifica .env o .env.local');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const admin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: { id: true, email: true },
    });

    if (!admin) {
      console.error('Utente admin non trovato:', ADMIN_EMAIL);
      console.error('Esegui prima: npm run db:seed');
      process.exit(1);
    }

    const hash = await bcrypt.hash(NEW_PASSWORD, 10);
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hash },
    });

    console.log('✅ Password admin reimpostata.');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', NEW_PASSWORD);
    console.log('   Accedi con queste credenziali e cambiale al primo accesso.');
  } finally {
    await prisma.$disconnect();
  }
}

main();
