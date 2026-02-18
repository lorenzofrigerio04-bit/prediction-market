/**
 * Event Generation V2 - BLOCCO 4
 * 
 * Questo modulo genera candidati eventi da storyline elegibili.
 * I candidati sono già verificati e pronti per scoring/dedup/publish.
 */

import { PrismaClient } from '@prisma/client';
import type { EligibleStoryline } from '../storyline-engine';
import { officialHosts, reputableHosts } from '../authority';
import { computeClosesAt } from './closesAt';
import {
  getCategoryFromHost,
  getSpecificTemplateForHost,
  getUniversalFallbackTemplate,
} from '../event-templates/catalog';
import type { EventTemplate } from '../event-templates/types';

export interface GeneratedEventCandidate {
  title: string;
  description: string;
  category: string;
  closesAt: Date;
  resolutionAuthorityHost: string;
  resolutionAuthorityType: 'OFFICIAL' | 'REPUTABLE';
  resolutionCriteriaYes: string;
  resolutionCriteriaNo: string;
  sourceStorylineId: string;
  templateId: string;
  // Opzionale: se il candidate include già momentum/novelty dalla storyline
  momentum?: number;
  novelty?: number;
}

export interface GenerateEventsFromEligibleStorylinesParams {
  prisma: PrismaClient;
  now: Date;
  eligible: EligibleStoryline[];
}

export interface GenerateEventsFromEligibleStorylinesResult {
  candidates: GeneratedEventCandidate[];
  rejectionReasons: Record<string, number>;
}

const DEBUG = process.env.EVENT_GEN_DEBUG === 'true';
const MAX_CANDIDATES_PER_STORYLINE = 2; // 1 specifico + 1 universal fallback (mai 3 universal)

/**
 * Estrae host da URL
 */
function extractHost(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Determina authority type da host
 */
function getAuthorityType(host: string): 'OFFICIAL' | 'REPUTABLE' {
  const hostLower = host.toLowerCase();
  if (officialHosts.some(h => hostLower.includes(h.toLowerCase()))) {
    return 'OFFICIAL';
  }
  if (reputableHosts.some(h => hostLower.includes(h.toLowerCase()))) {
    return 'REPUTABLE';
  }
  // Default a REPUTABLE se non trovato (per non bloccare tutto)
  return 'REPUTABLE';
}

/** Categoria da host (single source: catalog) */
function deriveCategory(_titles: string[], host: string): string {
  return getCategoryFromHost(host);
}

/**
 * Estrae entità principale dal titolo
 */
function extractMainEntity(title: string): string {
  // Prendi le prime 2-3 parole significative
  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['sarà', 'saranno', 'verrà', 'verranno', 'accadrà'].includes(w));
  
  if (words.length >= 2) {
    return words.slice(0, 2).join(' ');
  }
  return words[0] || 'evento';
}

/** Crea un candidate da template catalog (titolo verificabile, no "accadrà/si verificherà/sarà confermato") */
function buildCandidateFromTemplate(
  template: EventTemplate,
  ctx: { storylineId: string; authorityType: 'OFFICIAL' | 'REPUTABLE'; authorityHost: string; entityA?: string; topic?: string; closesAt: Date },
  mainTitle: string,
  storyline: EligibleStoryline
): GeneratedEventCandidate {
  const closesAt = computeClosesAt(
    template.horizonDaysMin,
    template.horizonDaysMax,
    storyline.momentum / 100,
    new Date()
  );
  const ctxWithDate = { ...ctx, closesAt };
  const question = template.question(ctxWithDate);
  const criteria = template.resolutionCriteria(ctxWithDate);
  return {
    title: question,
    description: mainTitle,
    category: template.category,
    closesAt,
    resolutionAuthorityHost: ctx.authorityHost,
    resolutionAuthorityType: ctx.authorityType,
    resolutionCriteriaYes: criteria.yes,
    resolutionCriteriaNo: criteria.no,
    sourceStorylineId: ctx.storylineId,
    templateId: template.id,
    momentum: storyline.momentum,
    novelty: storyline.novelty,
  };
}

/**
 * Verifica che il candidato sia valido
 */
