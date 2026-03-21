/**
 * Psychological Title Engine - Esempi prima/dopo per categoria (ITALIANO)
 */

import type { StructuredCandidateEvent } from '../candidate-event-templates/types';
import { generatePsychologicalTitle } from './generate';

/** Candidati di esempio con titoli originali in italiano */
export const exampleCandidates: Array<{
  category: string;
  templateId: string;
  before: string;
  candidate: StructuredCandidateEvent;
}> = [
  {
    category: 'Crypto',
    templateId: 'crypto-price-threshold',
    before: 'Il prezzo di Bitcoin raggiungerà o supererà 100000 USD entro il 2025-03-11?',
    candidate: {
      category: 'Crypto',
      subject_entity: 'Bitcoin',
      metric_condition: 'price >= threshold',
      threshold: 100000,
      deadline: new Date('2025-03-11T12:00:00Z'),
      resolution_sources: ['https://www.coingecko.com/en/coins/bitcoin'],
      edge_case_policy: 'DEFAULT',
      title: 'Il prezzo di Bitcoin raggiungerà o supererà 100000 USD entro il 2025-03-11?',
      resolutionCriteriaYes: 'Prezzo di Bitcoin >= 100000 USD su CoinGecko o CoinMarketCap entro la deadline.',
      resolutionCriteriaNo: 'Prezzo di Bitcoin < 100000 USD alla deadline.',
      templateId: 'crypto-price-threshold',
    },
  },
  {
    category: 'Sport',
    templateId: 'sports-tournament-winner',
    before: 'La squadra/atleta Inter vincerà il torneo entro il 2025-04-03?',
    candidate: {
      category: 'Sport',
      subject_entity: 'Inter',
      metric_condition: 'tournament_winner = entity',
      threshold: 'Inter',
      deadline: new Date('2025-04-03T12:00:00Z'),
      resolution_sources: ['https://www.uefa.com/uefachampionsleague/'],
      edge_case_policy: 'DEFAULT',
      title: 'La squadra/atleta Inter vincerà il torneo entro il 2025-04-03?',
      resolutionCriteriaYes: 'Inter risulta vincitore del torneo secondo fonte ufficiale entro la deadline.',
      resolutionCriteriaNo: 'Inter non risulta vincitore del torneo alla deadline.',
      templateId: 'sports-tournament-winner',
    },
  },
  {
    category: 'Tecnologia',
    templateId: 'tech-product-release',
    before: 'Apple rilascerà il prodotto annunciato entro il 2025-03-11?',
    candidate: {
      category: 'Tecnologia',
      subject_entity: 'Apple',
      metric_condition: 'product_released_by_deadline = true',
      threshold: 'Apple',
      deadline: new Date('2025-03-11T12:00:00Z'),
      resolution_sources: ['https://www.sec.gov/cgi-bin/browse-edgar'],
      edge_case_policy: 'DEFAULT',
      title: 'Apple rilascerà il prodotto annunciato entro il 2025-03-11?',
      resolutionCriteriaYes: 'Prodotto di Apple rilasciato ufficialmente entro la deadline.',
      resolutionCriteriaNo: 'Prodotto di Apple non rilasciato alla deadline.',
      templateId: 'tech-product-release',
    },
  },
  {
    category: 'Economia',
    templateId: 'economy-cpi',
    before: "L'indice CPI sarà <= 2.5% entro il 2025-04-03?",
    candidate: {
      category: 'Economia',
      subject_entity: 'CPI',
      metric_condition: 'cpi <= threshold',
      threshold: 2.5,
      deadline: new Date('2025-04-03T12:00:00Z'),
      resolution_sources: ['https://ec.europa.eu/eurostat'],
      edge_case_policy: 'DEFAULT',
      title: "L'indice CPI sarà <= 2.5% entro il 2025-04-03?",
      resolutionCriteriaYes: 'CPI <= 2.5% secondo Eurostat/BLS entro la deadline.',
      resolutionCriteriaNo: 'CPI > 2.5% alla deadline.',
      templateId: 'economy-cpi',
    },
  },
];

/** Get before/after pairs (run engine to get "after") */
export function getExamplePairs(): Array<{
  category: string;
  templateId: string;
  before: string;
  after: string | null;
}> {
  return exampleCandidates.map((ex) => ({
    category: ex.category,
    templateId: ex.templateId,
    before: ex.before,
    after: generatePsychologicalTitle(ex.candidate),
  }));
}
