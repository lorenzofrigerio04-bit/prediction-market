export interface SubmissionReviewSource {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  closesAt: Date | string;
  status: string;
  reviewNotes?: string | null;
  createdAt?: Date | string;
}

export interface ReviewQueueViewModel {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  closesAtIso: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "UNKNOWN";
  reviewNotes: string | null;
  createdAtIso: string | null;
}

function normalizeStatus(status: string): ReviewQueueViewModel["status"] {
  switch (status) {
    case "PENDING":
    case "APPROVED":
    case "REJECTED":
      return status;
    default:
      return "UNKNOWN";
  }
}

function toIsoDate(value: Date | string | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function toReviewQueueViewModel(
  submission: SubmissionReviewSource
): ReviewQueueViewModel {
  return {
    id: submission.id,
    title: submission.title,
    subtitle: submission.description?.trim() || null,
    category: submission.category,
    closesAtIso: toIsoDate(submission.closesAt) ?? new Date(0).toISOString(),
    status: normalizeStatus(submission.status),
    reviewNotes: submission.reviewNotes?.trim() || null,
    createdAtIso: toIsoDate(submission.createdAt),
  };
}
