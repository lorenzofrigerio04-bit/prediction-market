/**
 * Event Verifier
 * BLOCCO 4: Verifier formale (BRUTALE)
 */

import type { VerificationResult } from './types';
import type { GeneratedEventCandidate } from '../event-generation-v2/types';
import {
  checkTitleIsQuestion,
  checkSingleCondition,
  checkNoVagueWords,
  checkResolutionCriteria,
  checkClosesAtRange,
  checkAuthorityHost,
} from './rules';

/**
 * Verifica un candidate event con regole HARD FAIL
 * 
 * @param candidate - Il candidate event da verificare
 * @param now - Data corrente per validazione closesAt
 * @param expectedHost - Host atteso dalla storyline
 * @returns VerificationResult con ok:true oppure ok:false + reasons
 */
export function verifyCandidate(
  candidate: GeneratedEventCandidate,
  now: Date,
  expectedHost: string
): VerificationResult {
  const reasons: string[] = [];
  
  // 1) Title deve essere domanda sì/no
  const titleCheck = checkTitleIsQuestion(candidate.title);
  if (!titleCheck.ok) {
    reasons.push(titleCheck.reason!);
  }
  
  // 2) Single condition check
  const conditionCheck = checkSingleCondition(candidate.title);
  if (!conditionCheck.ok) {
    reasons.push(conditionCheck.reason!);
  }
  
  // 3) No vague words
  const vagueCheck = checkNoVagueWords(candidate.title);
  if (!vagueCheck.ok) {
    reasons.push(vagueCheck.reason!);
  }
  
  // 4) Resolution criteria non vuoti e mutuamente esclusivi
  const criteriaCheck = checkResolutionCriteria(candidate.resolutionCriteria);
  if (!criteriaCheck.ok) {
    reasons.push(criteriaCheck.reason!);
  }
  
  // 5) closesAt range
  const closesAtCheck = checkClosesAtRange(candidate.closesAt, now);
  if (!closesAtCheck.ok) {
    reasons.push(closesAtCheck.reason!);
  }
  
  // 6) Authority host match
  const authorityCheck = checkAuthorityHost(
    candidate.resolutionAuthorityHost,
    candidate.resolutionAuthorityType,
    expectedHost
  );
  if (!authorityCheck.ok) {
    reasons.push(authorityCheck.reason!);
  }
  
  if (reasons.length > 0) {
    return { ok: false, reasons };
  }
  
  return { ok: true };
}
