export interface LegacySubmissionPayload {
  title: string;
  description?: string | null;
  category: string;
  closesAt: string | Date;
  resolutionSource?: string | null;
  notifyPhone?: string | null;
}

export interface CandidateDraftContract {
  title: string;
  description: string | null;
  category: string;
  closesAt: Date;
  resolutionSourceUrl: string | null;
  metadata: {
    source: "community_submit" | "admin_create";
    notifyPhone: string | null;
  };
}

/** Admin POST body shape for event create (MDE path). */
export interface AdminEventCreatePayload {
  title: string;
  description?: string | null;
  category: string;
  closesAt: Date;
  resolutionSourceUrl: string;
  resolutionNotes?: string | null;
}

function normalizeCategory(category: string): string {
  return category.trim();
}

function normalizeOptional(value?: string | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toCandidateDraftContract(
  payload: LegacySubmissionPayload
): CandidateDraftContract {
  return {
    title: payload.title.trim(),
    description: normalizeOptional(payload.description),
    category: normalizeCategory(payload.category),
    closesAt:
      payload.closesAt instanceof Date
        ? payload.closesAt
        : new Date(payload.closesAt),
    resolutionSourceUrl: normalizeOptional(payload.resolutionSource),
    metadata: {
      source: "community_submit",
      notifyPhone: normalizeOptional(payload.notifyPhone),
    },
  };
}

/**
 * Maps admin POST body to CandidateDraftContract for MDE path.
 * Used by POST /api/admin/events (MDE-only create).
 */
export function adminBodyToCandidateDraftContract(
  payload: AdminEventCreatePayload
): CandidateDraftContract {
  const desc =
    typeof payload.description === "string" && payload.description.trim()
      ? payload.description.trim()
      : typeof payload.resolutionNotes === "string" && payload.resolutionNotes.trim()
        ? payload.resolutionNotes.trim()
        : null;
  return {
    title: payload.title.trim(),
    description: desc,
    category: normalizeCategory(payload.category),
    closesAt: payload.closesAt instanceof Date ? payload.closesAt : new Date(payload.closesAt),
    resolutionSourceUrl: payload.resolutionSourceUrl.trim(),
    metadata: {
      source: "admin_create",
      notifyPhone: null,
    },
  };
}