function verifyCandidate(candidate: GeneratedEventCandidate): { ok: boolean; reason?: string } {
  // Verifica titolo
  if (!candidate.title || candidate.title.length < 10) {
    return { ok: false, reason: 'title_too_short' };
  }
  if (candidate.title.length > 200) {
    return { ok: false, reason: 'title_too_long' };
  }
  if (!candidate.title.endsWith('?')) {
    return { ok: false, reason: 'title_missing_question_mark' };
  }
  
  // Verifica parole vaghe
  const vagueWords = ['forse', 'potrebbe', 'magari', 'chissà'];
  const titleLower = candidate.title.toLowerCase();
  if (vagueWords.some(word => titleLower.includes(word))) {
    return { ok: false, reason: 'title_too_vague' };
  }
  
  // Verifica closesAt
  if (candidate.closesAt <= new Date()) {
    return { ok: false, reason: 'closes_at_past' };
  }
  
  // Verifica criteria
  if (!candidate.resolutionCriteriaYes || !candidate.resolutionCriteriaNo) {
    return { ok: false, reason: 'missing_criteria' };
  }
  
  return { ok: true };
}

/**
 * Genera candidati eventi da storyline elegibili (fino a 3 per storyline).
 * authorityHost è sempre dall'URL dell'articolo, mai placeholder "event".
 */
export async function generateEventsFromEligibleStorylines(
  params: GenerateEventsFromEligibleStorylinesParams
): Promise<GenerateEventsFromEligibleStorylinesResult> {
  const { prisma, now, eligible } = params;
  const candidates: GeneratedEventCandidate[] = [];
  const rejectionReasons: Record<string, number> = {};

  if (DEBUG) {
    console.log(`[Event Generation V2] Processing ${eligible.length} eligible storylines`);
  }

  for (const storyline of eligible) {
    try {
      const cluster = await prisma.sourceCluster.findUnique({
        where: { id: storyline.clusterId },
        include: {
          articles: { take: 10, orderBy: { fetchedAt: 'desc' } },
        },
      });

      if (!cluster || cluster.articles.length === 0) {
        if (DEBUG) console.log(`[Event Generation V2] Cluster ${storyline.clusterId} has no articles`);
        continue;
      }

      const titles = cluster.articles.map(a => a.title);
      const mainTitle = titles[0] || '';
      let host = '';
      let mainArticle = cluster.articles[0];
      for (const a of cluster.articles) {
        const h = extractHost(a.canonicalUrl);
        if (h && h !== 'event') {
          host = h;
          mainArticle = a;
          break;
        }
      }
      if (!host) {
        if (DEBUG) console.log(`[Event Generation V2] Cluster ${storyline.clusterId} no article with valid host (skip placeholder "event")`);
        continue;
      }

      const authorityType = storyline.authorityType ?? getAuthorityType(host);
      const category = deriveCategory(titles, host);
      const entityA = extractMainEntity(mainTitle);
      const ctx = {
        storylineId: storyline.clusterId,
        authorityType,
        authorityHost: host,
        entityA,
        topic: undefined as string | undefined,
        closesAt: now,
      };

      let added = 0;
      const specificTemplate = getSpecificTemplateForHost(host, authorityType);
      if (specificTemplate && added < MAX_CANDIDATES_PER_STORYLINE) {
        const candidate = buildCandidateFromTemplate(specificTemplate, ctx, mainTitle, storyline);
        const verification = verifyCandidate(candidate);
        if (verification.ok) {
          candidates.push(candidate);
          added++;
          if (DEBUG) console.log(`[Event Generation V2] Generated candidate (specific): ${candidate.title.slice(0, 50)}... template=${candidate.templateId}`);
        } else {
          rejectionReasons[verification.reason ?? 'unknown'] = (rejectionReasons[verification.reason ?? 'unknown'] ?? 0) + 1;
        }
      }
      // Universal SOLO come fallback: se non abbiamo aggiunto un specifico
      if (added === 0) {
        const fallback = getUniversalFallbackTemplate();
        const candidate = buildCandidateFromTemplate(fallback, ctx, mainTitle, storyline);
        const verification = verifyCandidate(candidate);
        if (verification.ok) {
          candidates.push(candidate);
          if (DEBUG) console.log(`[Event Generation V2] Generated candidate (fallback): ${candidate.title.slice(0, 50)}...`);
        } else {
          rejectionReasons[verification.reason ?? 'unknown'] = (rejectionReasons[verification.reason ?? 'unknown'] ?? 0) + 1;
        }
      }
    } catch (error) {
      if (DEBUG) console.error(`[Event Generation V2] Error processing storyline ${storyline.clusterId}:`, error);
    }
  }

  if (DEBUG) {
    console.log(`[Event Generation V2] Generated ${candidates.length} candidates from ${eligible.length} storylines`);
  }

  return { candidates, rejectionReasons };
}
