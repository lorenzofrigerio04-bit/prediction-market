/**
 * Event Generation V2 Types
 * BLOCCO 4: Generazione eventi da storyline
 */

import type { EligibleStoryline } from '../storyline-engine/types';

export type GeneratedEventCandidate = {
  title: string;
  description: string;
  category: string;
  closesAt: Date;
  resolutionAuthorityHost: string;
  resolutionAuthorityType: 'OFFICIAL' | 'REPUTABLE';
  resolutionCriteria: { yes: string; no: string };
  sourceStorylineId: string;
  templateId: string;
};

export type StorylineWithSignals = EligibleStoryline & {
  signals: Array<{
    id: string;
    title: string;
    snippet?: string | null;
    publishedAt: Date;
    host: string;
  }>;
};
