/**
 * Authority per storyline (BLOCCO 3)
 * OFFICIAL / REPUTABLE / NONE. Nessun UNKNOWN: solo host riconosciuti sono eligible.
 */

import { officialHosts, reputableHosts } from '../authority';
import type { SourceSignalLite, AuthorityResult } from './types';

/**
 * Normalizza host: lowercase, rimuovi www., conserva sottodomini
 */
export function normalizeHost(hostOrUrl: string): string {
  let host: string;
  if (!hostOrUrl.includes('://')) {
    host = hostOrUrl.trim().toLowerCase();
  } else {
    try {
      host = new URL(hostOrUrl).hostname.toLowerCase();
    } catch {
      const m = hostOrUrl.match(/https?:\/\/(?:www\.)?([^/]+)/);
      host = m ? m[1].toLowerCase() : hostOrUrl.toLowerCase();
    }
  }
  if (host.startsWith('www.')) {
    host = host.slice(4);
  }
  return host;
}

/**
 * Mappa host normalizzato a OFFICIAL | REPUTABLE | NONE.
 * Match: host include o termina con entry della whitelist.
 */
export function getAuthorityType(host: string): 'OFFICIAL' | 'REPUTABLE' | 'NONE' {
  const h = normalizeHost(host);
  for (const entry of officialHosts) {
    const e = entry.toLowerCase();
    if (h === e || h.endsWith('.' + e) || h.includes(e)) return 'OFFICIAL';
  }
  for (const entry of reputableHosts) {
    const e = entry.toLowerCase();
    if (h === e || h.endsWith('.' + e) || h.includes(e)) return 'REPUTABLE';
  }
  return 'NONE';
}

/**
 * Da articoli (canonicalUrl) restituisce il tipo di authority dominante e host rappresentativo.
 * OFFICIAL batte REPUTABLE; se solo NONE => null (storyline non eligible).
 */
export function determineAuthorityFromArticles(articles: Array<{ canonicalUrl: string }>): { type: 'OFFICIAL' | 'REPUTABLE'; host: string } | null {
  const counts: Record<string, number> = {};
  for (const a of articles) {
    try {
      const host = normalizeHost(a.canonicalUrl);
      const type = getAuthorityType(host);
      if (type === 'NONE') continue;
      const key = `${type}:${host}`;
      counts[key] = (counts[key] ?? 0) + 1;
    } catch {
      // skip invalid URL
    }
  }
  let best: { type: 'OFFICIAL' | 'REPUTABLE'; host: string; count: number } | null = null;
  for (const [key, count] of Object.entries(counts)) {
    const [type, host] = key.split(':') as ['OFFICIAL' | 'REPUTABLE', string];
    if (!best || (type === 'OFFICIAL' && best.type !== 'OFFICIAL') || (type === best.type && count > best.count)) {
      best = { type, host, count };
    }
  }
  return best ? { type: best.type, host: best.host } : null;
}

/**
 * Per segnali (flusso filter): determina authority con stesse regole
 */
export function determineAuthority(signals: SourceSignalLite[]): AuthorityResult {
  const hostCounts = new Map<string, { count: number; mostRecent: Date }>();
  for (const signal of signals) {
    const host = normalizeHost(signal.host);
    const type = getAuthorityType(host);
    if (type === 'NONE') continue;
    const existing = hostCounts.get(host);
    if (existing) {
      existing.count++;
      if (signal.publishedAt > existing.mostRecent) existing.mostRecent = signal.publishedAt;
    } else {
      hostCounts.set(host, { count: 1, mostRecent: signal.publishedAt });
    }
  }

  const officialCandidates: Array<{ host: string; count: number; mostRecent: Date }> = [];
  const reputableCandidates: Array<{ host: string; count: number; mostRecent: Date }> = [];
  for (const [host, data] of hostCounts) {
    const t = getAuthorityType(host);
    if (t === 'OFFICIAL') officialCandidates.push({ host, ...data });
    else if (t === 'REPUTABLE') reputableCandidates.push({ host, ...data });
  }

  const pick = (arr: Array<{ host: string; count: number; mostRecent: Date }>) => {
    if (arr.length === 0) return null;
    arr.sort((a, b) => b.count - a.count || b.mostRecent.getTime() - a.mostRecent.getTime());
    return arr[0];
  };

  const off = pick(officialCandidates);
  if (off) return { type: 'OFFICIAL', host: off.host };
  const rep = pick(reputableCandidates);
  if (rep) return { type: 'REPUTABLE', host: rep.host };
  return null;
}
