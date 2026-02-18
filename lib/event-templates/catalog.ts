/**
 * Event Template Catalog
 * BLOCCO 4: Template Engine
 * 
 * 35 template totali: 5 per categoria
 * Ogni template è binario e non ambiguo
 */

import type { EventTemplate } from './types';
import type { TemplateContext } from './context';

// ============================================================================
// SPORT (5 template)
// ============================================================================

const SPORT_TEMPLATES: EventTemplate[] = [
  {
    id: 'sport-1-official-announcement',
    category: 'Sport',
    horizonDaysMin: 1,
    horizonDaysMax: 30,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicato un comunicato ufficiale su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')} riguardo ${ctx.topic || ctx.entityA || 'questo evento'}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'sport-2-match-result',
    category: 'Sport',
    horizonDaysMin: 1,
    horizonDaysMax: 7,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA && ctx.entityB) {
        return `${ctx.entityA} batterà ${ctx.entityB} nella partita entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `L'evento sportivo avrà esito positivo entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Risultato positivo verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Risultato negativo o non verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo'],
  },
  {
    id: 'sport-3-transfer-announcement',
    category: 'Sport',
    horizonDaysMin: 3,
    horizonDaysMax: 60,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA && ctx.entityB) {
        return `Sarà annunciato il trasferimento di ${ctx.entityA} a ${ctx.entityB} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà annunciato un trasferimento rilevante entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Trasferimento annunciato ufficialmente entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun trasferimento annunciato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'sport-4-record-break',
    category: 'Sport',
    horizonDaysMin: 1,
    horizonDaysMax: 90,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA && ctx.topic) {
        return `${ctx.entityA} stabilirà un nuovo record in ${ctx.topic} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà stabilito un nuovo record entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Nuovo record stabilito e verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun nuovo record stabilito entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo'],
  },
  {
    id: 'sport-5-official-decision',
    category: 'Sport',
    horizonDaysMin: 7,
    horizonDaysMax: 90,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicata una decisione ufficiale su ${ctx.authorityHost} riguardo ${ctx.topic || ctx.entityA || 'questo evento'} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Decisione ufficiale pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessuna decisione ufficiale pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
];

// ============================================================================
// POLITICA (5 template)
// ============================================================================

