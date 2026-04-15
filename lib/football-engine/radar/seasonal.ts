/**
 * Seasonal Intelligence — Football Calendar Awareness
 *
 * Provides context about the current football calendar phase so
 * the BRAIN (especially Creative agent) can generate events that
 * are seasonally appropriate.
 *
 * Football season timeline (European):
 * - Jul-Aug:   Pre-season / Summer transfer window
 * - Sep-Oct:   Early season / Group stages start
 * - Nov-Dec:   Mid-season / European nights
 * - Jan:       Winter break / January transfer window
 * - Feb-Mar:   Title race heating up / KO rounds
 * - Apr-May:   Final stretch / Title deciders / Relegation battles
 * - Jun:       End of season / International breaks
 */

export interface SeasonalContext {
  /** Current calendar phase name */
  phase: string;
  /** Short description for AI context */
  description: string;
  /** Event types that are particularly relevant now */
  hotTopics: string[];
  /** Market angles the Creative agent should emphasize */
  creativeAngles: string[];
  /** Is the transfer window open? */
  transferWindowOpen: boolean;
  /** Is this a finals/decider period? */
  isDeciderPeriod: boolean;
  /** Is there an international break expected soon? */
  internationalBreakSoon: boolean;
}

/**
 * Returns the current seasonal context for the football calendar.
 * Used to inject timing awareness into BRAIN prompts.
 */
