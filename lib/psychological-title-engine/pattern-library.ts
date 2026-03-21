/**
 * Psychological Title Engine - Pattern library (ITALIANO)
 * Mappa templateId a pattern di titolo con placeholder: [ENTITY], [THRESHOLD], [DATE]
 */

import type { TitlePattern } from './types';

/** Pattern per template ID. Ogni template può avere più varianti. */
export const PATTERNS_BY_TEMPLATE: Record<string, TitlePattern[]> = {
  'crypto-price-threshold': [
    {
      id: 'crypto-superare',
      template: 'Riuscirà [ENTITY] a superare [THRESHOLD] prima del [DATE]?',
      placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
    },
    {
      id: 'crypto-raggiungere',
      template: '[ENTITY] raggiungerà [THRESHOLD] entro il [DATE]?',
      placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
    },
    {
      id: 'crypto-superare-soglia',
      template: '[ENTITY] supererà la soglia di [THRESHOLD] entro il [DATE]?',
      placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
    },
    {
      id: 'crypto-toccare',
      template: '[ENTITY] toccherà [THRESHOLD] entro il [DATE]?',
      placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
    },
  ],
  'crypto-market-cap-threshold': [
    {
      id: 'crypto-mcap-superare',
      template: '[ENTITY] supererà [THRESHOLD] di capitalizzazione entro il [DATE]?',
      placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
    },
    {
      id: 'crypto-mcap-raggiungere',
      template: '[ENTITY] raggiungerà [THRESHOLD] di market cap entro il [DATE]?',
      placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
    },
    {
      id: 'crypto-mcap-toccare',
      template: 'La capitalizzazione di [ENTITY] toccherà [THRESHOLD] entro il [DATE]?',
      placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
    },
  ],
  'sports-match-winner': [
    {
      id: 'sports-match-vincere',
      template: '[ENTITY] vincerà la partita entro il [DATE]?',
      placeholders: ['ENTITY', 'DATE'],
    },
    {
      id: 'sports-match-conquistare',
      template: '[ENTITY] conquisterà la partita entro il [DATE]?',
      placeholders: ['ENTITY', 'DATE'],
    },
  ],
  'sports-tournament-winner': [
    {
      id: 'sports-tournament-vincere',
      template: '[ENTITY] vincerà il torneo entro il [DATE]?',
      placeholders: ['ENTITY', 'DATE'],
    },
    {
      id: 'sports-tournament-sta-per',
      template: '[ENTITY] sta per vincere [THRESHOLD]?',
      placeholders: ['ENTITY', 'THRESHOLD'],
    },
    {
      id: 'sports-tournament-conquistare',
      template: '[ENTITY] conquisterà il titolo entro il [DATE]?',
      placeholders: ['ENTITY', 'DATE'],
    },
  ],
  'tech-product-release': [
    {
      id: 'tech-rilasciare',
      template: '[ENTITY] rilascerà [THRESHOLD] entro il [DATE]?',
      placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
    },
    {
      id: 'tech-rilasciare-prima',
      template: '[ENTITY] rilascerà [THRESHOLD] prima del [DATE]?',
      placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
    },
  ],
  'tech-earnings-report': [
    {
      id: 'tech-earnings-positivi',
      template: '[ENTITY] pubblicherà earnings positivi entro il [DATE]?',
      placeholders: ['ENTITY', 'DATE'],
    },
    {
      id: 'tech-earnings-superare',
      template: '[ENTITY] supererà le aspettative sugli earnings entro il [DATE]?',
      placeholders: ['ENTITY', 'DATE'],
    },
  ],
  'politics-election-winner': [
    {
      id: 'politics-vincere',
      template: '[ENTITY] vincerà le elezioni entro il [DATE]?',
      placeholders: ['ENTITY', 'DATE'],
    },
    {
      id: 'politics-conquistare',
      template: '[ENTITY] conquisterà le elezioni entro il [DATE]?',
      placeholders: ['ENTITY', 'DATE'],
    },
  ],
  'politics-nomination-confirmation': [
    {
      id: 'politics-nomina',
      template: 'La nomina di [ENTITY] sarà confermata entro il [DATE]?',
      placeholders: ['ENTITY', 'DATE'],
    },
  ],
  'economy-cpi': [
    {
      id: 'economy-cpi-raggiungere',
      template: 'L\'indice CPI raggiungerà [THRESHOLD] entro il [DATE]?',
      placeholders: ['THRESHOLD', 'DATE'],
    },
    {
      id: 'economy-cpi-scendere',
      template: 'Il CPI scenderà sotto [THRESHOLD] entro il [DATE]?',
      placeholders: ['THRESHOLD', 'DATE'],
    },
  ],
  'economy-interest-rate': [
    {
      id: 'economy-rate-raggiungere',
      template: 'Il tasso di interesse raggiungerà [THRESHOLD] entro il [DATE]?',
      placeholders: ['THRESHOLD', 'DATE'],
    },
    {
      id: 'economy-rate-superare',
      template: 'Il tasso supererà [THRESHOLD] entro il [DATE]?',
      placeholders: ['THRESHOLD', 'DATE'],
    },
  ],
  'economy-gdp': [
    {
      id: 'economy-gdp-raggiungere',
      template: 'La crescita del PIL raggiungerà [THRESHOLD] entro il [DATE]?',
      placeholders: ['THRESHOLD', 'DATE'],
    },
    {
      id: 'economy-gdp-superare',
      template: 'Il PIL supererà [THRESHOLD] di crescita entro il [DATE]?',
      placeholders: ['THRESHOLD', 'DATE'],
    },
  ],
  'culture-award-winner': [
    {
      id: 'culture-award-vincere',
      template: '[ENTITY] vincerà l\'Oscar entro il [DATE]?',
      placeholders: ['ENTITY', 'DATE'],
    },
    {
      id: 'culture-award-conquistare',
      template: '[ENTITY] conquisterà il premio entro il [DATE]?',
      placeholders: ['ENTITY', 'DATE'],
    },
  ],
  'culture-box-office-revenue': [
    {
      id: 'culture-boxoffice-raggiungere',
      template: '[ENTITY] raggiungerà [THRESHOLD] al botteghino entro il [DATE]?',
      placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
    },
    {
      id: 'culture-boxoffice-superare',
      template: 'Gli incassi di [ENTITY] supereranno [THRESHOLD] entro il [DATE]?',
      placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
    },
  ],
};

/** Pattern di fallback per template sconosciuto */
export const FALLBACK_PATTERNS: TitlePattern[] = [
  {
    id: 'fallback-raggiungere',
    template: '[ENTITY] raggiungerà [THRESHOLD] entro il [DATE]?',
    placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
  },
  {
    id: 'fallback-prima',
    template: '[ENTITY] conseguirà [THRESHOLD] prima del [DATE]?',
    placeholders: ['ENTITY', 'THRESHOLD', 'DATE'],
  },
];

/** Restituisce i pattern per un template ID (3-5 varianti) */
export function getPatternsForTemplate(templateId: string): TitlePattern[] {
  const patterns = PATTERNS_BY_TEMPLATE[templateId];
  if (patterns && patterns.length > 0) {
    return patterns.slice(0, 5);
  }
  return FALLBACK_PATTERNS.slice(0, 3);
}
