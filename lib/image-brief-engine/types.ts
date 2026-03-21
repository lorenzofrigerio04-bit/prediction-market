/**
 * Image Brief Engine - Type definitions
 *
 * Generates psychologically engaging, rule-compliant image briefs from
 * CandidateEvent + chosen title. Images are decorative assets and do not
 * affect market resolution.
 */

import type { ImageBrief } from '../event-gen-v2/types';

/** Re-export ImageBrief for consumers */
export type { ImageBrief } from '../event-gen-v2/types';

/** Style preset IDs - maps to visual style for image generation */
export type StylePresetId =
  | 'editorial_photo'
  | 'cinematic_noir'
  | 'sports_action'
  | 'market_chart_abstract'
  | 'political_symbolic'
  | 'minimal_iconic';

/** Input for generateImageBrief - works with CandidateEvent or Event subset */
export interface ImageBriefInput {
  title: string;
  category: string;
  description?: string | null;
  templateId?: string | null;
}

/** Style preset definition */
export interface StylePreset {
  id: StylePresetId;
  name: string;
  promptFragment: string;
  defaultMoodTags: string[];
  compositionHint: string;
  negativePromptFragment: string;
}

/** Validation result for ImageBrief */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
