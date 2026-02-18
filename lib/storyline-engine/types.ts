/**
 * Types for Storyline Engine
 */

export type SourceSignalLite = {
  id: string;
  title: string;
  snippet?: string | null;
  publishedAt: Date;
  host: string;
  sourceType: string;
};

export type StorylineInput = {
  id: string;
  signals: SourceSignalLite[];
};

export type EligibleStoryline = {
  id: string;
  signalsCount: number;
  momentum: number;
  novelty: number;
  authorityType: "OFFICIAL" | "REPUTABLE";
  authorityHost: string;
  oldestSignalAt: Date;
  newestSignalAt: Date;
};

export type AuthorityResult =
  | { type: "OFFICIAL"; host: string }
  | { type: "REPUTABLE"; host: string }
  | null;
