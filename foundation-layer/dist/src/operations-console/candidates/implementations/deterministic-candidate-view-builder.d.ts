import type { CandidateDetailView } from "../entities/candidate-detail-view.entity.js";
import type { CandidateListView } from "../entities/candidate-list-view.entity.js";
import type { BuildCandidateViewsInput, CandidateViewBuilder } from "../interfaces/candidate-view-builder.js";
export declare class DeterministicCandidateViewBuilder implements CandidateViewBuilder {
    buildCandidateListView(input: BuildCandidateViewsInput): CandidateListView;
    buildCandidateDetailView(input: BuildCandidateViewsInput): CandidateDetailView;
}
//# sourceMappingURL=deterministic-candidate-view-builder.d.ts.map