import { createCandidateDetailView } from "../entities/candidate-detail-view.entity.js";
import { createCandidateListView } from "../entities/candidate-list-view.entity.js";
import { validateCandidateDetailView } from "../../validators/validate-candidate-detail-view.js";
import { validateCandidateListView } from "../../validators/validate-candidate-list-view.js";
export class DeterministicCandidateViewBuilder {
    buildCandidateListView(input) {
        const report = validateCandidateListView(input.list_view);
        if (!report.isValid) {
            throw new Error(`Invalid CandidateListView: ${report.issues.map((issue) => issue.code).join(",")}`);
        }
        return createCandidateListView(input.list_view);
    }
    buildCandidateDetailView(input) {
        const report = validateCandidateDetailView(input.detail_view);
        if (!report.isValid) {
            throw new Error(`Invalid CandidateDetailView: ${report.issues.map((issue) => issue.code).join(",")}`);
        }
        return createCandidateDetailView(input.detail_view);
    }
}
//# sourceMappingURL=deterministic-candidate-view-builder.js.map