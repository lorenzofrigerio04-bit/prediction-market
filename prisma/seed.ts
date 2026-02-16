import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_BADGES } from '../lib/badges';
import { parseOutcomeDateFromText } from '../lib/event-generation/closes-at';
import { getClosureRules } from '../lib/event-generation/config';

const prisma = new PrismaClient();

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
const ADMIN_PASSWORD = 'Admin2025!';

async function main() {
  console.log('🌱 Inizio seed database...');

  // Crea o trova utente admin (con password per login email/password)
  let admin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (!admin) {
    console.log('👤 Creazione utente admin...');
    admin = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: 'Admin',
        role: 'ADMIN',
        credits: 10000,
        password: hashedPassword,
      },
    });
    console.log('✅ Utente admin creato:', admin.email);
  } else if (!admin.password) {
    console.log('👤 Impostazione password per admin esistente...');
    admin = await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });
    console.log('✅ Password admin impostata:', admin.email);
  } else {
    console.log('✅ Utente admin già esistente:', admin.email);
  }

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
        password: null,
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

  // Shop: crea prodotti se non esistono
  const existingShopItems = await prisma.shopItem.count();
  if (existingShopItems === 0) {
    console.log('🛒 Creazione prodotti shop...');
    const shopItems = [
      { name: 'Boost x1.5 (1 giorno)', description: 'Moltiplicatore crediti 1.5x per 24 ore', priceCredits: 100 },
      { name: 'Boost x2 (1 giorno)', description: 'Moltiplicatore crediti 2x per 24 ore', priceCredits: 250 },
      { name: 'Profilo in evidenza (24h)', description: 'Il tuo profilo appare in evidenza nella classifica per 24 ore', priceCredits: 75 },
      { name: 'Badge esclusivo "Early Adopter"', description: 'Sblocca il badge Early Adopter nel profilo', priceCredits: 500 },
    ];
    for (const item of shopItems) {
      await prisma.shopItem.create({
        data: { ...item, active: true },
      });
    }
    console.log(`✅ Creati ${shopItems.length} prodotti shop.`);
  }

  // Missioni: crea se non esistono
  const existingMissions = await prisma.mission.count();
  if (existingMissions === 0) {
    console.log('📋 Creazione missioni...');
    const missions = [
      { name: 'Prevedi 1 evento oggi', description: 'Fai almeno 1 previsione oggi', type: 'MAKE_PREDICTIONS', target: 1, reward: 30, period: 'DAILY', category: null },
      { name: 'Previsioni giornaliere', description: 'Fai 3 previsioni oggi', type: 'MAKE_PREDICTIONS', target: 3, reward: 50, period: 'DAILY', category: null },
      { name: '1 previsione su Tech', description: 'Fai 1 previsione su Tecnologia', type: 'MAKE_PREDICTIONS', target: 1, reward: 30, period: 'DAILY', category: 'Tecnologia' },
      { name: 'Login giornaliero', description: 'Riscatta il bonus giornaliero nel Wallet', type: 'DAILY_LOGIN', target: 1, reward: 25, period: 'DAILY', category: null },
      { name: 'Completa 5 previsioni settimanali', description: 'Fai 5 previsioni questa settimana', type: 'MAKE_PREDICTIONS', target: 5, reward: 100, period: 'WEEKLY', category: null },
      { name: 'Previsioni settimanali', description: 'Fai 10 previsioni questa settimana', type: 'MAKE_PREDICTIONS', target: 10, reward: 150, period: 'WEEKLY', category: null },
      { name: 'Segui 3 categorie', description: 'Segui almeno 3 eventi (anche in categorie diverse)', type: 'FOLLOW_EVENTS', target: 3, reward: 40, period: 'WEEKLY', category: null },
      { name: 'Vincita giornaliera', description: 'Vinci 1 previsione oggi', type: 'WIN_PREDICTIONS', target: 1, reward: 30, period: 'DAILY', category: null },
      { name: 'Vincite settimanali', description: 'Vinci 5 previsioni questa settimana', type: 'WIN_PREDICTIONS', target: 5, reward: 200, period: 'WEEKLY', category: null },
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

  console.log('📅 Creazione eventi (scadenza coerente con data esito)...');
  for (const def of eventDefs) {
    const closesAt = computeClosesAtFromText(def.title, def.description, def.category);
    const event = await prisma.event.create({
      data: {
        title: def.title,
        description: def.description,
        category: def.category,
        closesAt,
        resolutionSourceUrl: 'https://example.com/source',
        resolutionNotes: 'Risoluzione secondo fonte ufficiale alla data di chiusura.',
        createdById: admin.id,
      },
    });
    console.log(`✅ Evento creato: "${event.title}" (chiude il ${event.closesAt.toLocaleDateString('it-IT')})`);
  }

  console.log('🎉 Seed completato con successo!');
  console.log('');
  console.log('🔐 Credenziali admin (login email/password):');
  console.log('   Email:    ', ADMIN_EMAIL);
  console.log('   Password: ', ADMIN_PASSWORD);
  console.log('   (cambia la password in produzione: vedi DEPLOY_AND_BETA.md Fase 6)');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
