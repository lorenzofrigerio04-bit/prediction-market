import type { CandidateDetailView } from "../entities/candidate-detail-view.entity.js";
import type { CandidateListView } from "../entities/candidate-list-view.entity.js";

export type BuildCandidateViewsInput = Readonly<{
  list_view: CandidateListView;
  detail_view: CandidateDetailView;
}>;

export interface CandidateViewBuilder {
  buildCandidateListView(input: BuildCandidateViewsInput): CandidateListView;
  buildCandidateDetailView(input: BuildCandidateViewsInput): CandidateDetailView;
}
