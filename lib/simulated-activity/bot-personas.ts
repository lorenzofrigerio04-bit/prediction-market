/**
 * Personas per commenti bot iper-realistici nel feed eventi.
 * Ogni persona ha uno stile (finanza, sport, tech, politica) e pool di frasi
 * che invitano all'interazione (domande, opinioni, inviti al dibattito).
 */

export type PersonaId = "finanza" | "sport" | "tech" | "politica" | "generico";

export interface BotPersona {
  id: PersonaId;
  /** Categorie evento in cui questa persona è credibile (opzionale = tutte). */
  categories?: string[];
  /** Frasi engagement-oriented: domande, "Secondo voi?", opinioni che spingono a commentare. */
  templates: { text: string; category?: string }[];
}

/** Personaggi: stile professionale (finanza), leggero (sport), curioso (tech), analitico (politica), generico. */
export const BOT_PERSONAS: BotPersona[] = [
  {
    id: "finanza",
    categories: ["Economia", "Finanza"],
    templates: [
      { text: "I numeri sono chiari: da tenere in portafoglio. Secondo voi il mercato reagirà in tempo utile?", category: "Economia" },
      { text: "Sviluppo importante per chi segue i mercati. Qualcuno ha già preso posizione?", category: "Economia" },
      { text: "Notizia da non sottovalutare. Le prossime sedute saranno decisive — voi che ne pensate?", category: "Economia" },
      { text: "Impatto potenziale su più asset. Vale la pena seguirla da vicino. Concordate?", category: "Economia" },
      { text: "Da monitorare con attenzione. Secondo voi è già priced in o c'è ancora margine?", category: "Economia" },
      { text: "Situazione delicata. I professionisti stanno già discutendo — e voi?", category: "Economia" },
    ],
  },
  {
    id: "sport",
    categories: ["Sport", "Calcio"],
    templates: [
      { text: "Questa la scommetto io. Chi è con me?", category: "Sport" },
      { text: "Partita da non perdere, letteralmente. Secondo voi come va a finire?", category: "Sport" },
      { text: "Grande occasione per fare punti (anche qui). Voi ci credete?", category: "Sport" },
      { text: "Se non è questa la volta... Scherzi a parte, cosa ne pensate?", category: "Sport" },
      { text: "Da tifosi: speriamo bene. E da scommettitori?", category: "Sport" },
      { text: "Classico da non perdere. Previsioni?", category: "Sport" },
    ],
  },
  {
    id: "tech",
    categories: ["Tecnologia"],
    templates: [
      { text: "Sviluppi interessanti. Secondo voi è il trend del momento o passa?", category: "Tecnologia" },
      { text: "Da vedere come evolve. Chi segue il settore che ne dice?", category: "Tecnologia" },
      { text: "Questo può cambiare parecchie cose. Voi ci scommettete?", category: "Tecnologia" },
      { text: "Notizia grossa per chi segue tech. Le aspettative sono alte — e voi?", category: "Tecnologia" },
      { text: "Curioso vedere la reazione del mercato e della community. Idee?", category: "Tecnologia" },
      { text: "Da tenere d'occhio. Qualcuno ha già un'opinione forte?", category: "Tecnologia" },
    ],
  },
  {
    id: "politica",
    categories: ["Politica"],
    templates: [
      { text: "Situazione da monitorare. Staremo a vedere gli sviluppi — e voi?", category: "Politica" },
      { text: "Svolta importante. Secondo voi è già decisa o c'è ancora da giocare?", category: "Politica" },
      { text: "Notizia che fa discutere. Qual è la vostra lettura?", category: "Politica" },
      { text: "Da seguire con attenzione. Le prossime ore saranno decisive. Concordate?", category: "Politica" },
      { text: "Tema caldo. Vale la pena scommettere o meglio aspettare? Opinioni?", category: "Politica" },
      { text: "Situazione fluida. Chi ha già preso posizione?", category: "Politica" },
    ],
  },
  {
    id: "generico",
    templates: [
      { text: "Da seguire. Secondo voi come va a finire?" },
      { text: "Interessante. Voi che ne pensate?" },
      { text: "Vediamo come va. Qualcuno ci scommette?" },
      { text: "Curioso. Vale la pena tenere d'occhio — concordate?" },
      { text: "Da tenere d'occhio. Le vostre previsioni?" },
      { text: "Secondo me vale la pena seguirla. E voi?" },
      { text: "Notizia da non perdere. Idee?" },
      { text: "Situazione da monitorare. Chi ha un'opinione?" },
    ],
  },
];

const PERSONA_IDS: PersonaId[] = ["finanza", "sport", "tech", "politica", "generico"];

/**
 * Restituisce la persona per un bot dato il suo indice (0-based) nella lista bot.
 * Round-robin sulle persone per varietà.
 */
export function getPersonaForBotIndex(botIndex: number): BotPersona {
  const id = PERSONA_IDS[botIndex % PERSONA_IDS.length];
  return BOT_PERSONAS.find((p) => p.id === id) ?? BOT_PERSONAS[BOT_PERSONAS.length - 1];
}

/**
 * Sceglie un template di commento per un post: persona del bot + categoria evento.
 * Se la persona ha template per quella categoria li usa, altrimenti template generici della persona o fallback generico.
 */
export function pickCommentTemplate(
  persona: BotPersona,
  eventCategory: string | null
): string {
  const category = (eventCategory ?? "").trim();
  const withCategory = category
    ? persona.templates.filter((t) => !t.category || t.category === category)
    : persona.templates.filter((t) => !t.category);
  const pool = withCategory.length > 0 ? withCategory : persona.templates;
  const template = pool[Math.floor(Math.random() * pool.length)];
  return template.text;
}
