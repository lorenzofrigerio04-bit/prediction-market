/**
 * Example TrendObject → StructuredCandidateEvent pairs per category
 * Used for tests and documentation
 */

import type { TrendObject } from '../trend-detection/types';
import type { StructuredCandidateEvent } from './types';
import { generateCandidateEvents } from '../candidate-event-generator/algorithm';

/** Fixed date for deterministic examples */
const EXAMPLE_NOW = new Date('2025-03-04T12:00:00Z');

export const exampleTrends: Record<string, TrendObject> = {
  crypto: {
    topic: 'Bitcoin 100k price prediction',
    category: 'Crypto',
    entities: ['Bitcoin', 'BTC'],
    trend_score: 0.85,
    time_sensitivity: 'medium',
    source_signals: [
      { providerId: 'newsapi', signalId: 'https://example.com/bitcoin-100k', timestamp: EXAMPLE_NOW },
    ],
    timestamp: EXAMPLE_NOW,
  },
  sports: {
    topic: 'Inter Milan Champions League final',
    category: 'Sport',
    entities: ['Inter', 'Milan'],
    trend_score: 0.9,
    time_sensitivity: 'high',
    source_signals: [
      { providerId: 'newsapi', signalId: 'https://www.uefa.com/match/123', timestamp: EXAMPLE_NOW },
    ],
    timestamp: EXAMPLE_NOW,
  },
  politics: {
    topic: 'Elezioni presidente 2025',
    category: 'Politica',
    entities: ['Meloni', 'Partito'],
    trend_score: 0.75,
    time_sensitivity: 'medium',
    source_signals: [
      { providerId: 'newsapi', signalId: 'https://www.governo.it/elezioni', timestamp: EXAMPLE_NOW },
    ],
    timestamp: EXAMPLE_NOW,
  },
  tech: {
    topic: 'Apple iPhone 16 release',
    category: 'Tecnologia',
    entities: ['Apple', 'iPhone'],
    trend_score: 0.8,
    time_sensitivity: 'high',
    source_signals: [
      { providerId: 'newsapi', signalId: 'https://www.sec.gov/edgar/aapl', timestamp: EXAMPLE_NOW },
    ],
    timestamp: EXAMPLE_NOW,
  },
  economy: {
    topic: 'CPI Italia 2.5% inflazione',
    category: 'Economia',
    entities: ['CPI', 'Italia'],
    trend_score: 0.7,
    time_sensitivity: 'medium',
    source_signals: [
      { providerId: 'newsapi', signalId: 'https://ec.europa.eu/eurostat/cpi', timestamp: EXAMPLE_NOW },
    ],
    timestamp: EXAMPLE_NOW,
  },
  culture: {
    topic: 'Oscar 2025 Dune 2',
    category: 'Cultura',
    entities: ['Dune', 'Oscar'],
    trend_score: 0.85,
    time_sensitivity: 'medium',
    source_signals: [
      { providerId: 'newsapi', signalId: 'https://www.oscars.org/2025', timestamp: EXAMPLE_NOW },
    ],
    timestamp: EXAMPLE_NOW,
  },
};

/** Generate expected candidates from examples */
export function getExampleCandidates(): StructuredCandidateEvent[] {
  const result = generateCandidateEvents(Object.values(exampleTrends), EXAMPLE_NOW);
  return result.candidates;
}

/** Single example: crypto price threshold */
export const exampleCryptoCandidate: StructuredCandidateEvent = {
  category: 'Crypto',
  subject_entity: 'Bitcoin',
  metric_condition: 'price >= threshold',
  threshold: 100000,
  deadline: new Date('2025-03-11T12:00:00Z'),
  resolution_sources: ['https://example.com/bitcoin-100k'],
  edge_case_policy: 'DEFAULT',
  title: 'Il prezzo di Bitcoin raggiungerà o supererà 100000 USD entro il 2025-03-11?',
  resolutionCriteriaYes:
    'Prezzo di Bitcoin >= 100000 USD su CoinGecko o CoinMarketCap entro la deadline.',
  resolutionCriteriaNo: 'Prezzo di Bitcoin < 100000 USD alla deadline.',
  templateId: 'crypto-price-threshold',
};
