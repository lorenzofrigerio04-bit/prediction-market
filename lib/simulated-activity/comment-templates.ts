/**
 * Template di commenti simulati in italiano.
 * Frasi plausibili per opinioni SÌ/NO, domande e risposte brevi, per categoria.
 */

export interface CommentTemplate {
  text: string;
  /** Categoria evento (Sport, Tecnologia, Politica, ecc.). Se assente, usabile per qualsiasi categoria. */
  category?: string;
  /** Tipo: opinione a favore SÌ, contraria NO, domanda, risposta breve. */
  kind?: "yes" | "no" | "question" | "reply";
}

export const COMMENT_TEMPLATES: CommentTemplate[] = [
  // Generici (nessuna category)
  { text: "Secondo me le quote riflettono bene il rischio.", kind: "yes" },
  { text: "Non sono d'accordo, vedo più probabile il NO.", kind: "no" },
  { text: "Chi vince secondo voi?", kind: "question" },
  { text: "Interessante, non ci avevo pensato.", kind: "reply" },
  { text: "Sono abbastanza sicuro del SÌ.", kind: "yes" },
  { text: "Il NO ha più senso dati i fatti.", kind: "no" },
  { text: "Quali fonti usate per stimare?", kind: "question" },
  { text: "Concordo, le quote sono ragionevoli.", kind: "reply" },
  { text: "Scommetto sul SÌ, le probabilità mi convincono.", kind: "yes" },
  { text: "Secondo me il mercato sopravvaluta il SÌ.", kind: "no" },
  { text: "Avete visto gli ultimi aggiornamenti?", kind: "question" },
  { text: "Bella analisi.", kind: "reply" },
  { text: "Le quote mi sembrano equilibrate.", kind: "yes" },
  { text: "Io punterei sul NO.", kind: "no" },
  { text: "Come calcolate la probabilità?", kind: "question" },
  { text: "Sono d'accordo con te.", kind: "reply" },

  // Sport
  { text: "Secondo me vince il SÌ, la squadra è in forma.", category: "Sport", kind: "yes" },
  { text: "Il NO è più probabile, infortuni di mezzo.", category: "Sport", kind: "no" },
  { text: "Chi vince secondo voi?", category: "Sport", kind: "question" },
  { text: "Le quote riflettono bene la forma attuale.", category: "Sport", kind: "reply" },
  { text: "SÌ per me, i pronostici sono dalla nostra parte.", category: "Sport", kind: "yes" },
  { text: "Vedo più probabile il NO in questo caso.", category: "Sport", kind: "no" },
  { text: "Avete visto le ultime prestazioni?", category: "Sport", kind: "question" },
  { text: "Concordo, dipende molto dall'arbitro.", category: "Sport", kind: "reply" },

  // Tecnologia
  { text: "Secondo me il SÌ è più probabile, il prodotto è solido.", category: "Tecnologia", kind: "yes" },
  { text: "Il NO ha senso, troppi ritardi già visti.", category: "Tecnologia", kind: "no" },
  { text: "Quali fonti tecniche usate?", category: "Tecnologia", kind: "question" },
  { text: "Le quote mi sembrano in linea con il mercato.", category: "Tecnologia", kind: "reply" },
  { text: "SÌ, le release recenti sono promettenti.", category: "Tecnologia", kind: "yes" },
  { text: "Vedo più rischi del NO, troppa incertezza.", category: "Tecnologia", kind: "no" },
  { text: "Avete considerato i competitor?", category: "Tecnologia", kind: "question" },
  { text: "Ottimo punto, non ci avevo pensato.", category: "Tecnologia", kind: "reply" },

  // Politica
  { text: "Secondo me il SÌ vince, i sondaggi danno fiducia.", category: "Politica", kind: "yes" },
  { text: "Il NO è più plausibile, troppa volatilità.", category: "Politica", kind: "no" },
  { text: "Chi vince secondo voi?", category: "Politica", kind: "question" },
  { text: "Le quote riflettono bene l'incertezza.", category: "Politica", kind: "reply" },
  { text: "SÌ per me, la coalizione tiene.", category: "Politica", kind: "yes" },
  { text: "Vedo più probabile il NO, situazione fluida.", category: "Politica", kind: "no" },
  { text: "Avete visto gli ultimi sviluppi?", category: "Politica", kind: "question" },
  { text: "Concordo, dipende dai prossimi giorni.", category: "Politica", kind: "reply" },

  // Economia / Finanza (se usi questa categoria)
  { text: "Le quote mi sembrano in linea con i mercati.", category: "Economia", kind: "yes" },
  { text: "Il NO è sottovalutato secondo me.", category: "Economia", kind: "no" },
  { text: "Quali indicatori considerate?", category: "Economia", kind: "question" },
  { text: "Interessante analisi.", category: "Economia", kind: "reply" },

  // Cultura / Intrattenimento
  { text: "SÌ per me, il trend è chiaro.", category: "Cultura", kind: "yes" },
  { text: "Vedo più probabile il NO.", category: "Cultura", kind: "no" },
  { text: "Chi vince secondo voi?", category: "Cultura", kind: "question" },
  { text: "Sono d'accordo.", category: "Cultura", kind: "reply" },
];

/** Probabilità (0–1) di usare un commento come risposta (parentId) in runSimulatedComments. */
export const REPLY_PROBABILITY = 0.3;
