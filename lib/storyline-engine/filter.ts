/**
 * Filter storylines based on eligibility criteria
 */

import { STORYLINE_CONFIG } from './config';
import { calculateMomentum } from './momentum';
import { calculateNovelty } from './novelty';
import { determineAuthority } from './authority';
import type { StorylineInput, EligibleStoryline } from './types';

/**
 * Check if a storyline is eligible based on all filter criteria
 * 
 * Rules (in fixed order):
 * 1. signalsCount >= MIN_SIGNALS
 * 2. ageHours <= MAX_AGE_HOURS
 * 3. momentum >= MIN_MOMENTUM
 * 4. novelty >= MIN_NOVELTY
 * 5. authority must be defined (brutal rule)
 */
export function filterStorylines(
  storylines: StorylineInput[],
  now: Date = new Date()
): EligibleStoryline[] {
  const eligible: EligibleStoryline[] = [];

  for (const storyline of storylines) {
    const signalsCount = storyline.signals.length;

    // Rule 1: Minimum signals
    if (signalsCount < STORYLINE_CONFIG.MIN_SIGNALS) {
      continue;
    }

    // Find oldest and newest signals
    const oldestSignalAt = storyline.signals.reduce((oldest, signal) => {
      return signal.publishedAt < oldest ? signal.publishedAt : oldest;
    }, storyline.signals[0].publishedAt);

    const newestSignalAt = storyline.signals.reduce((newest, signal) => {
      return signal.publishedAt > newest ? signal.publishedAt : newest;
    }, storyline.signals[0].publishedAt);

    // Rule 2: Maximum age
    const ageMs = now.getTime() - oldestSignalAt.getTime();
    const ageHours = ageMs / (60 * 60 * 1000);
    if (ageHours > STORYLINE_CONFIG.MAX_AGE_HOURS) {
      continue;
    }

    // Calculate metrics
    const momentum = calculateMomentum(storyline.signals, now);
    const novelty = calculateNovelty(storyline, storylines, now);
    const authority = determineAuthority(storyline.signals);

    // Rule 3: Minimum momentum
    if (momentum < STORYLINE_CONFIG.MIN_MOMENTUM) {
      continue;
    }

    // Rule 4: Minimum novelty
    if (novelty < STORYLINE_CONFIG.MIN_NOVELTY) {
      continue;
    }

    // Rule 5: Authority must be OFFICIAL or REPUTABLE (no UNKNOWN/NONE)
    if (!authority || (authority.type as string) === 'UNKNOWN' || (authority.type as string) === 'NONE') {
      continue;
    }

    // All checks passed - storyline is eligible
    eligible.push({
      id: storyline.id,
      signalsCount,
      momentum,
      novelty,
      authorityType: authority.type,
      authorityHost: authority.host,
      oldestSignalAt,
      newestSignalAt,
    });
  }

  return eligible;
}
