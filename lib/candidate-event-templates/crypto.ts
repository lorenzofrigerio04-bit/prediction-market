/**
 * Crypto category templates - price thresholds, market cap thresholds
 * Resolution: CoinGecko, CoinMarketCap
 */

import { EdgeCasePolicyRef } from '../event-gen-v2/edge-case-policy';
import type { CandidateEventTemplate, TemplateContext } from './types';
import type { TrendObject } from '../trend-detection/types';

const COINGECKO = 'https://www.coingecko.com/';
const COINMARKETCAP = 'https://www.coinmarketcap.com/';

/** Extract number from topic (e.g. "Bitcoin 100k" -> 100000, "ETH $5000" -> 5000) */
function extractPriceFromTopic(topic: string): number | null {
  const text = topic.toLowerCase().replace(/,/g, '');
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k(?:ilo)?/i);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;
  const mMatch = text.match(/(\d+(?:\.\d+)?)\s*m(?:illion)?/i);
  if (mMatch) return parseFloat(mMatch[1]) * 1_000_000;
  const numMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:k|m|b)?/i);
  if (numMatch) return parseFloat(numMatch[1]);
  return null;
}

/** Extract asset symbol/name from topic */
function extractAssetFromTopic(topic: string, entities: string[]): string {
  const known = ['Bitcoin', 'BTC', 'Ethereum', 'ETH', 'Solana', 'SOL', 'XRP', 'Dogecoin', 'DOGE'];
  for (const e of entities) {
    if (known.some((k) => k.toLowerCase().includes(e.toLowerCase()))) return e;
  }
  const words = topic.split(/\s+/).filter((w) => w.length > 2);
  return words[0] ?? 'crypto asset';
}

function computeDeadline(trend: TrendObject, now: Date): Date {
  const d = new Date(now);
  if (trend.time_sensitivity === 'high') d.setDate(d.getDate() + 3);
  else if (trend.time_sensitivity === 'medium') d.setDate(d.getDate() + 7);
  else d.setDate(d.getDate() + 14);
  return d;
}

export const cryptoPriceThreshold: CandidateEventTemplate = {
  id: 'crypto-price-threshold',
  category: 'Crypto',
  metric_condition: 'price >= threshold',
  threshold_type: 'number',
  resolution_source_authority: COINGECKO,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: (trend) => extractPriceFromTopic(trend.topic) ?? extractPriceFromTopic(trend.entities.join(' ')),
  computeDeadline,
  question: (ctx) =>
    `Il prezzo di ${ctx.subject_entity} raggiungerà o supererà ${ctx.threshold} USD entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `Prezzo di ${ctx.subject_entity} >= ${ctx.threshold} USD su CoinGecko o CoinMarketCap entro la deadline.`,
    no: `Prezzo di ${ctx.subject_entity} < ${ctx.threshold} USD alla deadline.`,
  }),
};

export const cryptoMarketCapThreshold: CandidateEventTemplate = {
  id: 'crypto-market-cap-threshold',
  category: 'Crypto',
  metric_condition: 'market_cap >= threshold',
  threshold_type: 'number',
  resolution_source_authority: COINGECKO,
  edge_case_policy: EdgeCasePolicyRef.DEFAULT,
  extractThreshold: (trend) => {
    const n = extractPriceFromTopic(trend.topic) ?? extractPriceFromTopic(trend.entities.join(' '));
    if (!n) return null;
    return n >= 1e6 ? n : n * 1e6;
  },
  computeDeadline,
  question: (ctx) =>
    `La capitalizzazione di mercato di ${ctx.subject_entity} raggiungerà o supererà ${ctx.threshold} USD entro il ${ctx.deadline.toISOString().split('T')[0]}?`,
  resolutionCriteria: (ctx) => ({
    yes: `Market cap di ${ctx.subject_entity} >= ${ctx.threshold} USD su CoinGecko o CoinMarketCap entro la deadline.`,
    no: `Market cap di ${ctx.subject_entity} < ${ctx.threshold} USD alla deadline.`,
  }),
};

export const cryptoTemplates: CandidateEventTemplate[] = [
  cryptoPriceThreshold,
  cryptoMarketCapThreshold,
];
