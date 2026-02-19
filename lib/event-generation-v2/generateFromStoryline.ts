/**
 * Generazione Eventi da Storyline
 * BLOCCO 4: Generazione eventi da EligibleStoryline[]
 * 
 * Passi:
 * 1) Deriva category con heuristic mapping (host/topic keywords)
 * 2) Estrai topic/entityA/entityB
 * 3) Seleziona template compatibili
 * 4) Genera 1-3 candidate events per storyline max
 * 5) Passa ogni candidate al verifier
 */

import type { EligibleStoryline } from '../storyline-engine/types';
import type { SourceSignalLite } from '../storyline-engine/types';
import type { GeneratedEventCandidate, StorylineWithSignals } from './types';
import type { EventTemplate } from '../event-templates/types';
import type { TemplateContext } from '../event-templates/context';
import type { Category } from '../event-templates/types';
import { getTemplatesByCategory, getTemplatesByAuthority } from '../event-templates/catalog';
import { computeClosesAt } from './closesAt';
import { verifyCandidate } from '../event-verifier/verify';

const DEBUG = process.env.EVENT_GEN_DEBUG === 'true';

/**
 * Mapping host -> category (euristico)
 */
const HOST_CATEGORY_MAP: Record<string, Category> = {
  'sport': 'Sport',
  'calcio': 'Sport',
  'football': 'Sport',
  'politica': 'Politica',
  'governo': 'Politica',
  'camera': 'Politica',
  'senato': 'Politica',
  'economia': 'Economia',
  'finanza': 'Economia',
  'borsa': 'Economia',
  'tech': 'Tecnologia',
  'tecnologia': 'Tecnologia',
  'cultura': 'Cultura',
  'cinema': 'Cultura',
  'musica': 'Cultura',
  'scienza': 'Scienza',
  'ricerca': 'Scienza',
  'intrattenimento': 'Intrattenimento',
  'spettacolo': 'Intrattenimento',
};

/**
 * Keywords per categoria
 */
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Sport: ['partita', 'calcio', 'sport', 'squadra', 'campionato', 'gara', 'match', 'vs'],
  Politica: ['elezioni', 'governo', 'parlamento', 'politica', 'partito', 'ministro', 'presidente'],
  Economia: ['borsa', 'economia', 'finanza', 'pil', 'inflazione', 'tasso', 'mercato'],
  Tecnologia: ['tech', 'tecnologia', 'software', 'app', 'startup', 'ai', 'intelligenza artificiale'],
  Cultura: ['cinema', 'film', 'musica', 'libro', 'arte', 'cultura', 'festival'],
  Scienza: ['scienza', 'ricerca', 'studio', 'scoperta', 'esperimento', 'missione'],
  Intrattenimento: ['spettacolo', 'serie', 'tv', 'show', 'premio', 'festival', 'notizia', 'news', 'aggiornamento', 'breaking', 'cronaca', 'report', 'comunicato'],
};

/**
 * Estrae categoria da storyline usando host e keywords
 */
function deriveCategory(
  storyline: EligibleStoryline,
  signals: SourceSignalLite[]
): Category {
  const hostLower = storyline.authorityHost.toLowerCase();
  
  // Controlla mapping host diretto
  for (const [key, category] of Object.entries(HOST_CATEGORY_MAP)) {
    if (hostLower.includes(key)) {
      return category;
    }
  }
  
  // Controlla keywords nei titoli
  const allText = signals.map((s) => `${s.title} ${s.snippet || ''}`).join(' ').toLowerCase();
  
  const categoryScores: Record<Category, number> = {
    Sport: 0,
    Politica: 0,
    Economia: 0,
    Tecnologia: 0,
    Cultura: 0,
    Scienza: 0,
    Intrattenimento: 0,
  };
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (allText.includes(keyword)) {
        categoryScores[category as Category]++;
      }
    }
  }
  
  // Trova categoria con score più alto
  let maxCategory: Category = 'Sport';
  let maxScore = 0;
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      maxCategory = category as Category;
    }
  }
  
  return maxCategory;
}

/**
 * Estrae entityA/entityB/topic dal testo usando euristiche
 */
