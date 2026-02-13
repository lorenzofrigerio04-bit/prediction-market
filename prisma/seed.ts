import { PrismaClient } from '@prisma/client';
import { DEFAULT_BADGES } from '../lib/badges';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inizio seed database...');

  // Crea o trova utente admin
  let admin = await prisma.user.findUnique({
    where: { email: 'admin@predictionmarket.it' },
  });

  if (!admin) {
    console.log('👤 Creazione utente admin...');
    admin = await prisma.user.create({
      data: {
        email: 'admin@predictionmarket.it',
        name: 'Admin',
        role: 'ADMIN',
        credits: 10000,
      },
    });
    console.log('✅ Utente admin creato:', admin.email);
  } else {
    console.log('✅ Utente admin già esistente:', admin.email);
  }

  // Badge: crea se non esistono
  const existingBadges = await prisma.badge.count();
  if (existingBadges === 0) {
    console.log('🏅 Creazione badge...');
    for (const b of DEFAULT_BADGES) {
      await prisma.badge.create({
        data: {
          name: b.name,
          description: b.description,
          icon: b.icon,
          rarity: b.rarity,
          criteria: JSON.stringify(b.criteria),
        },
      });
    }
    console.log(`✅ Creati ${DEFAULT_BADGES.length} badge.`);
  }

  // Missioni: crea se non esistono
  const existingMissions = await prisma.mission.count();
  if (existingMissions === 0) {
    console.log('📋 Creazione missioni...');
    const missions = [
      { name: 'Previsioni giornaliere', description: 'Fai 3 previsioni oggi', type: 'MAKE_PREDICTIONS', target: 3, reward: 50, period: 'DAILY' },
      { name: 'Previsioni settimanali', description: 'Fai 10 previsioni questa settimana', type: 'MAKE_PREDICTIONS', target: 10, reward: 150, period: 'WEEKLY' },
      { name: 'Vincita giornaliera', description: 'Vinci 1 previsione oggi', type: 'WIN_PREDICTIONS', target: 1, reward: 30, period: 'DAILY' },
      { name: 'Vincite settimanali', description: 'Vinci 5 previsioni questa settimana', type: 'WIN_PREDICTIONS', target: 5, reward: 200, period: 'WEEKLY' },
      { name: 'Login giornaliero', description: 'Riscatta il bonus giornaliero', type: 'DAILY_LOGIN', target: 1, reward: 25, period: 'DAILY' },
    ];
    for (const m of missions) {
      await prisma.mission.create({ data: m });
    }
    console.log(`✅ Create ${missions.length} missioni.`);
  }

  // Verifica se gli eventi esistono già
  const existingEvents = await prisma.event.count();
  if (existingEvents >= 3) {
    console.log(`⚠️  Già presenti ${existingEvents} eventi nel database. Saltando creazione eventi.`);
    return;
  }

  // Crea 3 eventi generici
  const now = new Date();
  
  const events = [
    {
      title: 'La Juventus vincerà il prossimo campionato di Serie A?',
      description: 'Previsione sul risultato del campionato italiano di calcio 2024-2025. La Juventus riuscirà a vincere lo scudetto?',
      category: 'Sport',
      closesAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // tra 7 giorni
    },
    {
      title: 'Il prezzo del Bitcoin supererà i 100.000$ entro fine anno?',
      description: 'Previsione sul valore della criptovaluta più famosa. Riuscirà il Bitcoin a raggiungere e superare la soglia dei 100.000 dollari entro il 31 dicembre 2024?',
      category: 'Tecnologia',
      closesAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // tra 14 giorni
    },
    {
      title: 'Ci sarà un nuovo governo entro 6 mesi?',
      description: 'Previsione politica sulla stabilità del governo italiano. Ci sarà un cambio di governo o nuove elezioni nei prossimi 6 mesi?',
      category: 'Politica',
      closesAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // tra 30 giorni
    },
  ];

  console.log('📅 Creazione eventi...');
  for (const eventData of events) {
    const event = await prisma.event.create({
      data: {
        ...eventData,
        createdById: admin.id,
      },
    });
    console.log(`✅ Evento creato: "${event.title}" (chiude il ${event.closesAt.toLocaleDateString('it-IT')})`);
  }

  console.log('🎉 Seed completato con successo!');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
