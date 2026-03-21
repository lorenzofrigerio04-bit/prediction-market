/**
 * Image Brief Engine - Example briefs per category
 *
 * Demonstrates full ImageBrief structure, subject extraction,
 * symbolism usage, and alt text in 90–140 char range.
 */

import type { ImageBrief } from '../event-gen-v2/types';
import { generateImageBrief } from './generate';

/** Example inputs for each category */
export const EXAMPLE_INPUTS = {
  Crypto: {
    title: 'Bitcoin supererà 100.000 USD entro il 15 marzo?',
    category: 'Crypto',
    description: 'Previsione sul prezzo di Bitcoin rispetto alla soglia dei 100k USD.',
  },
  Sport: {
    title: 'Inter vincerà il campionato entro il 30 aprile?',
    category: 'Sport',
    description: 'Scommessa sul campionato italiano di calcio.',
  },
  Politica: {
    title: 'Il candidato X otterrà la nomination entro il 1 giugno?',
    category: 'Politica',
    description: 'Elezioni primarie, candidatura.',
  },
  Economia: {
    title: 'La Fed alzerà i tassi entro il prossimo meeting?',
    category: 'Economia',
    description: 'Politica monetaria Federal Reserve.',
  },
  Tecnologia: {
    title: 'Apple rilascerà iPhone 16 entro settembre?',
    category: 'Tecnologia',
    description: 'Lancio prodotto Apple.',
  },
  Cultura: {
    title: 'Il film Y supererà 500M al botteghino entro dicembre?',
    category: 'Cultura',
    description: 'Box office cinematografico.',
  },
} as const;

/** Generate example briefs - useful for tests and documentation */
export function getExampleBriefs(): Record<string, ImageBrief> {
  const result: Record<string, ImageBrief> = {};
  for (const [cat, input] of Object.entries(EXAMPLE_INPUTS)) {
    result[cat] = generateImageBrief(input);
  }
  return result;
}

/** Single example: Crypto (market_chart_abstract) */
export const exampleCryptoBrief = (): ImageBrief =>
  generateImageBrief(EXAMPLE_INPUTS.Crypto);

/** Single example: Sport (sports_action) */
export const exampleSportBrief = (): ImageBrief =>
  generateImageBrief(EXAMPLE_INPUTS.Sport);

/** Single example: Politica (political_symbolic) */
export const examplePoliticaBrief = (): ImageBrief =>
  generateImageBrief(EXAMPLE_INPUTS.Politica);
