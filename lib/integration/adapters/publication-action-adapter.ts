export interface LegacySelectedCandidate {
  title: string;
  description?: string | null;
  category: string;
  closesAt: Date | string;
  resolutionAuthorityHost?: string | null;
  resolutionSourceUrl?: string | null;
  resolutionCriteriaYes?: string | null;
  resolutionCriteriaNo?: string | null;
  [key: string]: unknown;
}

export interface PublishableCandidateContract {
  title: string;
  description: string | null;
  category: string;
  closesAt: Date;
  resolution: {
    sourceUrl: string | null;
    authorityHost: string | null;
    criteriaYes: string | null;
    criteriaNo: string | null;
  };
  passthrough: Record<string, unknown>;
}

function normalizeOptional(value?: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toPublishableCandidateContract(
  candidate: LegacySelectedCandidate
): PublishableCandidateContract {
  const {
    title,
    description,
    category,
    closesAt,
    resolutionAuthorityHost,
    resolutionSourceUrl,
    resolutionCriteriaYes,
    resolutionCriteriaNo,
    ...rest
  } = candidate;

  return {
    title: title.trim(),
    description: normalizeOptional(description),
    category: category.trim(),
    closesAt: closesAt instanceof Date ? closesAt : new Date(closesAt),
    resolution: {
      sourceUrl: normalizeOptional(resolutionSourceUrl),
      authorityHost: normalizeOptional(resolutionAuthorityHost),
      criteriaYes: normalizeOptional(resolutionCriteriaYes),
      criteriaNo: normalizeOptional(resolutionCriteriaNo),
    },
    passthrough: rest,
  };
}
