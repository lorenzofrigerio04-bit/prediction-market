import { canonicalEventSchema } from "./entities/canonical-event.schema.js";
import { candidateMarketSchema } from "./entities/candidate-market.schema.js";
import { eventSignalSchema } from "./entities/event-signal.schema.js";
import { marketOutcomeSchema } from "./entities/market-outcome.schema.js";
import { sourceRecordSchema } from "./entities/source-record.schema.js";
import { structuredClaimSchema } from "./entities/structured-claim.schema.js";
import { validationReportSchema } from "./entities/validation-report.schema.js";
import { workflowInstanceSchema } from "./entities/workflow-instance.schema.js";
import { primitivesSchema } from "./common/primitives.schema.js";
import { sharedSchema } from "./common/shared.schema.js";
import { confidenceScoreSchema } from "./value-objects/confidence-score.schema.js";
import { moneySchema } from "./value-objects/money.schema.js";
import { probabilitySchema } from "./value-objects/probability.schema.js";
import { slugSchema } from "./value-objects/slug.schema.js";
import { timestampSchema } from "./value-objects/timestamp.schema.js";
import { titleSchema } from "./value-objects/title.schema.js";
import { urlSchema } from "./value-objects/url.schema.js";
import { freshnessProfileSchema } from "../sources/schemas/freshness-profile.schema.js";
import { reliabilityProfileSchema } from "../sources/schemas/reliability-profile.schema.js";
import { sourceDefinitionSchema } from "../sources/schemas/source-definition.schema.js";
import { sourceRegistryEntrySchema } from "../sources/schemas/source-registry-entry.schema.js";
import { observationNormalizationResultSchema } from "../observations/schemas/observation-normalization-result.schema.js";
import { sourceObservationSchema } from "../observations/schemas/source-observation.schema.js";
import { canonicalEventIntelligenceSchema, deduplicationDecisionSchema, entityNormalizationResultSchema, eventCandidateSchema, eventClusterSchema, eventConflictSchema, eventGraphNodeSchema, eventIntelligenceSharedSchema, eventRelationSchema, observationInterpretationSchema, } from "../event-intelligence/schemas/index.js";
import { contractSelectionSchema, deadlineResolutionSchema, marketDraftPipelineSchema, marketDesignSchemas, opportunityAssessmentSchema, outcomeDefinitionSchema, outcomeGenerationResultSchema, preliminaryScorecardSchema, sourceHierarchySelectionSchema, } from "../market-design/schemas/index.js";
import { edgeCaseRenderSchema, publishableCandidateSchema, publishingSchemas, resolutionSummarySchema, rulebookCompilationSchema, rulebookSectionSchema, sourcePolicyRenderSchema, timePolicyRenderSchema, titleSetSchema, } from "../publishing/schemas/index.js";
import { approvalDecisionSchema, auditRecordSchema, controlledStateTransitionSchema, editorialReviewSchema, editorialSchemas, manualOverrideSchema, publicationReadyArtifactSchema, rejectionDecisionSchema, reviewQueueEntrySchema, revisionRecordSchema, } from "../editorial/schemas/index.js";
import { adversarialCaseSchema, goldenDatasetEntrySchema, moduleHealthMetricSchema, observabilityEventSchema, pipelineHealthSnapshotSchema, qualityReportSchema, regressionCaseSchema, reliabilitySchemas, releaseGateEvaluationSchema, } from "../reliability/schemas/index.js";
import { advancedContractValidationReportSchema, advancedMarketCompatibilityResultSchema, advancedOutcomeGenerationResultSchema, conditionalMarketDefinitionSchema, dependencyLinkSchema, frontierMarketSchemas, raceMarketDefinitionSchema, raceTargetSchema, sequenceMarketDefinitionSchema, sequenceTargetSchema, triggerConditionSchema, } from "../frontier-markets/schemas/index.js";
import { deliveryReadinessReportSchema, liveIntegrationSchemas, livePublicationContractSchema, publicationArtifactSchema, publicationHandoffSchema, publicationMetadataSchema, publicationPackageSchema, schedulingCandidateSchema, schedulingWindowSchema, } from "../live-integration/schemas/index.js";
import { cannibalizationCheckResultSchema, derivativeMarketDefinitionSchema, expansionStrategySchema, expansionValidationReportSchema, familyGenerationResultSchema, flagshipMarketSelectionSchema, marketExpansionSchemas, marketFamilyCompatibilityResultSchema, marketFamilySchema, marketRelationshipSchema, satelliteMarketDefinitionSchema, } from "../market-expansion/schemas/index.js";
import { feedbackAggregationSchema, feedbackSignalSchema, editorialFeedbackSchema, editorialFeedbackSignalSchema, generatorImprovementArtifactSchema, improvementArtifactSchema, learningAggregationSchema, learningCompatibilityResultSchema, learningFeedbackSchemas, learningInsightSchema, learningRecommendationSchema, recommendationSetSchema, rejectionPatternSchema, reliabilityLearningSignalSchema, reliabilityFeedbackSchema, overridePatternSchema, } from "../learning-feedback/schemas/index.js";
import { accessScopeSchema, actionPermissionCheckSchema, adminCapabilityFlagSchema, authorizationDecisionSchema, permissionPolicySchema, platformAccessSchemas, platformActionCompatibilitySchema, roleAssignmentSchema, roleDefinitionSchema, userIdentitySchema, workspaceSchema, } from "../platform-access/schemas/index.js";
import { actionSurfaceSchema, artifactInspectionViewSchema, auditTimelineItemSchema, auditTimelineViewSchema, candidateDetailViewSchema, candidateListViewSchema, consoleNavigationStateSchema, operationsConsoleSchemas, permissionAwareViewStateSchema, queueEntryViewSchema, queuePanelViewSchema, readinessPanelViewSchema, sharedConsoleSchema, } from "../operations-console/schemas/index.js";
import { virtualCreditSchemas, } from "../virtual-credits/schemas/index.js";
import { ADMIN_FEATURE_FLAG_SCHEMA_ID, ADMIN_GOVERNANCE_COMPATIBILITY_VIEW_SCHEMA_ID, adminFeatureFlagSchema, adminGovernanceCompatibilityViewSchema, adminGovernanceSchemas, emergencyControlSchema, governanceAuditLinkSchema, governanceDecisionSchema, governanceEnvironmentBindingSchema, governanceModuleSchema, governanceSourceSchema, guardrailPolicySchema, overrideRequestSchema, } from "../admin-governance/schemas/index.js";
import { discoveryNewsEngineSchemas } from "../discovery-news-engine/schemas/index.js";
export const foundationSchemas = [
    primitivesSchema,
    sharedSchema,
    titleSchema,
    slugSchema,
    urlSchema,
    timestampSchema,
    probabilitySchema,
    confidenceScoreSchema,
    moneySchema,
    reliabilityProfileSchema,
    freshnessProfileSchema,
    sourceDefinitionSchema,
    sourceRegistryEntrySchema,
    sourceObservationSchema,
    observationNormalizationResultSchema,
    eventIntelligenceSharedSchema,
    observationInterpretationSchema,
    eventCandidateSchema,
    canonicalEventIntelligenceSchema,
    eventGraphNodeSchema,
    eventRelationSchema,
    entityNormalizationResultSchema,
    eventClusterSchema,
    deduplicationDecisionSchema,
    eventConflictSchema,
    ...marketDesignSchemas,
    ...publishingSchemas,
    ...editorialSchemas,
    ...reliabilitySchemas,
    ...frontierMarketSchemas,
    ...liveIntegrationSchemas,
    ...marketExpansionSchemas,
    ...learningFeedbackSchemas,
    ...platformAccessSchemas,
    ...operationsConsoleSchemas,
    ...virtualCreditSchemas,
    ...adminGovernanceSchemas,
    ...discoveryNewsEngineSchemas,
    sourceRecordSchema,
    eventSignalSchema,
    canonicalEventSchema,
    structuredClaimSchema,
    marketOutcomeSchema,
    candidateMarketSchema,
    validationReportSchema,
    workflowInstanceSchema,
];
export { canonicalEventSchema, candidateMarketSchema, confidenceScoreSchema, eventSignalSchema, marketOutcomeSchema, moneySchema, primitivesSchema, probabilitySchema, reliabilityProfileSchema, freshnessProfileSchema, sourceDefinitionSchema, sourceRegistryEntrySchema, sourceObservationSchema, observationNormalizationResultSchema, eventIntelligenceSharedSchema, observationInterpretationSchema, eventCandidateSchema, canonicalEventIntelligenceSchema, eventGraphNodeSchema, eventRelationSchema, entityNormalizationResultSchema, eventClusterSchema, deduplicationDecisionSchema, eventConflictSchema, opportunityAssessmentSchema, contractSelectionSchema, outcomeDefinitionSchema, outcomeGenerationResultSchema, deadlineResolutionSchema, sourceHierarchySelectionSchema, preliminaryScorecardSchema, marketDraftPipelineSchema, titleSetSchema, resolutionSummarySchema, rulebookSectionSchema, rulebookCompilationSchema, timePolicyRenderSchema, sourcePolicyRenderSchema, edgeCaseRenderSchema, publishableCandidateSchema, reviewQueueEntrySchema, editorialReviewSchema, approvalDecisionSchema, rejectionDecisionSchema, manualOverrideSchema, auditRecordSchema, revisionRecordSchema, publicationReadyArtifactSchema, controlledStateTransitionSchema, goldenDatasetEntrySchema, regressionCaseSchema, adversarialCaseSchema, moduleHealthMetricSchema, pipelineHealthSnapshotSchema, releaseGateEvaluationSchema, qualityReportSchema, observabilityEventSchema, raceTargetSchema, raceMarketDefinitionSchema, sequenceTargetSchema, sequenceMarketDefinitionSchema, triggerConditionSchema, conditionalMarketDefinitionSchema, dependencyLinkSchema, advancedOutcomeGenerationResultSchema, advancedContractValidationReportSchema, advancedMarketCompatibilityResultSchema, liveIntegrationSchemas, publicationArtifactSchema, publicationPackageSchema, publicationHandoffSchema, schedulingWindowSchema, schedulingCandidateSchema, publicationMetadataSchema, livePublicationContractSchema, deliveryReadinessReportSchema, marketExpansionSchemas, marketFamilySchema, flagshipMarketSelectionSchema, satelliteMarketDefinitionSchema, derivativeMarketDefinitionSchema, marketRelationshipSchema, expansionStrategySchema, cannibalizationCheckResultSchema, expansionValidationReportSchema, familyGenerationResultSchema, marketFamilyCompatibilityResultSchema, learningFeedbackSchemas, feedbackSignalSchema, editorialFeedbackSchema, rejectionPatternSchema, overridePatternSchema, reliabilityFeedbackSchema, feedbackAggregationSchema, editorialFeedbackSignalSchema, reliabilityLearningSignalSchema, learningAggregationSchema, learningInsightSchema, recommendationSetSchema, learningRecommendationSchema, generatorImprovementArtifactSchema, improvementArtifactSchema, learningCompatibilityResultSchema, platformAccessSchemas, userIdentitySchema, workspaceSchema, roleDefinitionSchema, roleAssignmentSchema, permissionPolicySchema, accessScopeSchema, authorizationDecisionSchema, actionPermissionCheckSchema, adminCapabilityFlagSchema, platformActionCompatibilitySchema, operationsConsoleSchemas, virtualCreditSchemas, queuePanelViewSchema, queueEntryViewSchema, candidateListViewSchema, candidateDetailViewSchema, artifactInspectionViewSchema, auditTimelineItemSchema, auditTimelineViewSchema, readinessPanelViewSchema, actionSurfaceSchema, consoleNavigationStateSchema, permissionAwareViewStateSchema, sharedConsoleSchema, adminGovernanceSchemas, adminFeatureFlagSchema, governanceModuleSchema, governanceSourceSchema, guardrailPolicySchema, emergencyControlSchema, overrideRequestSchema, governanceEnvironmentBindingSchema, governanceDecisionSchema, governanceAuditLinkSchema, adminGovernanceCompatibilityViewSchema, ADMIN_FEATURE_FLAG_SCHEMA_ID, ADMIN_GOVERNANCE_COMPATIBILITY_VIEW_SCHEMA_ID, sharedSchema, slugSchema, sourceRecordSchema, structuredClaimSchema, timestampSchema, titleSchema, urlSchema, validationReportSchema, workflowInstanceSchema, };
//# sourceMappingURL=index.js.map