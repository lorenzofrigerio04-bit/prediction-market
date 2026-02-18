import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_BADGES } from '../lib/badges';
import { parseOutcomeDateFromText } from '../lib/event-generation/closes-at';
import { getClosureRules } from '../lib/event-generation/config';
import { computeDedupKey } from '../lib/event-publishing/dedup';

const prisma = new PrismaClient();

/** Password iniziale per l'admin (cambia in produzione). Puoi usare ADMIN_DEFAULT_PASSWORD in .env */
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin123!';

/**
 * Calcola closesAt coerente con la data esito dell'evento (titolo + descrizione).
 * Se nel testo c'è una data esito (es. "fine 2025", "entro 6 mesi"), closesAt = data esito - ore prima.
 * Altrimenti usa il default per categoria (giorni) in modo deterministico, non random.
 */
function computeClosesAtFromText(
  title: string,
  description: string,
  category: string
): Date {
  const text = `${title} ${description}`.trim();
  const outcomeDate = parseOutcomeDateFromText(text);
  const rules = getClosureRules();
  const now = new Date();

  if (outcomeDate && outcomeDate.getTime() > now.getTime()) {
    const closeAt = new Date(
      outcomeDate.getTime() - rules.hoursBeforeEvent * 60 * 60 * 1000
    );
    const minClose = new Date(
      now.getTime() + rules.minHoursFromNow * 60 * 60 * 1000
    );
    return closeAt.getTime() >= minClose.getTime() ? closeAt : minClose;
  }

  const defaultDays =
    (rules.defaultDaysByCategory as Record<string, number>)[category] ??
    rules.mediumTermDays;
  return new Date(
    now.getTime() + defaultDays * 24 * 60 * 60 * 1000
  );
}

  // Credenziali admin (cambia in produzione! vedi DEPLOY_AND_BETA.md Fase 6)
const ADMIN_EMAIL = 'admin@predictionmarket.it';