export function getSeasonalContext(): SeasonalContext {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed: 0=Jan, 11=Dec
  const day = now.getDate();

  // Summer transfer window: Jun 15 – Aug 31
  const isSummerWindow =
    (month === 5 && day >= 15) || month === 6 || (month === 7 && day <= 31);
  // Winter transfer window: Jan 1 – Jan 31
  const isWinterWindow = month === 0;

  const transferWindowOpen = isSummerWindow || isWinterWindow;

  // Phase determination
  if (month === 6 || (month === 5 && day >= 15)) {
    return {
      phase: "fine_stagione_e_calciomercato_estivo",
      description: "Fine della stagione 2024-25. Il calciomercato estivo è imminente o aperto. I club pianificano le rose, escono voci su trasferimenti, esoneri e rinnovi.",
      hotTopics: ["calciomercato", "fine stagione", "classifiche finali", "playoff", "verdetti"],
      creativeAngles: [
        "Chi verrà esonerato/confermato come allenatore?",
        "Quale grande nome cambierà squadra?",
        "Quante reti segnerà X nella stagione finale?",
        "Chi vincerà il titolo/retrocederà?",
      ],
      transferWindowOpen: isSummerWindow,
      isDeciderPeriod: true,
      internationalBreakSoon: true,
    };
  }

  if (month === 7) {
    return {
      phase: "precampionato",
      description: "Pre-campionato. Le squadre si preparano. Il mercato è aperto, si definiscono le rose. Amichevoli e trofei precampionato.",
      hotTopics: ["presentazioni", "amichevoli", "mercato", "rose", "test precampionato"],
      creativeAngles: [
        "Quale nuovo acquisto si rivelerà il colpo dell'estate?",
        "Quante reti segnerà il nuovo attaccante al primo anno?",
        "Il tecnico sopravviverà alla prima parte di stagione?",
      ],
      transferWindowOpen: true,
      isDeciderPeriod: false,
      internationalBreakSoon: false,
    };
  }

  if (month === 8) {
    return {
      phase: "inizio_stagione",
      description: "Inizio stagione. Prime giornate di campionato e qualificazioni europee. Le gerarchie non sono ancora stabilite. Il mercato chiude a fine agosto.",
      hotTopics: ["inizio campionato", "prime giornate", "mercato in chiusura", "ambientamento"],
      creativeAngles: [
        "Chi partirà forte? Prima sorpresa del campionato?",
        "Il neoacquisto X andrà a segno subito?",
        "Quale squadra retrocessa tornerà immediatamente in Serie A?",
      ],
      transferWindowOpen: day <= 31,
      isDeciderPeriod: false,
      internationalBreakSoon: true,
    };
  }

  if (month === 9 || month === 10) {
    return {
      phase: "autunno_europeo",
      description: "Autunno: campionato nel vivo, fase a gironi Champions/Europa League, prima sosta nazionali passata. Si delineano i valori reali.",
      hotTopics: ["classifica", "Champions League", "Europa League", "infortuni da nazionali", "forma"],
      creativeAngles: [
        "Chi passerà il girone di Champions?",
        "Momento di crisi: quando verrà esonerato l'allenatore X?",
        "Record di gol personale per il bomber X?",
        "Derby cittadino: mood teso = eventi discipline e VAR",
      ],
      transferWindowOpen: false,
      isDeciderPeriod: false,
      internationalBreakSoon: month === 10,
    };
  }

  if (month === 11) {
    return {
      phase: "dicembre_senza_soste",
      description: "Dicembre: mini-tornei natalizi, molte partite ravvicinate. Le squadre risentono di stanchezza e infortuni. Sono in gioco la qualificazione europea e la stabilità degli allenatori.",
      hotTopics: ["turn-over", "infortuni", "stanchezza", "coppa nazionale", "vigilia sosta"],
      creativeAngles: [
        "Turn-over e titolari a riposo: chi scende in campo?",
        "Sarà licenziato qualche allenatore prima di Natale?",
        "Quale squadra soffrirà di più il calendario fitto?",
      ],
      transferWindowOpen: false,
      isDeciderPeriod: false,
      internationalBreakSoon: false,
    };
  }

  if (month === 0) {
    return {
      phase: "mercato_invernale",
      description: "Mercato di gennaio. Le squadre in difficoltà cercano rinforzi, quelle ambiziose completano la rosa. Voci, trattative e colpi di scena ogni giorno.",
      hotTopics: ["mercato", "rinforzi", "gennaio", "trattative", "prestiti"],
      creativeAngles: [
        "Chi arriverà entro la chiusura del mercato?",
        "Il nuovo acquisto di gennaio debutterà subito?",
        "Quante cessioni farà il club X entro il 31 gennaio?",
        "Svolta di stagione dopo il mercato?",
      ],
      transferWindowOpen: true,
      isDeciderPeriod: false,
      internationalBreakSoon: false,
    };
  }

  if (month === 1) {
    return {
      phase: "post_mercato_inverno",
      description: "Febbraio: mercato chiuso, rose definitive. Iniziano i playoff di Champions/Europa. La stagione entra nel vivo.",
      hotTopics: ["playoff europei", "newcomer di gennaio", "testa a testa", "fuga in classifica"],
      creativeAngles: [
        "Il club X eliminerà il gigante europeo nei playoff?",
        "L'acquisto di gennaio cambierà le sorti della squadra?",
        "Chi si qualificherà agli ottavi di Champions?",
      ],
      transferWindowOpen: false,
      isDeciderPeriod: false,
      internationalBreakSoon: false,
    };
  }

  if (month === 2) {
    return {
      phase: "ottavi_e_rimonta",
      description: "Marzo: ottavi di Champions/Europa, campionato nel clou. Si preparano le rimonte. Soste nazionali a metà mese.",
      hotTopics: ["ottavi Champions", "rimonte", "nazionali", "squalifiche accumulate"],
      creativeAngles: [
        "Sarà ribaltamento storico? Rimonta da 2-0?",
        "Chi tornerà dagli infortuni/squalifiche nelle prossime settimane?",
        "Quanti goal segnerà X nei quarti?",
      ],
      transferWindowOpen: false,
      isDeciderPeriod: false,
      internationalBreakSoon: true,
    };
  }

  // month === 3 (April) or month === 4 (May)
  return {
    phase: "volata_finale",
    description: `${month === 3 ? "Aprile" : "Maggio"}: rettilineo finale di stagione. Il titolo, la Champions e la salvezza si decidono adesso. Ogni punto conta. Pressione massima su allenatori e calciatori. Quarti/Semifinali europee.`,
    hotTopics: [
      "lotta scudetto",
      "lotta salvezza",
      "quarti/semifinali Champions",
      "panchine a rischio",
      "gol pesanti",
      "record individuali",
    ],
    creativeAngles: [
      "Chi vincerà lo scudetto/retrocederà alla penultima giornata?",
      "Il bomber X raggiungerà i 20 gol stagionali?",
      "Verrà esonerato il tecnico se perde le prossime 2?",
      "Quante giornate mancano al matematico: titolo/retrocessione/salvezza?",
      "La squadra X passerà in semifinale Champions?",
      "Rissa/espulsione nel derby d'Italia?",
    ],
    transferWindowOpen: false,
    isDeciderPeriod: true,
    internationalBreakSoon: month === 3,
  };
}

/**
 * Convert seasonal context to a compact 2-3 line string for LLM prompts.
 * Kept short intentionally — this is injected into every Creative call.
 */
export function seasonalContextToString(ctx: SeasonalContext): string {
  const flags = [
    ctx.transferWindowOpen ? "⚠️ MERCATO APERTO — trasferimenti ad alta priorità" : null,
    ctx.isDeciderPeriod ? "🔥 PERIODO DECISIVO — ogni partita vale multiplo" : null,
    ctx.internationalBreakSoon ? "📅 Sosta nazionali imminente" : null,
  ].filter(Boolean);

  return [
    `### Fase Stagionale: ${ctx.phase.replace(/_/g, " ").toUpperCase()}`,
    ctx.description,
    flags.length ? flags.join(" | ") : "",
    `Hot topics: ${ctx.hotTopics.join(", ")}`,
    `Angolazioni creative: ${ctx.creativeAngles.slice(0, 4).join(" / ")}`,
  ].filter(Boolean).join("\n");
}