function extractEntities(
  signals: SourceSignalLite[]
): { entityA?: string; entityB?: string; topic?: string } {
  const titles = signals.map((s) => s.title);
  const mainTitle = titles[0] || '';
  
  // Estrai entityA: frase nominale principale (top token bigram)
  // Euristica semplice: prendi le prime 2-3 parole significative del titolo
  const words = mainTitle
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['sarà', 'saranno', 'verrà', 'verranno'].includes(w));
  
  let entityA: string | undefined;
  if (words.length >= 2) {
    entityA = words.slice(0, 2).join(' ');
  } else if (words.length === 1) {
    entityA = words[0];
  }
  
  // Per sport: cerca pattern "TEAM vs TEAM"
  const vsMatch = mainTitle.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+vs\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (vsMatch) {
    return {
      entityA: vsMatch[1].trim(),
      entityB: vsMatch[2].trim(),
      topic: undefined,
    };
  }
  
  // Estrai topic: ultime 2-3 parole significative o keyword principale
  let topic: string | undefined;
  if (words.length >= 3) {
    topic = words.slice(-2).join(' ');
  }
  
  return { entityA, entityB: undefined, topic };
}

/**
 * Estrae numero dal testo (per template threshold)
 */
function extractNumber(text: string): number | null {
  const match = text.match(/(\d{1,3}(?:\.\d+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    if (!Number.isNaN(num)) {
      return num;
    }
  }
  return null;
}

/**
 * Genera eventi da una storyline
 */
export function generateEventsFromStoryline(
  storyline: StorylineWithSignals,
  now: Date = new Date()
): GeneratedEventCandidate[] {
  const candidates: GeneratedEventCandidate[] = [];
  
  // 1) Deriva category
  const category = deriveCategory(storyline, storyline.signals);
  
  if (DEBUG) {
    console.log(`[EVENT_GEN] Storyline ${storyline.id}: category=${category}`);
  }
  
  // 2) Estrai entities/topic
  const { entityA, entityB, topic } = extractEntities(storyline.signals);
  
  if (DEBUG) {
    console.log(`[EVENT_GEN] Storyline ${storyline.id}: entityA=${entityA}, entityB=${entityB}, topic=${topic}`);
  }
  
  // 3) Seleziona template compatibili
  const categoryTemplates = getTemplatesByCategory(category);
  // Filtra per authority: OFFICIAL può usare solo OFFICIAL, REPUTABLE può usare entrambi
  const compatibleTemplates = categoryTemplates.filter((t) => {
    if (storyline.authorityType === 'OFFICIAL') {
      return t.requiredAuthority === 'OFFICIAL';
    }
    // REPUTABLE può usare sia OFFICIAL che REPUTABLE
    return true;
  });
  
  if (compatibleTemplates.length === 0) {
    if (DEBUG) {
      console.log(`[EVENT_GEN] Storyline ${storyline.id}: nessun template compatibile`);
    }
    return [];
  }
  
  if (DEBUG) {
    console.log(`[EVENT_GEN] Storyline ${storyline.id}: ${compatibleTemplates.length} template compatibili`);
  }
  
  // 4) Genera 1-3 candidate events (max 3)
  const templatesToUse = compatibleTemplates.slice(0, 3);
  
  for (const template of templatesToUse) {
    // Calcola closesAt
    const closesAt = computeClosesAt(
      template.horizonDaysMin,
      template.horizonDaysMax,
      storyline.momentum,
      now
    );
    
    // Crea context
    const ctx: TemplateContext = {
      storylineId: storyline.id,
      authorityType: storyline.authorityType,
      authorityHost: storyline.authorityHost,
      entityA,
      entityB,
      topic,
      closesAt,
    };
    
    // Genera question e criteria
    const question = template.question(ctx);
    const resolutionCriteria = template.resolutionCriteria(ctx);
    
    // Crea candidate
    const candidate: GeneratedEventCandidate = {
      title: question,
      description: storyline.signals[0]?.snippet || storyline.signals[0]?.title || '',
      category,
      closesAt,
      resolutionAuthorityHost: storyline.authorityHost,
      resolutionAuthorityType: storyline.authorityType,
      resolutionCriteria,
      sourceStorylineId: storyline.id,
      templateId: template.id,
    };
    
    // 5) Verifica candidate
    const verification = verifyCandidate(candidate, now, storyline.authorityHost);
    
    if (!verification.ok) {
      if (DEBUG) {
        console.log(`[EVENT_GEN] Storyline ${storyline.id}, template ${template.id}: BOCCIATO - ${verification.reasons?.join('; ') || 'unknown'}`);
      }
      continue;
    }
    
    if (DEBUG) {
      console.log(`[EVENT_GEN] Storyline ${storyline.id}, template ${template.id}: APPROVATO`);
    }
    
    candidates.push(candidate);
  }
  
  return candidates;
}
