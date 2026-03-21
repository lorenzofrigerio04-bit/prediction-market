/**
 * NewsAPI / Event Registry SignalProvider
 * Maps RawArticle from ingestion to RawSignal
 */

import { fetchNewsAPI } from '@/lib/ingestion/fetchers/newsapi';
import type { RawSignal, SignalProvider } from '../types';

const PROVIDER_ID = 'newsapi';

/** Map topic keywords to event categories */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Sport: ['calcio', 'serie a', 'champions', 'uefa', 'fifa', 'partita', 'gol', 'squadra', 'allenatore', 'transfer', 'match', 'tennis', 'basket', 'formula 1', 'motogp'],
  Politica: ['elezioni', 'governo', 'parlamento', 'ministro', 'presidente', 'partito', 'coalizione', 'decreto', 'legge', 'senato', 'camera'],
  Tecnologia: ['ai', 'intelligenza artificiale', 'tech', 'apple', 'google', 'meta', 'microsoft', 'startup', 'software', 'digitale', 'cyber'],
  Economia: ['borsa', 'mercato', 'inflazione', 'pil', 'bce', 'banche', 'investimenti', 'earnings', 'trimestrale'],
  Scienza: ['ricerca', 'studio', 'nasa', 'spazio', 'vaccino', 'medicina', 'clima'],
  Cultura: ['film', 'cinema', 'musica', 'arte', 'libro', 'festival'],
  Intrattenimento: ['show', 'celebrity', 'gossip', 'serie tv'],
};

const DEFAULT_CATEGORY = 'Altro';

function deriveCategory(title: string, content?: string): string {
  const text = `${(title || '').toLowerCase()} ${(content || '').toLowerCase()}`;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) return cat;
  }
  return DEFAULT_CATEGORY;
}

/** Extract capitalized phrases as simple entities (placeholder until NER) */
function extractEntities(title: string): string[] {
  const matches = title.match(/\b[A-Z][a-zàèéìòù]+(?:\s+[A-Z][a-zàèéìòù]+)*\b/g);
  return [...new Set(matches || [])].slice(0, 5);
}

export const newsApiProvider: SignalProvider = {
  id: PROVIDER_ID,

  async fetchSignals(options?: { limit?: number }): Promise<RawSignal[]> {
    const articles = await fetchNewsAPI();
    const limit = options?.limit ?? 100;

    const signals: RawSignal[] = articles.slice(0, limit).map((a) => ({
      providerId: PROVIDER_ID,
      sourceId: a.url,
      topic: a.title?.trim() || 'Senza titolo',
      content: a.content,
      publishedAt: a.publishedAt ?? new Date(),
      entities: extractEntities(a.title || ''),
      category: deriveCategory(a.title || '', a.content),
      url: a.url,
      rawData: a.rawData,
    }));

    return signals;
  },
};
