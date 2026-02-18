/**
 * Event Verifier Rules
 * BLOCCO 4: Verifier formale - Regole HARD FAIL
 */

import type { GeneratedEventCandidate } from '../event-generation-v2/types';

/**
 * Lista parole vaghe vietate
 */
export const VAGUE_WORDS = [
  'probabile',
  'significativo',
  'importante',
  'shock',
  'risi',
  'scandalo',
  'caos',
];

/**
 * Whitelist host ufficiali (esempi minimi)
 */
export const OFFICIAL_HOSTS = [
  'governo.it',
  'gazzettaufficiale.it',
  'camera.it',
  'senato.it',
  'europa.eu',
  'ec.europa.eu',
];

/**
 * Whitelist host reputabili (esempi minimi)
 */
export const REPUTABLE_HOSTS = [
  'ansa.it',
  'repubblica.it',
  'corriere.it',
  'ilsole24ore.com',
  'wsj.com',
  'reuters.com',
];

/**
 * Verifica che il titolo sia una domanda sì/no (termina con "?")
 */
export function checkTitleIsQuestion(title: string): { ok: boolean; reason?: string } {
  if (!title.trim().endsWith('?')) {
    return { ok: false, reason: 'Il titolo deve terminare con "?"' };
  }
  return { ok: true };
}

/**
 * Verifica che il titolo contenga una sola condizione
 * Vieta: " e ", " oppure ", ";" nel titolo
 */
export function checkSingleCondition(title: string): { ok: boolean; reason?: string } {
  const lowerTitle = title.toLowerCase();
  
  // Controlla congiunzioni multiple
  if (lowerTitle.includes(' e ') || lowerTitle.includes(' oppure ') || lowerTitle.includes(';')) {
    return { ok: false, reason: 'Il titolo contiene più condizioni (vietato: " e ", " oppure ", ";")' };
  }
  
  return { ok: true };
}

/**
 * Verifica che il titolo non contenga parole vaghe
 */
export function checkNoVagueWords(title: string): { ok: boolean; reason?: string } {
  const lowerTitle = title.toLowerCase();
  const foundVague = VAGUE_WORDS.filter((word) => lowerTitle.includes(word));
  
  if (foundVague.length > 0) {
    return {
      ok: false,
      reason: `Il titolo contiene parole vaghe vietate: ${foundVague.join(', ')}`,
    };
  }
  
  return { ok: true };
}

/**
 * Verifica che i criteri di risoluzione siano non vuoti e mutuamente esclusivi
 */
export function checkResolutionCriteria(
  criteria: { yes: string; no: string }
): { ok: boolean; reason?: string } {
  if (!criteria.yes || !criteria.yes.trim()) {
    return { ok: false, reason: 'resolutionCriteria.yes non può essere vuoto' };
  }
  
  if (!criteria.no || !criteria.no.trim()) {
    return { ok: false, reason: 'resolutionCriteria.no non può essere vuoto' };
  }
  
  // Verifica mutua esclusività: yes e no non devono essere identici
  if (criteria.yes.trim().toLowerCase() === criteria.no.trim().toLowerCase()) {
    return { ok: false, reason: 'resolutionCriteria.yes e no devono essere mutuamente esclusivi' };
  }
  
  return { ok: true };
}

/**
 * Verifica che closesAt sia nel range valido (> now + 30min e < now + 365d)
 */
export function checkClosesAtRange(
  closesAt: Date,
  now: Date
): { ok: boolean; reason?: string } {
  const minClose = new Date(now.getTime() + 30 * 60 * 1000); // +30 minuti
  const maxClose = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // +365 giorni
  
  if (closesAt.getTime() <= minClose.getTime()) {
    return {
      ok: false,
      reason: `closesAt deve essere almeno 30 minuti nel futuro (attuale: ${closesAt.toISOString()})`,
    };
  }
  
  if (closesAt.getTime() >= maxClose.getTime()) {
    return {
      ok: false,
      reason: `closesAt non può essere oltre 365 giorni nel futuro (attuale: ${closesAt.toISOString()})`,
    };
  }
  
  return { ok: true };
}

/**
 * Verifica che resolutionAuthorityHost matchi authorityHost dalla storyline
 * o sia subset della whitelist ufficiale/reputable
 */
export function checkAuthorityHost(
  resolutionAuthorityHost: string,
  authorityType: 'OFFICIAL' | 'REPUTABLE',
  expectedHost: string
): { ok: boolean; reason?: string } {
  const lowerResolutionHost = resolutionAuthorityHost.toLowerCase();
  const lowerExpectedHost = expectedHost.toLowerCase();
  
  // Match esatto o subset
  if (lowerResolutionHost === lowerExpectedHost || lowerResolutionHost.includes(lowerExpectedHost)) {
    return { ok: true };
  }
  
  // Verifica whitelist
  const whitelist = authorityType === 'OFFICIAL' ? OFFICIAL_HOSTS : REPUTABLE_HOSTS;
  const isInWhitelist = whitelist.some((host) => lowerResolutionHost.includes(host));
  
  if (!isInWhitelist) {
    return {
      ok: false,
      reason: `resolutionAuthorityHost "${resolutionAuthorityHost}" non matcha "${expectedHost}" né è nella whitelist ${authorityType}`,
    };
  }
  
  return { ok: true };
}
