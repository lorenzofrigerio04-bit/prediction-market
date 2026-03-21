import { describe, expect, it } from "vitest";
import { createEntityVersion } from "../../src/value-objects/entity-version.vo.js";
import { ContractType } from "../../src/market-design/enums/contract-type.enum.js";
import { CannibalizationStatus, DerivativeType, DeterministicCannibalizationChecker, DeterministicExpansionValidator, ExpansionValidationStatus, FamilyCompatibilityStatus, FamilyEditorialCompatibilityAdapter, FamilyStatus, GenerationStatus, MarketFamilyMarketDraftPipelineAdapter, MarketFamilyPublicationReadyAdapter, MarketFamilyPublishableCandidateAdapter, RelationshipStrength, RelationshipType, SatelliteRole, SourceContextType, StrategyType, createCannibalizationCheckResult, createCannibalizationCheckResultId, createDerivativeMarketDefinition, createDerivativeMarketDefinitionId, createExpansionStrategy, createExpansionStrategyId, createExpansionValidationReport, createExpansionValidationReportId, createFamilyGenerationResult, createFamilyGenerationResultId, createFlagshipMarketSelection, createFlagshipMarketSelectionId, createMarketFamily, createMarketFamilyId, createMarketRelationship, createMarketRelationshipId, createSatelliteMarketDefinition, createSatelliteMarketDefinitionId, validateCannibalizationCheckResult, validateDerivativeMarketDefinition, validateExpansionStrategy, validateExpansionValidationReport, validateFamilyGenerationResult, validateFlagshipMarketSelection, validateMarketExpansionFamilyAggregate, validateMarketFamily, validateMarketFamilyCompatibility, validateMarketRelationship, validateSatelliteMarketDefinition, } from "../../src/market-expansion/index.js";
const makeMarketFamily = () => createMarketFamily({
    id: createMarketFamilyId("mfy_expand001"),
    version: createEntityVersion(1),
    family_key: "event-fed-rates",
    source_context_type: SourceContextType.CANONICAL_EVENT,
    source_context_ref: "cevt_expand001",
    flagship_market_ref: "mkt_flagship001",
    satellite_market_refs: ["mkt_satellite001"],
    derivative_market_refs: ["mkt_derivative001"],
    family_status: FamilyStatus.DRAFT,
    family_metadata: {
        context_hash: "hash-expand-001",
        generation_mode: "deterministic-v1",
        tags: ["macro"],
        notes: ["baseline family"],
    },
});
const makeFlagship = () => createFlagshipMarketSelection({
    id: createFlagshipMarketSelectionId("mfs_expand001"),
    version: createEntityVersion(1),
    source_context_ref: "cevt_expand001",
    selected_market_ref: "mkt_flagship001",
    selection_reason: "highest confidence",
    strategic_priority: 8,
    selection_confidence: 0.85,
});
const makeSatellite = () => createSatelliteMarketDefinition({
    id: createSatelliteMarketDefinitionId("msd_expand001"),
    version: createEntityVersion(1),
    parent_family_id: createMarketFamilyId("mfy_expand001"),
    parent_market_ref: "mkt_flagship001",
    market_ref: "mkt_satellite001",
    satellite_role: SatelliteRole.HEDGE,
    dependency_notes_nullable: "hedges flagship volatility",
    active: true,
});
const makeDerivative = () => createDerivativeMarketDefinition({
    id: createDerivativeMarketDefinitionId("mdd_expand001"),
    version: createEntityVersion(1),
    parent_family_id: createMarketFamilyId("mfy_expand001"),
    source_relation_ref: "rel_valid001",
    market_ref: "mkt_derivative001",
    derivative_type: DerivativeType.DEPENDENCY,
    dependency_strength: 0.8,
    active: true,
});
const makeRelationship = () => createMarketRelationship({
    id: createMarketRelationshipId("mrl_expand001"),
    source_market_ref: "mkt_flagship001",
    target_market_ref: "mkt_derivative001",
    relationship_type: RelationshipType.BLOCKS,
    relationship_strength: RelationshipStrength.HIGH,
    blocking_cannibalization: true,
    notes_nullable: "overlap risk",
});
const makeStrategy = () => createExpansionStrategy({
    id: createExpansionStrategyId("mes_expand001"),
    version: createEntityVersion(1),
    source_context_ref: "cevt_expand001",
    strategy_type: StrategyType.BALANCED,
    allowed_contract_types: [ContractType.BINARY, ContractType.SCALAR_BRACKET],
    max_satellite_count: 3,
    max_derivative_count: 2,
    anti_cannibalization_policy: "strict-non-overlap",
    expansion_notes_nullable: "balanced strategy",
});
const makeCannibalization = () => createCannibalizationCheckResult({
    id: createCannibalizationCheckResultId("mcc_expand001"),
    family_id: createMarketFamilyId("mfy_expand001"),
    checked_market_pairs: [{ source_market_ref: "mkt_flagship001", target_market_ref: "mkt_satellite001" }],
    blocking_conflicts: [],
    warnings: ["minor overlap"],
    check_status: CannibalizationStatus.WARNING,
});
const makeValidationReport = () => createExpansionValidationReport({
    id: createExpansionValidationReportId("mvr_expand001"),
    version: createEntityVersion(1),
    family_id: createMarketFamilyId("mfy_expand001"),
    validation_status: ExpansionValidationStatus.VALID_WITH_WARNINGS,
    blocking_issues: [],
    warnings: ["manual review advised"],
    checked_invariants: [{ code: "FLAGSHIP_PRESENT", passed: true, description: "flagship exists" }],
    compatibility_notes: ["compatible with existing pipeline contracts"],
});
const makeGenerationResult = () => createFamilyGenerationResult({
    id: createFamilyGenerationResultId("mgr_expand001"),
    version: createEntityVersion(1),
    market_family_id: createMarketFamilyId("mfy_expand001"),
    generated_market_refs: ["mkt_flagship001", "mkt_satellite001", "mkt_derivative001"],
    flagship_ref: "mkt_flagship001",
    generation_status: GenerationStatus.GENERATED,
    generation_confidence: 0.82,
    output_notes_nullable: "deterministic output",
});
describe("market-expansion module", () => {
    it("valid MarketFamily", () => {
        expect(validateMarketFamily(makeMarketFamily()).isValid).toBe(true);
    });
    it("invalid MarketFamily without flagship", () => {
        const invalid = { ...makeMarketFamily(), flagship_market_ref: "" };
        expect(validateMarketFamily(invalid).isValid).toBe(false);
    });
    it("valid FlagshipMarketSelection", () => {
        expect(validateFlagshipMarketSelection(makeFlagship()).isValid).toBe(true);
    });
    it("valid SatelliteMarketDefinition", () => {
        expect(validateSatelliteMarketDefinition(makeSatellite()).isValid).toBe(true);
    });
    it("invalid SatelliteMarketDefinition equal to flagship", () => {
        const invalid = { ...makeSatellite(), market_ref: "mkt_flagship001" };
        expect(validateSatelliteMarketDefinition(invalid).isValid).toBe(false);
    });
    it("valid DerivativeMarketDefinition", () => {
        expect(validateDerivativeMarketDefinition(makeDerivative()).isValid).toBe(true);
    });
    it("invalid DerivativeMarketDefinition with invalid source relation", () => {
        const invalid = { ...makeDerivative(), source_relation_ref: "invalid_relation001" };
        expect(validateDerivativeMarketDefinition(invalid).isValid).toBe(false);
    });
    it("valid MarketRelationship", () => {
        expect(validateMarketRelationship(makeRelationship()).isValid).toBe(true);
    });
    it("invalid MarketRelationship with blocking_cannibalization incoherence", () => {
        const invalid = { ...makeRelationship(), relationship_strength: RelationshipStrength.LOW };
        expect(validateMarketRelationship(invalid).isValid).toBe(false);
    });
    it("valid ExpansionStrategy", () => {
        expect(validateExpansionStrategy(makeStrategy()).isValid).toBe(true);
    });
    it("invalid ExpansionStrategy without limits", () => {
        const invalid = { ...makeStrategy(), max_satellite_count: -1 };
        expect(validateExpansionStrategy(invalid).isValid).toBe(false);
    });
    it("valid CannibalizationCheckResult", () => {
        expect(validateCannibalizationCheckResult(makeCannibalization()).isValid).toBe(true);
    });
    it("invalid family when blocking conflicts exist", () => {
        const family = makeMarketFamily();
        const flagship = makeFlagship();
        const derivative = makeDerivative();
        const blocking = createCannibalizationCheckResult({
            ...makeCannibalization(),
            blocking_conflicts: ["blocking overlap"],
            check_status: CannibalizationStatus.BLOCKING,
        });
        const report = validateMarketExpansionFamilyAggregate({
            family,
            flagship,
            satellites: [makeSatellite()],
            derivatives: [derivative],
            relationships: [makeRelationship()],
            cannibalization: blocking,
        });
        expect(report.isValid).toBe(false);
    });
    it("invalid aggregate when children are individually valid but not declared in family", () => {
        const family = makeMarketFamily();
        const satelliteOutsideFamily = createSatelliteMarketDefinition({
            ...makeSatellite(),
            market_ref: "mkt_satellite999",
        });
        expect(validateSatelliteMarketDefinition(satelliteOutsideFamily).isValid).toBe(true);
        const report = validateMarketExpansionFamilyAggregate({
            family,
            flagship: makeFlagship(),
            satellites: [satelliteOutsideFamily],
            derivatives: [makeDerivative()],
            relationships: [makeRelationship()],
            cannibalization: makeCannibalization(),
        });
        expect(report.isValid).toBe(false);
    });
    it("rejects family with cross-list duplicate refs", () => {
        const invalid = {
            ...makeMarketFamily(),
            satellite_market_refs: ["mkt_overlap001"],
            derivative_market_refs: ["mkt_overlap001"],
        };
        expect(validateMarketFamily(invalid).isValid).toBe(false);
    });
    it("valid ExpansionValidationReport", () => {
        expect(validateExpansionValidationReport(makeValidationReport()).isValid).toBe(true);
    });
    it("compatibility test toward Publishing / Editorial / PublicationReady artifacts", () => {
        const family = makeMarketFamily();
        const report = makeValidationReport();
        const publishing = new MarketFamilyPublishableCandidateAdapter().adapt(family, report);
        const editorial = new FamilyEditorialCompatibilityAdapter().adapt(family, report);
        const ready = new MarketFamilyPublicationReadyAdapter().adapt(family, report);
        const draft = new MarketFamilyMarketDraftPipelineAdapter().adapt(family, report);
        expect(validateMarketFamilyCompatibility(publishing).isValid).toBe(true);
        expect(validateMarketFamilyCompatibility(editorial).isValid).toBe(true);
        expect(validateMarketFamilyCompatibility(ready).isValid).toBe(true);
        expect(validateMarketFamilyCompatibility(draft).isValid).toBe(true);
        expect(publishing.target).toBe("publishable_candidate");
        expect(editorial.target).toBe("editorial_pipeline");
        expect(ready.target).toBe("publication_ready_artifact");
        expect(draft.target).toBe("market_draft_pipeline");
    });
    it("deduplicates generated refs and enforces flagship membership", () => {
        expect(validateFamilyGenerationResult(makeGenerationResult()).isValid).toBe(true);
        const invalid = {
            ...makeGenerationResult(),
            generated_market_refs: ["mkt_satellite001", "mkt_derivative001"],
        };
        expect(validateFamilyGenerationResult(invalid).isValid).toBe(false);
    });
    it("keeps deterministic checker and validator outputs stable", () => {
        const checker = new DeterministicCannibalizationChecker();
        const validator = new DeterministicExpansionValidator();
        const family = makeMarketFamily();
        const relationships = [makeRelationship()];
        const checkA = checker.check({ family, relationships });
        const checkB = checker.check({ family, relationships });
        const reportA = validator.validate({ family, relationships, cannibalization: checkA });
        const reportB = validator.validate({ family, relationships, cannibalization: checkB });
        expect(checkA).toEqual(checkB);
        expect(reportA).toEqual(reportB);
        expect(reportA.validation_status).not.toBe(ExpansionValidationStatus.VALID);
    });
    it("preserves compatibility readiness/status coherence", () => {
        const family = makeMarketFamily();
        const report = makeValidationReport();
        const compat = new MarketFamilyPublishableCandidateAdapter().adapt(family, report);
        expect(compat.status).toBe(FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS);
        expect(compat.mapped_artifact.readiness).toBe(compat.status);
    });
    it("prevents adapter readiness inflation when family is draft", () => {
        const familyDraft = makeMarketFamily();
        const validReport = createExpansionValidationReport({
            ...makeValidationReport(),
            validation_status: ExpansionValidationStatus.VALID,
            warnings: [],
        });
        const publishing = new MarketFamilyPublishableCandidateAdapter().adapt(familyDraft, validReport);
        const editorial = new FamilyEditorialCompatibilityAdapter().adapt(familyDraft, validReport);
        expect(publishing.status).toBe(FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS);
        expect(editorial.status).toBe(FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS);
    });
    it("keeps compatibility mapping explicitly loss-aware", () => {
        const family = makeMarketFamily();
        const report = makeValidationReport();
        const draft = new MarketFamilyMarketDraftPipelineAdapter().adapt(family, report);
        const publishing = new MarketFamilyPublishableCandidateAdapter().adapt(family, report);
        const ready = new MarketFamilyPublicationReadyAdapter().adapt(family, report);
        expect(Array.isArray(draft.mapped_artifact.lossy_fields)).toBe(true);
        expect(Array.isArray(publishing.mapped_artifact.lossy_fields)).toBe(true);
        expect(Array.isArray(ready.mapped_artifact.lossy_fields)).toBe(true);
    });
    it("rejects cannibalization result with pass status and warnings", () => {
        const invalid = createCannibalizationCheckResult({
            ...makeCannibalization(),
            check_status: CannibalizationStatus.PASS,
            warnings: ["unexpected warning"],
        });
        expect(validateCannibalizationCheckResult(invalid).isValid).toBe(false);
    });
});
//# sourceMappingURL=market-expansion.spec.js.map