const POLITICA_TEMPLATES: EventTemplate[] = [
  {
    id: 'politica-1-official-announcement',
    category: 'Politica',
    horizonDaysMin: 1,
    horizonDaysMax: 30,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicato un comunicato ufficiale su ${ctx.authorityHost} riguardo ${ctx.topic || ctx.entityA || 'questo evento'} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante', 'shock', 'risi', 'scandalo'],
  },
  {
    id: 'politica-2-delibera-published',
    category: 'Politica',
    horizonDaysMin: 7,
    horizonDaysMax: 90,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicata una delibera su ${ctx.authorityHost} riguardo ${ctx.topic || ctx.entityA || 'questo evento'} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Delibera pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessuna delibera pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante', 'shock', 'risi', 'scandalo'],
  },
  {
    id: 'politica-3-election-result',
    category: 'Politica',
    horizonDaysMin: 1,
    horizonDaysMax: 365,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => {
      if (ctx.entityA && ctx.topic) {
        return `${ctx.entityA} vincerà ${ctx.topic} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `L'esito elettorale sarà positivo entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Esito elettorale verificato e pubblicato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Esito elettorale negativo o non verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'politica-4-law-published',
    category: 'Politica',
    horizonDaysMin: 30,
    horizonDaysMax: 365,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicata una legge o decreto su ${ctx.authorityHost} riguardo ${ctx.topic || ctx.entityA || 'questo evento'} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Legge o decreto pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessuna legge o decreto pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante', 'shock', 'risi', 'scandalo'],
  },
  {
    id: 'politica-5-official-confirmation',
    category: 'Politica',
    horizonDaysMin: 1,
    horizonDaysMax: 30,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => {
      if (ctx.entityA) {
        return `Sarà confermato ufficialmente ${ctx.entityA} su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà confermato ufficialmente questo evento su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Conferma ufficiale pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessuna conferma ufficiale pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
];

// ============================================================================
// ECONOMIA (5 template)
// ============================================================================

const ECONOMIA_TEMPLATES: EventTemplate[] = [
  {
    id: 'economia-1-official-report',
    category: 'Economia',
    horizonDaysMin: 7,
    horizonDaysMax: 90,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicato un report ufficiale su ${ctx.authorityHost} riguardo ${ctx.topic || ctx.entityA || 'questo evento'} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Report ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun report ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante', 'shock', 'risi'],
  },
  {
    id: 'economia-2-threshold-number',
    category: 'Economia',
    horizonDaysMin: 1,
    horizonDaysMax: 90,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.topic && ctx.entityA) {
        return `${ctx.topic} supererà ${ctx.entityA} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Il valore supererà la soglia indicata entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Valore supera soglia verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Valore non supera soglia entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'economia-3-decision-published',
    category: 'Economia',
    horizonDaysMin: 7,
    horizonDaysMax: 90,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicata una decisione su ${ctx.authorityHost} riguardo ${ctx.topic || ctx.entityA || 'questo evento'} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Decisione pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessuna decisione pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante', 'shock', 'risi'],
  },
  {
    id: 'economia-4-official-announcement',
    category: 'Economia',
    horizonDaysMin: 1,
    horizonDaysMax: 30,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicato un comunicato ufficiale su ${ctx.authorityHost} riguardo ${ctx.topic || ctx.entityA || 'questo evento'} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante', 'shock', 'risi'],
  },
  {
    id: 'economia-5-confirmation',
    category: 'Economia',
    horizonDaysMin: 1,
    horizonDaysMax: 30,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA) {
        return `Sarà confermato ${ctx.entityA} su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà confermato questo evento su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Conferma pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessuna conferma pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
];

// ============================================================================
// TECNOLOGIA (5 template)
// ============================================================================

const TECNOLOGIA_TEMPLATES: EventTemplate[] = [
  {
    id: 'tecnologia-1-product-launch',
    category: 'Tecnologia',
    horizonDaysMin: 7,
    horizonDaysMax: 180,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA) {
        return `${ctx.entityA} lancerà il prodotto entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà lanciato il prodotto annunciato entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Prodotto lanciato e verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Prodotto non lanciato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'tecnologia-2-official-announcement',
    category: 'Tecnologia',
    horizonDaysMin: 1,
    horizonDaysMax: 90,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicato un comunicato ufficiale su ${ctx.authorityHost} riguardo ${ctx.topic || ctx.entityA || 'questo evento'} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'tecnologia-3-feature-release',
    category: 'Tecnologia',
    horizonDaysMin: 7,
    horizonDaysMax: 180,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA && ctx.topic) {
        return `${ctx.entityA} rilascerà ${ctx.topic} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà rilasciata la funzionalità annunciata entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Funzionalità rilasciata e verificata entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Funzionalità non rilasciata entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'tecnologia-4-threshold-number',
    category: 'Tecnologia',
    horizonDaysMin: 1,
    horizonDaysMax: 90,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.topic && ctx.entityA) {
        return `${ctx.topic} supererà ${ctx.entityA} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Il valore supererà la soglia indicata entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Valore supera soglia verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Valore non supera soglia entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'tecnologia-5-confirmation',
    category: 'Tecnologia',
    horizonDaysMin: 1,
    horizonDaysMax: 30,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA) {
        return `Sarà confermato ${ctx.entityA} su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà confermato questo evento su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Conferma pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessuna conferma pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
];

// ============================================================================
// CULTURA (5 template)
// ============================================================================

const CULTURA_TEMPLATES: EventTemplate[] = [
  {
    id: 'cultura-1-event-scheduled',
    category: 'Cultura',
    horizonDaysMin: 7,
    horizonDaysMax: 180,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA && ctx.topic) {
        return `${ctx.entityA} si terrà ${ctx.topic} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `L'evento culturale si terrà entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Evento culturale verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Evento culturale non verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'cultura-2-official-announcement',
    category: 'Cultura',
    horizonDaysMin: 1,
    horizonDaysMax: 90,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicato un comunicato ufficiale su ${ctx.authorityHost} riguardo ${ctx.topic || ctx.entityA || 'questo evento'} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'cultura-3-award-announcement',
    category: 'Cultura',
    horizonDaysMin: 7,
    horizonDaysMax: 180,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA && ctx.topic) {
        return `${ctx.entityA} vincerà ${ctx.topic} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà annunciato il vincitore entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Vincitore annunciato e verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun vincitore annunciato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'cultura-4-release-date',
    category: 'Cultura',
    horizonDaysMin: 7,
    horizonDaysMax: 180,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA) {
        return `${ctx.entityA} sarà rilasciato entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Il contenuto culturale sarà rilasciato entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Contenuto rilasciato e verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Contenuto non rilasciato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'cultura-5-confirmation',
    category: 'Cultura',
    horizonDaysMin: 1,
    horizonDaysMax: 30,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA) {
        return `Sarà confermato ${ctx.entityA} su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà confermato questo evento su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Conferma pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessuna conferma pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
];

// ============================================================================
// SCIENZA (5 template)
// ============================================================================

const SCIENZA_TEMPLATES: EventTemplate[] = [
  {
    id: 'scienza-1-study-published',
    category: 'Scienza',
    horizonDaysMin: 30,
    horizonDaysMax: 365,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.topic) {
        return `Sarà pubblicato uno studio peer-reviewed riguardo ${ctx.topic} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà pubblicato uno studio peer-reviewed entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Studio peer-reviewed pubblicato e verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun studio peer-reviewed pubblicato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'scienza-2-official-announcement',
    category: 'Scienza',
    horizonDaysMin: 1,
    horizonDaysMax: 90,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicato un comunicato ufficiale su ${ctx.authorityHost} riguardo ${ctx.topic || ctx.entityA || 'questo evento'} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'scienza-3-discovery-confirmed',
    category: 'Scienza',
    horizonDaysMin: 7,
    horizonDaysMax: 365,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.topic) {
        return `Sarà confermata la scoperta riguardo ${ctx.topic} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà confermata la scoperta annunciata entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Scoperta confermata e verificata entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Scoperta non confermata entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'scienza-4-threshold-number',
    category: 'Scienza',
    horizonDaysMin: 1,
    horizonDaysMax: 90,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.topic && ctx.entityA) {
        return `${ctx.topic} supererà ${ctx.entityA} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Il valore supererà la soglia indicata entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Valore supera soglia verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Valore non supera soglia entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'scienza-5-mission-result',
    category: 'Scienza',
    horizonDaysMin: 7,
    horizonDaysMax: 365,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA && ctx.topic) {
        return `${ctx.entityA} completerà ${ctx.topic} con successo entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `La missione scientifica avrà successo entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Missione completata con successo verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Missione non completata o fallita entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
];

// ============================================================================
// INTRATTENIMENTO (5 template)
// ============================================================================

const INTRATTENIMENTO_TEMPLATES: EventTemplate[] = [
  {
    id: 'intrattenimento-1-release-date',
    category: 'Intrattenimento',
    horizonDaysMin: 7,
    horizonDaysMax: 180,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA) {
        return `${ctx.entityA} sarà rilasciato entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Il contenuto sarà rilasciato entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Contenuto rilasciato e verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Contenuto non rilasciato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'intrattenimento-2-event-scheduled',
    category: 'Intrattenimento',
    horizonDaysMin: 7,
    horizonDaysMax: 180,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA && ctx.topic) {
        return `${ctx.entityA} si terrà ${ctx.topic} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `L'evento si terrà entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Evento verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Evento non verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'intrattenimento-3-award-announcement',
    category: 'Intrattenimento',
    horizonDaysMin: 7,
    horizonDaysMax: 180,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA && ctx.topic) {
        return `${ctx.entityA} vincerà ${ctx.topic} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà annunciato il vincitore entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Vincitore annunciato e verificato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun vincitore annunciato entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'intrattenimento-4-official-announcement',
    category: 'Intrattenimento',
    horizonDaysMin: 1,
    horizonDaysMax: 90,
    requiredAuthority: 'OFFICIAL',
    question: (ctx) => `Sarà pubblicato un comunicato ufficiale su ${ctx.authorityHost} riguardo ${ctx.topic || ctx.entityA || 'questo evento'} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`,
    resolutionCriteria: (ctx) => ({
      yes: `Comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessun comunicato ufficiale pubblicato su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
  {
    id: 'intrattenimento-5-confirmation',
    category: 'Intrattenimento',
    horizonDaysMin: 1,
    horizonDaysMax: 30,
    requiredAuthority: 'REPUTABLE',
    question: (ctx) => {
      if (ctx.entityA) {
        return `Sarà confermato ${ctx.entityA} su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
      }
      return `Sarà confermato questo evento su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}?`;
    },
    resolutionCriteria: (ctx) => ({
      yes: `Conferma pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
      no: `Nessuna conferma pubblicata su ${ctx.authorityHost} entro ${ctx.closesAt.toLocaleDateString('it-IT')}`,
    }),
    bannedPhrases: ['probabile', 'significativo', 'importante'],
  },
];

// ============================================================================
// EXPORT CATALOG
// ============================================================================

export const TEMPLATE_CATALOG: EventTemplate[] = [
  ...SPORT_TEMPLATES,
  ...POLITICA_TEMPLATES,
  ...ECONOMIA_TEMPLATES,
  ...TECNOLOGIA_TEMPLATES,
  ...CULTURA_TEMPLATES,
  ...SCIENZA_TEMPLATES,
  ...INTRATTENIMENTO_TEMPLATES,
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: EventTemplate['category']): EventTemplate[] {
  return TEMPLATE_CATALOG.filter((t) => t.category === category);
}

/**
 * Get templates compatible with authority type
 * OFFICIAL can use OFFICIAL templates
 * REPUTABLE can use REPUTABLE templates
 */
export function getTemplatesByAuthority(
  authorityType: 'OFFICIAL' | 'REPUTABLE'
): EventTemplate[] {
  return TEMPLATE_CATALOG.filter((t) => {
    if (authorityType === 'OFFICIAL') {
      return t.requiredAuthority === 'OFFICIAL';
    }
    // REPUTABLE can use both OFFICIAL and REPUTABLE
    return true;
  });
}
