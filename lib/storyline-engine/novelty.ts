/**
 * Calculate novelty score (0-100) for a storyline
 * Combines ageScore (70%) and uniqScore (30%)
 */

import type { StorylineInput, SourceSignalLite } from './types';

/**
 * Tokenize text into a set of words (top 20 unique tokens)
 * Same logic as Jaccard clustering
 */
function tokenize(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter((word) => word.length > 2) // Filter out very short words
    .slice(0, 20); // Take top 20 tokens
  
  return new Set(tokens);
}

/**
 * Calculate Jaccard similarity between two sets
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  const intersection = new Set(Array.from(setA).filter((x) => setB.has(x)));
  const union = new Set([...Array.from(setA), ...Array.from(setB)]);

  if (union.size === 0) {
    return 0;
  }

  return intersection.size / union.size;
}

/**
 * Get token set for a storyline (from title + snippet of all signals)
 */
function getStorylineTokens(storyline: StorylineInput): Set<string> {
  const allText = storyline.signals
    .map((s) => `${s.title} ${s.snippet || ''}`)
    .join(' ');
  return tokenize(allText);
}

/**
 * Calculate ageScore based on oldest signal
 * ageScore = clamp(100 - (ageHours * 5), 0, 100)
 */
function calculateAgeScore(
  oldestSignalAt: Date,
  now: Date = new Date()
): number {
  const ageMs = now.getTime() - oldestSignalAt.getTime();
  const ageHours = ageMs / (60 * 60 * 1000);
  const ageScore = Math.max(0, Math.min(100, 100 - ageHours * 5));
  return Math.round(ageScore);
}

/**
 * Calculate uniqScore by comparing with other storylines
 * Performance optimization: if > 200 clusters, compare only with top 20 by token overlap
 */
function calculateUniqScore(
  currentStoryline: StorylineInput,
  allStorylines: StorylineInput[]
): number {
  const currentTokens = getStorylineTokens(currentStoryline);
  
  if (currentTokens.size === 0) {
    return 0;
  }

  const otherStorylines = allStorylines.filter((s) => s.id !== currentStoryline.id);
  
  if (otherStorylines.length === 0) {
    return 100; // First storyline is unique
  }

  let maxSim = 0;

  if (otherStorylines.length <= 200) {
    // Full pairwise comparison
    for (const other of otherStorylines) {
      const otherTokens = getStorylineTokens(other);
      if (otherTokens.size === 0) continue;
      
      const sim = jaccardSimilarity(currentTokens, otherTokens);
      if (sim > maxSim) {
        maxSim = sim;
      }
    }
  } else {
    // Performance optimization: compare only with top 20 by token overlap
    const similarities: Array<{ storyline: StorylineInput; sim: number }> = [];
    
    for (const other of otherStorylines) {
      const otherTokens = getStorylineTokens(other);
      if (otherTokens.size === 0) continue;
      
      const sim = jaccardSimilarity(currentTokens, otherTokens);
      similarities.push({ storyline: other, sim });
    }
    
    // Sort by similarity descending and take top 20
    similarities.sort((a, b) => b.sim - a.sim);
    const top20 = similarities.slice(0, 20);
    
    maxSim = top20.length > 0 ? top20[0].sim : 0;
  }

  const uniqScore = Math.max(0, Math.min(100, Math.round((1 - maxSim) * 100)));
  return uniqScore;
}

/**
 * Calculate novelty score for a storyline
 * novelty = round(0.7 * ageScore + 0.3 * uniqScore)
 */
export function calculateNovelty(
  storyline: StorylineInput,
  allStorylines: StorylineInput[],
  now: Date = new Date()
): number {
  if (storyline.signals.length === 0) {
    return 0;
  }

  // Find oldest signal
  const oldestSignalAt = storyline.signals.reduce((oldest, signal) => {
    return signal.publishedAt < oldest ? signal.publishedAt : oldest;
  }, storyline.signals[0].publishedAt);

  const ageScore = calculateAgeScore(oldestSignalAt, now);
  const uniqScore = calculateUniqScore(storyline, allStorylines);

  const novelty = Math.round(0.7 * ageScore + 0.3 * uniqScore);
  return Math.max(0, Math.min(100, novelty));
}
