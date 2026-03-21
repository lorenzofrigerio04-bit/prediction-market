import { describe, expect, it } from "vitest";
import { createEntityVersion } from "../../src/value-objects/entity-version.vo.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
import { createCanonicalEventIntelligenceId, } from "../../src/event-intelligence/value-objects/event-intelligence-ids.vo.js";
import { createDeadlineResolution } from "../../src/market-design/deadlines/entities/deadline-resolution.entity.js";
import { DeadlineBasisType } from "../../src/market-design/enums/deadline-basis-type.enum.js";
import { createDeadlineResolutionId, createSourceHierarchySelectionId, } from "../../src/market-design/value-objects/market-design-ids.vo.js";
import { createSourceHierarchySelection } from "../../src/market-design/source-hierarchy/entities/source-hierarchy-selection.entity.js";
import { SourceClass } from "../../src/sources/enums/source-class.enum.js";
import { ContractType } from "../../src/market-design/enums/contract-type.enum.js";
import { createRaceTarget } from "../../src/frontier-markets/race/entities/race-target.entity.js";
import { createRaceMarketDefinition } from "../../src/frontier-markets/race/entities/race-market-definition.entity.js";
import { createRaceTargetKey } from "../../src/frontier-markets/value-objects/race-target-key.vo.js";
import { createRaceMarketDefinitionId } from "../../src/frontier-markets/value-objects/frontier-market-ids.vo.js";
import { RaceValidationStatus } from "../../src/frontier-markets/enums/race-validation-status.enum.js";
import { WinningConditionType } from "../../src/frontier-markets/enums/winning-condition-type.enum.js";
import { createCompatibilityNote, createDisplayLabel, createSemanticDefinition, } from "../../src/frontier-markets/value-objects/frontier-text.vo.js";
import { MarketDraftPipelineCompatibilityAdapter } from "../../src/frontier-markets/compatibility/implementations/market-draft-pipeline-compatibility.adapter.js";
import { PublishingEngineCompatibilityAdapter } from "../../src/frontier-markets/compatibility/implementations/publishing-engine-compatibility.adapter.js";
import { EditorialPipelineCompatibilityAdapter } from "../../src/frontier-markets/compatibility/implementations/editorial-pipeline-compatibility.adapter.js";
import { AdvancedCompatibilityStatus } from "../../src/frontier-markets/enums/advanced-compatibility-status.enum.js";
import { DeterministicAdvancedContractValidator } from "../../src/frontier-markets/validation/implementations/deterministic-advanced-contract-validator.js";
import { AdvancedValidationStatus } from "../../src/frontier-markets/enums/advanced-validation-status.enum.js";
import { createAdvancedContractValidationReport } from "../../src/frontier-markets/validation/entities/advanced-contract-validation-report.entity.js";
import { createAdvancedContractValidationReportId } from "../../src/frontier-markets/value-objects/frontier-market-ids.vo.js";
import { createInvariantCheck } from "../../src/frontier-markets/value-objects/invariant-check.vo.js";
import * as foundation from "../../src/index.js";
const makeDeadlineResolution = () => createDeadlineResolution({
    id: createDeadlineResolutionId("dlr_fmhardn001"),
    canonical_event_id: createCanonicalEventIntelligenceId("cevt_fmhardn001"),
    event_deadline: createTimestamp("2026-12-31T10:00:00.000Z"),
    market_close_time: createTimestamp("2026-12-31T09:00:00.000Z"),
    resolution_cutoff_nullable: null,
    timezone: "UTC",
    deadline_basis_type: DeadlineBasisType.EVENT_TIME,
    deadline_basis_reference: "canonical_event.time_window.end_at",
    confidence: 0.9,
    warnings: [],
});
const makeSourceHierarchySelection = () => createSourceHierarchySelection({
    id: createSourceHierarchySelectionId("shs_fmhardn001"),
    canonical_event_id: createCanonicalEventIntelligenceId("cevt_fmhardn001"),
    candidate_source_classes: [SourceClass.OFFICIAL, SourceClass.MEDIA],
    selected_source_priority: [
        { source_class: SourceClass.OFFICIAL, priority_rank: 1 },
        { source_class: SourceClass.MEDIA, priority_rank: 2 },
    ],
    source_selection_reason: "official first",
    source_confidence: 0.9,
});
const makeRaceDefinition = (status, activeSecond = true) => createRaceMarketDefinition({
    id: createRaceMarketDefinitionId("frc_fmhardn001"),
    version: createEntityVersion(1),
    parent_canonical_event_id_nullable: createCanonicalEventIntelligenceId("cevt_fmhardn001"),
    race_targets: [
        createRaceTarget({
            target_key: createRaceTargetKey("alpha"),
            display_label: createDisplayLabel("Alpha"),
            semantic_definition: createSemanticDefinition("Alpha happens first"),
            active: true,
            ordering_priority_nullable: 1,
        }),
        createRaceTarget({
            target_key: createRaceTargetKey("beta"),
            display_label: createDisplayLabel("Beta"),
            semantic_definition: createSemanticDefinition("Beta happens first"),
            active: activeSecond,
            ordering_priority_nullable: 2,
        }),
    ],
    winning_condition: {
        type: WinningConditionType.FIRST_TO_OCCUR,
        tie_break_policy: "lowest_ordering_priority",
    },
    deadline_resolution: makeDeadlineResolution(),
    source_hierarchy_selection: makeSourceHierarchySelection(),
    race_validation_status: status,
    metadata: {},
});
describe("Frontier hardening: ContractType and adapters", () => {
    it("uses canonical ContractType and does not expose duplicate frontier contract enum", () => {
        expect(foundation.ContractType.RACE).toBe("race");
        expect("FrontierContractType" in foundation).toBe(false);
        expect("FrontierContractType" in foundation.frontierMarkets).toBe(false);
    });
    it("does not promote invalid race contract in market-draft or publishing adapters", () => {
        const invalidRace = makeRaceDefinition(RaceValidationStatus.INVALID);
        const marketDraftResult = new MarketDraftPipelineCompatibilityAdapter().adapt(invalidRace);
        const publishingResult = new PublishingEngineCompatibilityAdapter().adapt(invalidRace);
        expect(marketDraftResult.status).toBe(AdvancedCompatibilityStatus.INCOMPATIBLE);
        expect(marketDraftResult.mapped_artifact["readiness"]).toBe(AdvancedCompatibilityStatus.INCOMPATIBLE);
        expect(publishingResult.status).toBe(AdvancedCompatibilityStatus.INCOMPATIBLE);
        expect(publishingResult.mapped_artifact["readiness"]).toBe(AdvancedCompatibilityStatus.INCOMPATIBLE);
    });
    it("keeps invalid contracts reviewable in editorial adapter without promoting readiness", () => {
        const invalidRace = makeRaceDefinition(RaceValidationStatus.INVALID);
        const editorialResult = new EditorialPipelineCompatibilityAdapter().adapt(invalidRace);
        expect(editorialResult.status).toBe(AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS);
        expect(editorialResult.mapped_artifact["needs_manual_review"]).toBe(true);
    });
    it("normalizes validator report status with blocking issues", () => {
        const weakRace = makeRaceDefinition(RaceValidationStatus.REVIEW_REQUIRED, false);
        const report = new DeterministicAdvancedContractValidator().validate({
            contract_type: ContractType.RACE,
            payload: weakRace,
        });
        expect(report.validation_status).toBe(AdvancedValidationStatus.INVALID);
        expect(report.blocking_issues.length).toBeGreaterThan(0);
    });
    it("blocks promotion when validation_status is not ready", () => {
        const validRace = makeRaceDefinition(RaceValidationStatus.VALID);
        const invalidValidationReport = createAdvancedContractValidationReport({
            id: createAdvancedContractValidationReportId("fvr_fmhardn002"),
            contract_type: ContractType.RACE,
            validation_status: AdvancedValidationStatus.INVALID,
            blocking_issues: [{ code: "RACE_MIN_TARGETS", message: "invalid", path: "/" }],
            warnings: [],
            checked_invariants: [
                createInvariantCheck({
                    code: "RACE_MIN_TARGETS",
                    passed: false,
                    message: "race requires at least two active targets",
                }),
            ],
            compatibility_notes: [createCompatibilityNote("invalid frontier validation status")],
        });
        const marketDraftResult = new MarketDraftPipelineCompatibilityAdapter().adapt(validRace, invalidValidationReport);
        const publishingResult = new PublishingEngineCompatibilityAdapter().adapt(validRace, invalidValidationReport);
        const editorialResult = new EditorialPipelineCompatibilityAdapter().adapt(validRace, invalidValidationReport);
        expect(marketDraftResult.status).toBe(AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS);
        expect(marketDraftResult.mapped_artifact["readiness"]).toBe(AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS);
        expect(publishingResult.status).toBe(AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS);
        expect(publishingResult.mapped_artifact["readiness"]).toBe(AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS);
        expect(editorialResult.status).toBe(AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS);
        expect(editorialResult.mapped_artifact["needs_manual_review"]).toBe(true);
    });
});
//# sourceMappingURL=hardening-contracttype-and-adapters.spec.js.map