async function main() {
  console.log('🌱 Inizio seed database...');

  // Crea o trova utente admin
  let admin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  const adminPasswordHash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 10);

  if (!admin) {
    console.log('👤 Creazione utente admin...');
    admin = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: 'Admin',
        role: 'ADMIN',
        password: adminPasswordHash,
        credits: 10000,
      },
    });
    console.log('✅ Utente admin creato:', admin.email);
  } else {
    // Assicurati che l'admin abbia il ruolo corretto e una password per il login
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        role: 'ADMIN',
        password: adminPasswordHash,
      },
    });
    console.log('✅ Utente admin già esistente; password aggiornata per il login:', admin.email);
  }
  console.log('   Password admin (cambiala al primo accesso):', ADMIN_DEFAULT_PASSWORD);

  // Utente "sistema" per creazione eventi generati (pipeline/cron). Nessun login.
  const SYSTEM_USER_EMAIL = 'event-generator@system';
  let systemUser = await prisma.user.findUnique({
    where: { email: SYSTEM_USER_EMAIL },
  });
  if (!systemUser) {
    console.log('🤖 Creazione utente sistema (event-generator)...');
    systemUser = await prisma.user.create({
      data: {
        email: SYSTEM_USER_EMAIL,
        name: 'Event Generator (Sistema)',
        role: 'USER',
        credits: 0,
      },
    });
    console.log('✅ Utente sistema creato:', systemUser.email, '| id:', systemUser.id);
    console.log('   Aggiungi in .env.local: EVENT_GENERATOR_USER_ID=' + systemUser.id);
  } else {
    console.log('✅ Utente sistema già esistente:', systemUser.email, '| id:', systemUser.id);
  }

  // Bot simulazione: crea o recupera N bot (email bot-{i}@simulation.internal, role BOT)
  const { getOrCreateBotUsers } = await import('../lib/simulated-activity/bot-users');
  const botCount = 20;
  const bots = await getOrCreateBotUsers(prisma, botCount);
  console.log(`✅ Bot simulazione: ${bots.length} disponibili (es. ${bots[0]?.email ?? 'bot-1@simulation.internal'})`);

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

  // Missioni di default (daily + weekly)
  const missionCount = await prisma.mission.count();
  if (missionCount === 0) {
    const missions = [
      { name: 'Fai 3 previsioni', description: 'Completa 3 previsioni oggi', type: 'MAKE_PREDICTIONS', target: 3, reward: 30, period: 'DAILY' as const },
      { name: 'Accedi oggi', description: 'Fai login per mantenere la serie', type: 'DAILY_LOGIN', target: 1, reward: 10, period: 'DAILY' as const },
      { name: '5 previsioni nella settimana', description: 'Completa 5 previsioni questa settimana', type: 'MAKE_PREDICTIONS', target: 5, reward: 80, period: 'WEEKLY' as const },
    ];
    for (const m of missions) {
      await prisma.mission.create({ data: m });
    }
    console.log(`✅ Create ${missions.length} missioni di default.`);
  }

  // Shop: prodotti esempio (solo crediti virtuali)
  const shopCount = await prisma.shopItem.count();
  if (shopCount === 0) {
    await prisma.shopItem.createMany({
      data: [
        { name: 'Pacchetto 50 crediti', type: 'CREDIT_BUNDLE', priceCredits: 0, description: 'Omaggio iniziale (non in vendita)', active: false },
        { name: 'Badge esclusivo', type: 'COSMETIC', priceCredits: 200, description: 'Sblocca un badge profilo speciale', active: true },
        { name: 'Biglietto evento', type: 'TICKET', priceCredits: 100, description: 'Accesso a evento a premi', active: true },
      ],
    });
    console.log('✅ Creati prodotti shop di esempio.');
  }

  // Verifica se gli eventi esistono già
  const existingEvents = await prisma.event.count();
  if (existingEvents >= 3) {
    console.log(`⚠️  Già presenti ${existingEvents} eventi nel database. Saltando creazione eventi.`);
    return;
  }

  // Crea 3 eventi con scadenza coerente alla data esito (titolo/descrizione)
  const eventDefs = [
    {
      title: 'La Juventus vincerà il prossimo campionato di Serie A?',
      description:
        'Previsione sul risultato del campionato italiano di calcio 2024-2025. La Juventus riuscirà a vincere lo scudetto? Esito verificabile a fine maggio 2025.',
      category: 'Sport',
    },
    {
      title: 'Il prezzo del Bitcoin supererà i 100.000$ entro fine anno?',
      description:
        'Previsione sul valore della criptovaluta. Riuscirà il Bitcoin a superare i 100.000 dollari entro la fine del 2025? Fonte: exchange principali.',
      category: 'Tecnologia',
    },
    {
      title: 'Ci sarà un nuovo governo entro 6 mesi?',
      description:
        'Previsione politica sulla stabilità del governo italiano. Ci sarà un cambio di governo o nuove elezioni entro 6 mesi?',
      category: 'Politica',
    },
  ];

  const seedAuthorityHost = 'seed.example.com';
  console.log('📅 Creazione eventi (scadenza coerente con data esito)...');
  for (const def of eventDefs) {
    const closesAt = computeClosesAtFromText(def.title, def.description, def.category);
    const dedupKey = computeDedupKey({
      title: def.title,
      closesAt,
      resolutionAuthorityHost: seedAuthorityHost,
    });
    const event = await prisma.event.create({
      data: {
        title: def.title,
        description: def.description,
        category: def.category,
        closesAt,
        b: 100,
        resolutionSourceUrl: 'https://example.com/source',
        resolutionNotes: 'Risoluzione secondo fonte ufficiale alla data di chiusura.',
        createdById: admin.id,
        dedupKey,
        resolutionAuthorityHost: seedAuthorityHost,
      },
    });
    console.log(`✅ Evento creato: "${event.title}" (chiude il ${event.closesAt.toLocaleDateString('it-IT')})`);
  }

  console.log('🎉 Seed completato con successo!');
  console.log('');
  console.log('👤 Utente admin creato:');
  console.log('   Email:    ', ADMIN_EMAIL);
  console.log('   Ruolo:    ADMIN');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
