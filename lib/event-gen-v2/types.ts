/**
 * Canonical pipeline candidate type for event generation v2.
 * Used by scoring, dedup, selection, and publishing modules.
 */

export interface Candidate {
  title: string;
  description: string;
  category: string;
  closesAt: Date;
  resolutionAuthorityHost: string;
  resolutionAuthorityType: string;
  resolutionCriteriaYes: string;
  resolutionCriteriaNo: string;
  sourceStorylineId: string;
  templateId: string;
  resolutionSourceUrl?: string | null;
  resolutionSourceSecondary?: string | null;
  resolutionSourceTertiary?: string | null;
  resolutionCriteriaFull?: string | null;
  edgeCasePolicyRef?: string | null;
  marketType?: string | null;
  outcomes?: Array<{ key: string; label: string }> | null;
  timezone?: string | null;
  sportLeague?: string | null;
  footballDataMatchId?: number | null;
  creationMetadata?: Record<string, unknown> | null;
}

export interface ImageBrief {
  style?: string;
  subject?: string;
  mood?: string;
  palette?: string[];
  avoidElements?: string[];
}
