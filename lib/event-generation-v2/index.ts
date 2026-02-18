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

const DEBUG = process.env.EVENT_GEN_DEBUG === 'true';

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

/**
 * Deriva categoria da titoli e host
 */
function deriveCategory(titles: string[], host: string): string {
  const allText = titles.join(' ').toLowerCase();
  const hostLower = host.toLowerCase();

  // Mapping host -> categoria
  if (hostLower.includes('sport') || hostLower.includes('calcio') || hostLower.includes('football')) {
    return 'Sport';
  }
  if (hostLower.includes('politica') || hostLower.includes('governo') || hostLower.includes('parlamento')) {
    return 'Politica';
  }
  if (hostLower.includes('economia') || hostLower.includes('finanza') || hostLower.includes('borsa')) {
    return 'Economia';
  }
  if (hostLower.includes('tech') || hostLower.includes('tecnologia')) {
    return 'Tecnologia';
  }
  if (hostLower.includes('cultura') || hostLower.includes('cinema') || hostLower.includes('musica')) {
    return 'Cultura';
  }

  // Keywords nei titoli
  if (allText.includes('partita') || allText.includes('calcio') || allText.includes('sport')) {
    return 'Sport';
  }
  if (allText.includes('elezioni') || allText.includes('governo') || allText.includes('politica')) {
    return 'Politica';
  }
  if (allText.includes('borsa') || allText.includes('economia') || allText.includes('pil')) {
    return 'Economia';
  }
  if (allText.includes('tech') || allText.includes('software') || allText.includes('ai')) {
    return 'Tecnologia';
  }

  // Default
  return 'News';
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

/**
 * Genera titolo evento da storyline
 */
function generateEventTitle(mainTitle: string, category: string): string {
  const entity = extractMainEntity(mainTitle);
  
  // Template semplice: "L'entità [azione] entro [tempo]?"
  // Per ora usiamo un template universale
  const templates = [
    `${entity} si verificherà entro fine mese?`,
    `${entity} accadrà entro fine settimana?`,
    `${entity} sarà confermato entro fine settimana?`,
  ];
  
  // Scegli template basato su hash del titolo per determinismo
  const hash = mainTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const template = templates[hash % templates.length];
  
  return template;
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
 * Genera candidati eventi da storyline elegibili.
 * 
 * @param params Parametri per la generazione
 * @returns Array di candidati eventi verificati
 */
export async function generateEventsFromEligibleStorylines(
  params: GenerateEventsFromEligibleStorylinesParams
): Promise<GeneratedEventCandidate[]> {
  const { prisma, now, eligible } = params;
  const candidates: GeneratedEventCandidate[] = [];

  if (DEBUG) {
    console.log(`[Event Generation V2] Processing ${eligible.length} eligible storylines`);
  }

  for (const storyline of eligible) {
    try {
      // Carica cluster con articoli
      const cluster = await prisma.sourceCluster.findUnique({
        where: { id: storyline.clusterId },
        include: {
          articles: {
            take: 5, // Prendi i primi 5 articoli
            orderBy: { fetchedAt: 'desc' },
          },
        },
      });

      if (!cluster || cluster.articles.length === 0) {
        if (DEBUG) {
          console.log(`[Event Generation V2] Cluster ${storyline.clusterId} has no articles`);
        }
        continue;
      }

      // Estrai informazioni dagli articoli
      const titles = cluster.articles.map(a => a.title);
      const mainTitle = titles[0] || '';
      const mainArticle = cluster.articles[0];
      const host = extractHost(mainArticle.canonicalUrl);
      
      if (!host) {
        if (DEBUG) {
          console.log(`[Event Generation V2] Cluster ${storyline.clusterId} has invalid URL`);
        }
        continue;
      }

      // Determina authority type
      const authorityType = getAuthorityType(host);
      
      // Deriva categoria
      const category = deriveCategory(titles, host);
      
      // Genera titolo evento
      const eventTitle = generateEventTitle(mainTitle, category);
      
      // Calcola closesAt (7 giorni da ora per default)
      const horizonDays = storyline.momentum > 50 ? 3 : 7; // Momentum alto = closes più vicino
      const closesAt = computeClosesAt(horizonDays, horizonDays + 3, storyline.momentum / 100, now);
      
      // Genera criteria
      const entity = extractMainEntity(mainTitle);
      const resolutionCriteriaYes = `L'evento "${entity}" si verifica come descritto nelle fonti ufficiali entro ${closesAt.toLocaleDateString('it-IT')}.`;
      const resolutionCriteriaNo = `L'evento "${entity}" non si verifica come descritto nelle fonti ufficiali entro ${closesAt.toLocaleDateString('it-IT')}.`;

      // Crea candidato
      const candidate: GeneratedEventCandidate = {
        title: eventTitle,
        description: mainTitle,
        category,
        closesAt,
        resolutionAuthorityHost: host,
        resolutionAuthorityType: authorityType,
        resolutionCriteriaYes,
        resolutionCriteriaNo,
        sourceStorylineId: storyline.clusterId,
        templateId: 'universal-v1',
        momentum: storyline.momentum,
        novelty: storyline.novelty,
      };

      // Verifica candidato
      const verification = verifyCandidate(candidate);
      if (!verification.ok) {
        if (DEBUG) {
          console.log(`[Event Generation V2] Candidate rejected: ${verification.reason}`);
        }
        continue;
      }

      candidates.push(candidate);

      if (DEBUG) {
        console.log(`[Event Generation V2] Generated candidate: ${eventTitle}`);
      }
    } catch (error) {
      if (DEBUG) {
        console.error(`[Event Generation V2] Error processing storyline ${storyline.clusterId}:`, error);
      }
      continue;
    }
  }

  if (DEBUG) {
    console.log(`[Event Generation V2] Generated ${candidates.length} candidates from ${eligible.length} storylines`);
  }

  return candidates;
}
