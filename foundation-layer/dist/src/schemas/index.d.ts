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
import { canonicalEventIntelligenceSchema, deduplicationDecisionSchema, entityNormalizationResultSchema, eventCandidateSchema, eventClusterSchema, eventConflictSchema, eventGraphNodeSchema, eventIntelligenceSharedSchema, eventRelationSchema, observationInterpretationSchema } from "../event-intelligence/schemas/index.js";
import { contractSelectionSchema, deadlineResolutionSchema, marketDraftPipelineSchema, opportunityAssessmentSchema, outcomeDefinitionSchema, outcomeGenerationResultSchema, preliminaryScorecardSchema, sourceHierarchySelectionSchema } from "../market-design/schemas/index.js";
import { edgeCaseRenderSchema, publishableCandidateSchema, resolutionSummarySchema, rulebookCompilationSchema, rulebookSectionSchema, sourcePolicyRenderSchema, timePolicyRenderSchema, titleSetSchema } from "../publishing/schemas/index.js";
import { approvalDecisionSchema, auditRecordSchema, controlledStateTransitionSchema, editorialReviewSchema, manualOverrideSchema, publicationReadyArtifactSchema, rejectionDecisionSchema, reviewQueueEntrySchema, revisionRecordSchema } from "../editorial/schemas/index.js";
import { adversarialCaseSchema, goldenDatasetEntrySchema, moduleHealthMetricSchema, observabilityEventSchema, pipelineHealthSnapshotSchema, qualityReportSchema, regressionCaseSchema, releaseGateEvaluationSchema } from "../reliability/schemas/index.js";
import { advancedContractValidationReportSchema, advancedMarketCompatibilityResultSchema, advancedOutcomeGenerationResultSchema, conditionalMarketDefinitionSchema, dependencyLinkSchema, raceMarketDefinitionSchema, raceTargetSchema, sequenceMarketDefinitionSchema, sequenceTargetSchema, triggerConditionSchema } from "../frontier-markets/schemas/index.js";
import { deliveryReadinessReportSchema, liveIntegrationSchemas, livePublicationContractSchema, publicationArtifactSchema, publicationHandoffSchema, publicationMetadataSchema, publicationPackageSchema, schedulingCandidateSchema, schedulingWindowSchema } from "../live-integration/schemas/index.js";
import { cannibalizationCheckResultSchema, derivativeMarketDefinitionSchema, expansionStrategySchema, expansionValidationReportSchema, familyGenerationResultSchema, flagshipMarketSelectionSchema, marketExpansionSchemas, marketFamilyCompatibilityResultSchema, marketFamilySchema, marketRelationshipSchema, satelliteMarketDefinitionSchema } from "../market-expansion/schemas/index.js";
import { feedbackAggregationSchema, feedbackSignalSchema, editorialFeedbackSchema, editorialFeedbackSignalSchema, generatorImprovementArtifactSchema, improvementArtifactSchema, learningAggregationSchema, learningCompatibilityResultSchema, learningFeedbackSchemas, learningInsightSchema, learningRecommendationSchema, recommendationSetSchema, rejectionPatternSchema, reliabilityLearningSignalSchema, reliabilityFeedbackSchema, overridePatternSchema } from "../learning-feedback/schemas/index.js";
import { accessScopeSchema, actionPermissionCheckSchema, adminCapabilityFlagSchema, authorizationDecisionSchema, permissionPolicySchema, platformAccessSchemas, platformActionCompatibilitySchema, roleAssignmentSchema, roleDefinitionSchema, userIdentitySchema, workspaceSchema } from "../platform-access/schemas/index.js";
import { actionSurfaceSchema, artifactInspectionViewSchema, auditTimelineItemSchema, auditTimelineViewSchema, candidateDetailViewSchema, candidateListViewSchema, consoleNavigationStateSchema, operationsConsoleSchemas, permissionAwareViewStateSchema, queueEntryViewSchema, queuePanelViewSchema, readinessPanelViewSchema, sharedConsoleSchema } from "../operations-console/schemas/index.js";
import { virtualCreditSchemas } from "../virtual-credits/schemas/index.js";
import { ADMIN_FEATURE_FLAG_SCHEMA_ID, ADMIN_GOVERNANCE_COMPATIBILITY_VIEW_SCHEMA_ID, adminFeatureFlagSchema, adminGovernanceCompatibilityViewSchema, adminGovernanceSchemas, emergencyControlSchema, governanceAuditLinkSchema, governanceDecisionSchema, governanceEnvironmentBindingSchema, governanceModuleSchema, governanceSourceSchema, guardrailPolicySchema, overrideRequestSchema } from "../admin-governance/schemas/index.js";
export declare const foundationSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/common/primitives.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly $defs: {
        readonly idString: {
            readonly type: "string";
            readonly minLength: 10;
            readonly maxLength: 80;
        };
        readonly eventId: {
            readonly type: "string";
            readonly pattern: "^evt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly sourceId: {
            readonly type: "string";
            readonly pattern: "^src_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly sourceDefinitionId: {
            readonly type: "string";
            readonly pattern: "^sdef_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly sourceObservationId: {
            readonly type: "string";
            readonly pattern: "^obs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly claimId: {
            readonly type: "string";
            readonly pattern: "^clm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly candidateMarketId: {
            readonly type: "string";
            readonly pattern: "^mkt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly outcomeId: {
            readonly type: "string";
            readonly pattern: "^out_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly nonEmptyString: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly isoTimestamp: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly score01: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
        readonly nullableString: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly tag: {
            readonly type: "string";
            readonly pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$";
            readonly minLength: 1;
            readonly maxLength: 32;
        };
        readonly locale: {
            readonly type: "string";
            readonly pattern: "^[a-z]{2,3}(?:-[A-Z]{2}|-[a-zA-Z0-9]{2,8})?$";
        };
        readonly languageCode: {
            readonly type: "string";
            readonly pattern: "^[a-z]{2,3}(?:-[A-Z]{2}|-[a-zA-Z0-9]{2,8})?$";
        };
        readonly discoverySourceId: {
            readonly type: "string";
            readonly pattern: "^dsrc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly discoverySignalId: {
            readonly type: "string";
            readonly pattern: "^dsig_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly discoveryRunId: {
            readonly type: "string";
            readonly pattern: "^drun_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly discoveryJobId: {
            readonly type: "string";
            readonly pattern: "^djob_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/common/shared.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly $defs: {
        readonly validationIssue: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "path", "message", "severity"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly path: {
                    readonly type: "string";
                };
                readonly message: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly severity: {
                    readonly type: "string";
                    readonly enum: import("../index.js").ValidatorSeverity[];
                };
                readonly context: {
                    readonly type: "object";
                    readonly additionalProperties: true;
                };
            };
        };
        readonly workflowTransitionRecord: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["from", "to", "transition", "at", "reason", "actor"];
            readonly properties: {
                readonly from: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                        readonly enum: import("../index.js").WorkflowState[];
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly to: {
                    readonly type: "string";
                    readonly enum: import("../index.js").WorkflowState[];
                };
                readonly transition: {
                    readonly type: "string";
                    readonly enum: import("../index.js").WorkflowTransition[];
                };
                readonly at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly reason: {
                    readonly type: readonly ["string", "null"];
                };
                readonly actor: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/value-objects/title.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "string";
    readonly minLength: 1;
    readonly maxLength: 200;
}, {
    readonly $id: "https://market-design-engine.dev/schemas/value-objects/slug.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "string";
    readonly pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$";
    readonly minLength: 1;
    readonly maxLength: 240;
}, {
    readonly $id: "https://market-design-engine.dev/schemas/value-objects/url.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "string";
    readonly format: "uri";
    readonly pattern: "^https?://";
}, {
    readonly $id: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "string";
    readonly format: "date-time";
}, {
    readonly $id: "https://market-design-engine.dev/schemas/value-objects/probability.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "number";
    readonly minimum: 0;
    readonly maximum: 1;
}, {
    readonly $id: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "number";
    readonly minimum: 0;
    readonly maximum: 1;
}, {
    readonly $id: "https://market-design-engine.dev/schemas/value-objects/money.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["currency", "amount"];
    readonly properties: {
        readonly currency: {
            readonly type: "string";
            readonly pattern: "^[A-Z]{3}$";
        };
        readonly amount: {
            readonly type: "string";
            readonly pattern: "^-?\\d+(?:\\.\\d{1,8})?$";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/sources/reliability-profile.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["authorityScore", "historicalStabilityScore", "resolutionEligibility", "conflictRiskLevel"];
    readonly properties: {
        readonly authorityScore: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly historicalStabilityScore: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly resolutionEligibility: {
            readonly type: "string";
            readonly enum: import("../index.js").ResolutionEligibility[];
        };
        readonly conflictRiskLevel: {
            readonly type: "string";
            readonly enum: import("../index.js").ConflictRiskLevel[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/sources/freshness-profile.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["expectedUpdateFrequency", "freshnessTtl", "recencyPriority"];
    readonly properties: {
        readonly expectedUpdateFrequency: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly freshnessTtl: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly recencyPriority: {
            readonly type: "string";
            readonly enum: import("../index.js").RecencyPriority[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/sources/source-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "displayName", "sourceClass", "baseIdentifier", "supportedUseCases", "capability", "authorityLevel", "reliabilityProfile", "freshnessProfile", "languageCoverage", "parseStrategy", "enablementStatus"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly displayName: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly sourceClass: {
            readonly type: "string";
            readonly enum: import("../index.js").SourceClass[];
        };
        readonly baseIdentifier: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "value"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                    readonly enum: import("../index.js").IdentifierKind[];
                };
                readonly value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly supportedUseCases: {
            readonly type: "array";
            readonly minItems: 1;
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").SourceUseCase[];
            };
        };
        readonly capability: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["supportsDiscovery", "supportsValidation", "supportsResolution", "supportsAttentionScoring"];
            readonly properties: {
                readonly supportsDiscovery: {
                    readonly type: "boolean";
                };
                readonly supportsValidation: {
                    readonly type: "boolean";
                };
                readonly supportsResolution: {
                    readonly type: "boolean";
                };
                readonly supportsAttentionScoring: {
                    readonly type: "boolean";
                };
            };
        };
        readonly authorityLevel: {
            readonly type: "string";
            readonly enum: import("../index.js").AuthorityLevel[];
        };
        readonly reliabilityProfile: {
            readonly $ref: "https://market-design-engine.dev/schemas/sources/reliability-profile.schema.json";
        };
        readonly freshnessProfile: {
            readonly $ref: "https://market-design-engine.dev/schemas/sources/freshness-profile.schema.json";
        };
        readonly languageCoverage: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["mode", "languages"];
            readonly properties: {
                readonly mode: {
                    readonly type: "string";
                    readonly enum: import("../index.js").LanguageCoverageMode[];
                };
                readonly languages: {
                    readonly type: "array";
                    readonly items: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/languageCode";
                    };
                };
            };
        };
        readonly parseStrategy: {
            readonly type: "string";
            readonly enum: import("../index.js").ParseStrategy[];
        };
        readonly enablementStatus: {
            readonly type: "string";
            readonly enum: import("../index.js").EnablementStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/sources/source-registry-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["sourceDefinitionId", "pollingPolicyNullable", "rateLimitProfileNullable", "authenticationMode", "healthStatus", "ownerNotesNullable", "auditMetadata"];
    readonly properties: {
        readonly sourceDefinitionId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId";
        };
        readonly pollingPolicyNullable: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["intervalSeconds", "jitterSeconds"];
                readonly properties: {
                    readonly intervalSeconds: {
                        readonly type: "integer";
                        readonly minimum: 1;
                    };
                    readonly jitterSeconds: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly rateLimitProfileNullable: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["maxRequests", "perSeconds"];
                readonly properties: {
                    readonly maxRequests: {
                        readonly type: "integer";
                        readonly minimum: 1;
                    };
                    readonly perSeconds: {
                        readonly type: "integer";
                        readonly minimum: 1;
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly authenticationMode: {
            readonly type: "string";
            readonly enum: import("../index.js").AuthenticationMode[];
        };
        readonly healthStatus: {
            readonly type: "string";
            readonly enum: import("../index.js").SourceHealthStatus[];
        };
        readonly ownerNotesNullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly auditMetadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["createdBy", "createdAt", "updatedBy", "updatedAt"];
            readonly properties: {
                readonly createdBy: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly createdAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
                };
                readonly updatedBy: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly updatedAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/observations/source-observation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "sourceDefinitionId", "observedAt", "ingestedAt", "sourceReference", "rawPayloadReference", "normalizedHeadlineNullable", "normalizedSummaryNullable", "extractedEntities", "extractedDates", "extractedNumbers", "extractedClaims", "language", "jurisdictionCandidates", "evidenceSpans", "sourceConfidence", "normalizationStatus", "traceabilityMetadata"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly sourceDefinitionId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId";
        };
        readonly observedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
        readonly ingestedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
        readonly sourceReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "reference", "locator"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                    readonly enum: import("../index.js").SourceReferenceKind[];
                };
                readonly reference: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly locator: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly rawPayloadReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["uri", "checksum"];
            readonly properties: {
                readonly uri: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly checksum: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly normalizedHeadlineNullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly normalizedSummaryNullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly extractedEntities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly extractedDates: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
            };
        };
        readonly extractedNumbers: {
            readonly type: "array";
            readonly items: {
                readonly type: "number";
            };
        };
        readonly extractedClaims: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly language: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/languageCode";
        };
        readonly jurisdictionCandidates: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "confidence"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly pattern: "^[A-Z]{2,8}$";
                    };
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                };
            };
        };
        readonly evidenceSpans: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["spanId", "kind", "locator", "startOffset", "endOffset", "extractedText", "mappedField"];
                readonly properties: {
                    readonly spanId: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly kind: {
                        readonly type: "string";
                        readonly enum: import("../index.js").EvidenceSpanKind[];
                    };
                    readonly locator: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly startOffset: {
                        readonly type: readonly ["integer", "null"];
                        readonly minimum: 0;
                    };
                    readonly endOffset: {
                        readonly type: readonly ["integer", "null"];
                        readonly minimum: 0;
                    };
                    readonly extractedText: {
                        readonly type: readonly ["string", "null"];
                    };
                    readonly mappedField: {
                        readonly type: readonly ["string", "null"];
                    };
                };
            };
        };
        readonly sourceConfidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly normalizationStatus: {
            readonly type: "string";
            readonly enum: import("../index.js").NormalizationStatus[];
        };
        readonly traceabilityMetadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["normalizerVersion", "mappingStrategyIds", "isTraceabilityComplete", "provenanceChain"];
            readonly properties: {
                readonly normalizerVersion: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly mappingStrategyIds: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly isTraceabilityComplete: {
                    readonly type: "boolean";
                };
                readonly provenanceChain: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/observations/observation-normalization-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["observation", "validationIssues", "normalizationIssues", "deterministicWarnings", "traceabilityCompleteness"];
    readonly properties: {
        readonly observation: {
            readonly $ref: "https://market-design-engine.dev/schemas/observations/source-observation.schema.json";
        };
        readonly validationIssues: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "path", "message", "severity"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly severity: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ValidatorSeverity[];
                    };
                    readonly context: {
                        readonly type: "object";
                        readonly additionalProperties: true;
                    };
                };
            };
        };
        readonly normalizationIssues: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "path", "message", "severity"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly severity: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ValidatorSeverity[];
                    };
                    readonly context: {
                        readonly type: "object";
                        readonly additionalProperties: true;
                    };
                };
            };
        };
        readonly deterministicWarnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly traceabilityCompleteness: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["hasSourceReference", "hasRawPayloadReference", "hasEvidenceSpans", "hasTraceabilityMetadata", "isComplete"];
            readonly properties: {
                readonly hasSourceReference: {
                    readonly type: "boolean";
                };
                readonly hasRawPayloadReference: {
                    readonly type: "boolean";
                };
                readonly hasEvidenceSpans: {
                    readonly type: "boolean";
                };
                readonly hasTraceabilityMetadata: {
                    readonly type: "boolean";
                };
                readonly isComplete: {
                    readonly type: "boolean";
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly $defs: {
        readonly observationInterpretationId: {
            readonly type: "string";
            readonly pattern: "^oint_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly eventCandidateId: {
            readonly type: "string";
            readonly pattern: "^ecnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonicalEventIntelligenceId: {
            readonly type: "string";
            readonly pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly eventGraphNodeId: {
            readonly type: "string";
            readonly pattern: "^egnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly eventRelationId: {
            readonly type: "string";
            readonly pattern: "^erel_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly eventClusterId: {
            readonly type: "string";
            readonly pattern: "^eclu_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly eventConflictId: {
            readonly type: "string";
            readonly pattern: "^ecfl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly temporalWindow: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["start_at", "end_at"];
            readonly properties: {
                readonly start_at: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
                };
                readonly end_at: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
                };
            };
        };
        readonly evidenceSpan: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["span_id", "source_observation_id", "locator", "start_offset", "end_offset", "extracted_text_nullable", "mapped_field_nullable"];
            readonly properties: {
                readonly span_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly source_observation_id: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
                };
                readonly locator: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly start_offset: {
                    readonly type: readonly ["integer", "null"];
                    readonly minimum: 0;
                };
                readonly end_offset: {
                    readonly type: readonly ["integer", "null"];
                    readonly minimum: 0;
                };
                readonly extracted_text_nullable: {
                    readonly type: readonly ["string", "null"];
                };
                readonly mapped_field_nullable: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly subjectReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["value", "normalized_value", "entity_type"];
            readonly properties: {
                readonly value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly normalized_value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly entity_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly actionReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["value", "normalized_value"];
            readonly properties: {
                readonly value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly normalized_value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly objectReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["value", "normalized_value", "entity_type_nullable"];
            readonly properties: {
                readonly value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly normalized_value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly entity_type_nullable: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly jurisdictionReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "label_nullable"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly pattern: "^[A-Z]{2,8}$";
                };
                readonly label_nullable: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly graphMetadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["created_from_candidate_ids", "relation_count"];
            readonly properties: {
                readonly created_from_candidate_ids: {
                    readonly type: "array";
                    readonly items: {
                        readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
                    };
                };
                readonly relation_count: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
        readonly similarityScore: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["left_candidate_id", "right_candidate_id", "score"];
            readonly properties: {
                readonly left_candidate_id: {
                    readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
                };
                readonly right_candidate_id: {
                    readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
                };
                readonly score: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                };
            };
        };
        readonly conflictDescriptor: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["field", "left_value_nullable", "right_value_nullable"];
            readonly properties: {
                readonly field: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly left_value_nullable: {
                    readonly type: readonly ["string", "null"];
                };
                readonly right_value_nullable: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly normalizationMetadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["strategy_id", "resolver_version"];
            readonly properties: {
                readonly strategy_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly resolver_version: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/observation-interpretation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "source_observation_id", "interpreted_entities", "interpreted_dates", "interpreted_numbers", "interpreted_claims", "semantic_confidence", "interpretation_metadata"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/observationInterpretationId";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly source_observation_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
        };
        readonly interpreted_entities: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["value", "normalized_value", "entity_type", "confidence", "evidence_spans"];
                readonly properties: {
                    readonly value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly normalized_value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly entity_type: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly interpreted_dates: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["original_value", "resolved_timestamp_nullable", "confidence", "evidence_spans"];
                readonly properties: {
                    readonly original_value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly resolved_timestamp_nullable: {
                        readonly oneOf: readonly [{
                            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
                        }, {
                            readonly type: "null";
                        }];
                    };
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly interpreted_numbers: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["original_value", "unit_nullable", "confidence", "evidence_spans"];
                readonly properties: {
                    readonly original_value: {
                        readonly type: "number";
                    };
                    readonly unit_nullable: {
                        readonly type: readonly ["string", "null"];
                    };
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly interpreted_claims: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["text", "polarity", "confidence", "evidence_spans"];
                readonly properties: {
                    readonly text: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly polarity: {
                        readonly type: "string";
                        readonly enum: readonly ["AFFIRMATIVE", "NEGATIVE", "UNCERTAIN"];
                    };
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly semantic_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly interpretation_metadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["interpreter_version", "strategy_ids", "deterministic"];
            readonly properties: {
                readonly interpreter_version: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly strategy_ids: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly deterministic: {
                    readonly type: "boolean";
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-candidate.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "observation_ids", "subject_candidate", "action_candidate", "object_candidate_nullable", "temporal_window_candidate", "jurisdiction_candidate_nullable", "category_candidate", "extraction_confidence", "evidence_spans", "candidate_status"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly observation_ids: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
            };
        };
        readonly subject_candidate: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/subjectReference";
        };
        readonly action_candidate: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/actionReference";
        };
        readonly object_candidate_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/objectReference";
            }, {
                readonly type: "null";
            }];
        };
        readonly temporal_window_candidate: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/temporalWindow";
        };
        readonly jurisdiction_candidate_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/jurisdictionReference";
            }, {
                readonly type: "null";
            }];
        };
        readonly category_candidate: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly extraction_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly evidence_spans: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
            };
        };
        readonly candidate_status: {
            readonly type: "string";
            readonly enum: import("../event-intelligence/index.js").CandidateStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/canonical-event.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "subject", "action", "object_nullable", "event_type", "category", "time_window", "jurisdiction_nullable", "supporting_candidates", "supporting_observations", "conflicting_observations", "canonicalization_confidence", "dedupe_cluster_id", "graph_node_id_nullable"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly subject: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/subjectReference";
        };
        readonly action: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/actionReference";
        };
        readonly object_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/objectReference";
            }, {
                readonly type: "null";
            }];
        };
        readonly event_type: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly category: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly time_window: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/temporalWindow";
        };
        readonly jurisdiction_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/jurisdictionReference";
            }, {
                readonly type: "null";
            }];
        };
        readonly supporting_candidates: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
            };
        };
        readonly supporting_observations: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
            };
        };
        readonly conflicting_observations: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
            };
        };
        readonly canonicalization_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly dedupe_cluster_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventClusterId";
        };
        readonly graph_node_id_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventGraphNodeId";
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-graph-node.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "canonical_event_id", "incoming_relations", "outgoing_relations", "graph_metadata"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventGraphNodeId";
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly incoming_relations: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventRelationId";
            };
        };
        readonly outgoing_relations: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventRelationId";
            };
        };
        readonly graph_metadata: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/graphMetadata";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-relation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "source_event_id", "target_event_id", "relation_type", "relation_confidence"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventRelationId";
        };
        readonly source_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly target_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly relation_type: {
            readonly type: "string";
            readonly enum: import("../event-intelligence/index.js").RelationType[];
        };
        readonly relation_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/entity-normalization-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["normalized_entities", "unresolved_entities", "normalization_confidence", "normalization_metadata"];
    readonly properties: {
        readonly normalized_entities: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["value", "normalized_value", "entity_type", "confidence", "evidence_spans"];
                readonly properties: {
                    readonly value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly normalized_value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly entity_type: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly unresolved_entities: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["value", "normalized_value", "entity_type", "confidence", "evidence_spans"];
                readonly properties: {
                    readonly value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly normalized_value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly entity_type: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly normalization_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly normalization_metadata: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/normalizationMetadata";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-cluster.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["cluster_id", "candidate_ids", "similarity_scores", "cluster_confidence", "cluster_status"];
    readonly properties: {
        readonly cluster_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventClusterId";
        };
        readonly candidate_ids: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
            };
        };
        readonly similarity_scores: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/similarityScore";
            };
        };
        readonly cluster_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly cluster_status: {
            readonly type: "string";
            readonly enum: import("../event-intelligence/index.js").ClusterStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/deduplication-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["candidate_id", "canonical_event_id", "decision_type", "decision_confidence"];
    readonly properties: {
        readonly candidate_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly decision_type: {
            readonly type: "string";
            readonly enum: import("../event-intelligence/index.js").DeduplicationDecisionType[];
        };
        readonly decision_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-conflict.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "canonical_event_id_nullable", "candidate_id_nullable", "conflict_type", "description", "conflicting_fields", "related_observation_ids", "confidence"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventConflictId";
        };
        readonly canonical_event_id_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
            }, {
                readonly type: "null";
            }];
        };
        readonly candidate_id_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
            }, {
                readonly type: "null";
            }];
        };
        readonly conflict_type: {
            readonly type: "string";
            readonly enum: import("../event-intelligence/index.js").ConflictType[];
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly conflicting_fields: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/conflictDescriptor";
            };
        };
        readonly related_observation_ids: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
            };
        };
        readonly confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/opportunity-assessment.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "canonical_event_id", "opportunity_status", "relevance_score", "resolvability_score", "timeliness_score", "novelty_score", "audience_potential_score", "blocking_reasons", "recommendation_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^opp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly opportunity_status: {
            readonly type: "string";
            readonly enum: import("../index.js").OpportunityStatus[];
        };
        readonly relevance_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly resolvability_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly timeliness_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly novelty_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly audience_potential_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly recommendation_notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/contract-selection.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "canonical_event_id", "status", "selected_contract_type", "contract_type_reason", "selection_confidence", "rejected_contract_types", "selection_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^csel_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").ContractSelectionStatus[];
        };
        readonly selected_contract_type: {
            readonly type: "string";
            readonly enum: readonly [import("../index.js").ContractType.BINARY, import("../index.js").ContractType.MULTI_OUTCOME, import("../index.js").ContractType.SCALAR_BRACKET];
        };
        readonly contract_type_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly selection_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly rejected_contract_types: {
            readonly type: "array";
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly enum: readonly [import("../index.js").ContractType.BINARY, import("../index.js").ContractType.MULTI_OUTCOME, import("../index.js").ContractType.SCALAR_BRACKET];
            };
        };
        readonly selection_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "outcome_key", "display_label", "semantic_definition", "ordering_index_nullable", "range_definition_nullable", "active"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/outcomeId";
        };
        readonly outcome_key: {
            readonly type: "string";
            readonly pattern: "^[a-z0-9][a-z0-9_:-]{1,62}$";
        };
        readonly display_label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly semantic_definition: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly ordering_index_nullable: {
            readonly oneOf: readonly [{
                readonly type: "integer";
                readonly minimum: 0;
            }, {
                readonly type: "null";
            }];
        };
        readonly range_definition_nullable: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["min_inclusive", "max_exclusive", "label_nullable"];
                readonly properties: {
                    readonly min_inclusive: {
                        readonly type: "number";
                    };
                    readonly max_exclusive: {
                        readonly type: "number";
                    };
                    readonly label_nullable: {
                        readonly type: readonly ["string", "null"];
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/outcome-generation-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "contract_type", "outcomes", "exhaustiveness_policy", "exclusivity_policy", "generation_confidence", "validation_notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ogr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly contract_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ContractType[];
        };
        readonly outcomes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json";
            };
        };
        readonly exhaustiveness_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").OutcomeExhaustivenessPolicy[];
        };
        readonly exclusivity_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").OutcomeExclusivityPolicy[];
        };
        readonly generation_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly validation_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "canonical_event_id", "event_deadline", "market_close_time", "resolution_cutoff_nullable", "timezone", "deadline_basis_type", "deadline_basis_reference", "confidence", "warnings"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^dlr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly event_deadline: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly market_close_time: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly resolution_cutoff_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly timezone: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly deadline_basis_type: {
            readonly type: "string";
            readonly enum: import("../index.js").DeadlineBasisType[];
        };
        readonly deadline_basis_reference: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "canonical_event_id", "candidate_source_classes", "selected_source_priority", "source_selection_reason", "source_confidence"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^shs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly candidate_source_classes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").SourceClass[];
            };
        };
        readonly selected_source_priority: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["source_class", "priority_rank"];
                readonly properties: {
                    readonly source_class: {
                        readonly type: "string";
                        readonly enum: import("../index.js").SourceClass[];
                    };
                    readonly priority_rank: {
                        readonly type: "integer";
                        readonly minimum: 1;
                    };
                };
            };
        };
        readonly source_selection_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly source_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/preliminary-scorecard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["clarity_score", "resolvability_score", "novelty_score", "liquidity_potential_score", "ambiguity_risk_score", "duplicate_risk_score", "editorial_value_score", "final_publish_score"];
    readonly properties: {
        readonly clarity_score: {
            $ref: string;
        };
        readonly resolvability_score: {
            $ref: string;
        };
        readonly novelty_score: {
            $ref: string;
        };
        readonly liquidity_potential_score: {
            $ref: string;
        };
        readonly ambiguity_risk_score: {
            $ref: string;
        };
        readonly duplicate_risk_score: {
            $ref: string;
        };
        readonly editorial_value_score: {
            $ref: string;
        };
        readonly final_publish_score: {
            $ref: string;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/market-draft-pipeline.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["canonical_event", "opportunity_assessment", "contract_selection", "outcome_generation_result", "deadline_resolution", "source_hierarchy_selection", "preliminary_scorecard", "foundation_candidate_market"];
    readonly properties: {
        readonly canonical_event: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/canonical-event.schema.json";
        };
        readonly opportunity_assessment: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/opportunity-assessment.schema.json";
        };
        readonly contract_selection: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/contract-selection.schema.json";
        };
        readonly outcome_generation_result: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/outcome-generation-result.schema.json";
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly source_hierarchy_selection: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json";
        };
        readonly preliminary_scorecard: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/preliminary-scorecard.schema.json";
        };
        readonly foundation_candidate_market: {
            readonly $ref: "https://market-design-engine.dev/schemas/entities/candidate-market.schema.json";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/title-set.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_draft_pipeline_id", "canonical_title", "display_title", "subtitle", "title_generation_status", "generation_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^tset_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_draft_pipeline_id: {
            readonly type: "string";
            readonly pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly display_title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly subtitle: {
            readonly type: readonly ["string", "null"];
        };
        readonly title_generation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").TitleGenerationStatus[];
        };
        readonly generation_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/resolution-summary.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_draft_pipeline_id", "one_line_resolution_summary", "summary_basis", "summary_confidence"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rsum_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_draft_pipeline_id: {
            readonly type: "string";
            readonly pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly one_line_resolution_summary: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly summary_basis: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["resolution_rule_ref", "source_hierarchy_ref", "deadline_ref", "basis_points"];
            readonly properties: {
                readonly resolution_rule_ref: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly source_hierarchy_ref: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly deadline_ref: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly basis_points: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
            };
        };
        readonly summary_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "section_type", "title", "body", "ordering_index", "required"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rbsec_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly section_type: {
            readonly type: "string";
            readonly enum: import("../index.js").RulebookSectionType[];
        };
        readonly title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly body: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly ordering_index: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly required: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/rulebook-compilation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_draft_pipeline_id", "canonical_question", "contract_definition", "resolution_criteria", "source_policy", "time_policy", "edge_case_section", "invalidation_section", "examples_section", "included_sections", "compilation_status", "compilation_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rbcmp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_draft_pipeline_id: {
            readonly type: "string";
            readonly pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_question: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly contract_definition: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly resolution_criteria: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly source_policy: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly time_policy: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly edge_case_section: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly invalidation_section: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly examples_section: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly included_sections: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
            };
        };
        readonly compilation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").CompilationStatus[];
        };
        readonly compilation_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/time-policy-render.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["timezone", "deadline_text", "close_time_text", "cutoff_text_nullable", "policy_notes", "metadata"];
    readonly properties: {
        readonly timezone: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly deadline_text: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly close_time_text: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly cutoff_text_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly policy_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/source-policy-render.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["selected_source_priority", "source_policy_text", "fallback_policy_text_nullable"];
    readonly properties: {
        readonly selected_source_priority: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly source_policy_text: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly fallback_policy_text_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/edge-case-render.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["edge_case_items", "invalidation_items", "notes_nullable"];
    readonly properties: {
        readonly edge_case_items: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
            readonly minItems: 1;
        };
        readonly invalidation_items: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
            readonly minItems: 1;
        };
        readonly notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/publishable-candidate.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_draft_pipeline_id", "title_set_id", "resolution_summary_id", "rulebook_compilation_id", "candidate_status", "structural_readiness_score", "blocking_issues", "warnings", "compatibility_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_draft_pipeline_id: {
            readonly type: "string";
            readonly pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly title_set_id: {
            readonly type: "string";
            readonly pattern: "^tset_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly resolution_summary_id: {
            readonly type: "string";
            readonly pattern: "^rsum_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly rulebook_compilation_id: {
            readonly type: "string";
            readonly pattern: "^rbcmp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly candidate_status: {
            readonly type: "string";
            readonly enum: import("../index.js").PublishableCandidateStatus[];
        };
        readonly structural_readiness_score: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 100;
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly compatibility_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/review-queue-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "queue_status", "priority_level", "entered_queue_at", "assigned_reviewer_nullable", "queue_reason", "blocking_flags", "warnings"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rqe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly queue_status: {
            readonly type: "string";
            readonly enum: import("../index.js").QueueStatus[];
        };
        readonly priority_level: {
            readonly type: "string";
            readonly enum: import("../index.js").PriorityLevel[];
        };
        readonly entered_queue_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly assigned_reviewer_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly queue_reason: {
            readonly type: "string";
            readonly enum: import("../index.js").ReasonCode[];
        };
        readonly blocking_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path", "is_resolved"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ReasonCode[];
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly is_resolved: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ReasonCode[];
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/editorial-review.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "review_status", "reviewer_id", "reviewed_at", "findings", "required_actions", "review_notes_nullable", "severity_summary"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^edrev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly review_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ReviewStatus[];
        };
        readonly reviewer_id: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly reviewed_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly findings: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "severity", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ReasonCode[];
                    };
                    readonly severity: {
                        readonly type: "string";
                        readonly enum: readonly ["low", "medium", "high", "critical"];
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly required_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "description", "owner", "is_mandatory"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ReasonCode[];
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly owner: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly is_mandatory: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly review_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly severity_summary: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["low", "medium", "high", "critical", "highest_severity", "total_findings"];
            readonly properties: {
                readonly low: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly medium: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly high: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly critical: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly highest_severity: {
                    readonly type: "string";
                    readonly enum: readonly ["low", "medium", "high", "critical"];
                };
                readonly total_findings: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/approval-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "approved_by", "approved_at", "approval_scope", "approval_notes_nullable", "publication_readiness_score"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^apd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly approved_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly approved_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly approval_scope: {
            readonly type: "string";
            readonly enum: import("../index.js").ApprovalScope[];
        };
        readonly approval_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly publication_readiness_score: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 100;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/rejection-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "rejected_by", "rejected_at", "rejection_reason_codes", "rejection_notes_nullable", "rework_required"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rjd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly rejected_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly rejected_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly rejection_reason_codes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").ReasonCode[];
            };
        };
        readonly rejection_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly rework_required: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/manual-override.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_entity_type", "target_entity_id", "override_type", "initiated_by", "initiated_at", "override_reason", "override_scope", "expiration_nullable", "audit_reference_id"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ovr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly target_entity_type: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_entity_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly override_type: {
            readonly type: "string";
            readonly enum: import("../index.js").OverrideType[];
        };
        readonly initiated_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly initiated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly override_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly override_scope: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["affected_fields", "allow_readiness_gate_bypass"];
            readonly properties: {
                readonly affected_fields: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly allow_readiness_gate_bypass: {
                    readonly type: "boolean";
                };
            };
        };
        readonly expiration_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly format: "date-time";
            }, {
                readonly type: "null";
            }];
        };
        readonly audit_reference_id: {
            readonly type: "string";
            readonly pattern: "^aref_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/audit-record.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "actor_id", "action_type", "target_type", "target_id", "action_timestamp", "action_payload_summary", "reason_codes", "correlation_id"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^aud_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly actor_id: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly action_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ActionType[];
        };
        readonly target_type: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly action_timestamp: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly action_payload_summary: {
            readonly type: "string";
            readonly minLength: 8;
        };
        readonly reason_codes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").ReasonCode[];
            };
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/revision-record.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_entity_type", "target_entity_id", "revision_number", "changed_fields", "changed_by", "changed_at", "revision_reason"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly target_entity_type: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_entity_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly revision_number: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly changed_fields: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["field_path", "previous_value_summary", "new_value_summary"];
                readonly properties: {
                    readonly field_path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly previous_value_summary: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly new_value_summary: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly changed_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly changed_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly revision_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/publication-ready-artifact.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "final_readiness_status", "approved_artifacts", "gating_summary", "generated_at", "generated_by", "handoff_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^prad_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly final_readiness_status: {
            readonly type: "string";
            readonly enum: import("../index.js").FinalReadinessStatus[];
        };
        readonly approved_artifacts: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^apd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
        };
        readonly gating_summary: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["readiness_status", "has_valid_approval", "has_terminal_rejection", "unresolved_blocking_flags_count", "checks"];
            readonly properties: {
                readonly readiness_status: {
                    readonly type: "string";
                    readonly enum: import("../index.js").FinalReadinessStatus[];
                };
                readonly has_valid_approval: {
                    readonly type: "boolean";
                };
                readonly has_terminal_rejection: {
                    readonly type: "boolean";
                };
                readonly unresolved_blocking_flags_count: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly checks: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly generated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly generated_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly handoff_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/controlled-state-transition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "from_state", "to_state", "transition_at", "transitioned_by", "transition_reason", "audit_record_id"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ctr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly from_state: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly to_state: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly transition_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly transitioned_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly transition_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly audit_record_id: {
            readonly type: "string";
            readonly pattern: "^aud_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/golden-dataset-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "dataset_scope", "input_artifact_refs", "expected_output_refs", "expected_invariants", "category_tags", "priority_level", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^gde_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly dataset_scope: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").DatasetScope[];
        };
        readonly input_artifact_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_output_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_invariants: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "#/$defs/expectedInvariant";
            };
        };
        readonly category_tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly priority_level: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").PriorityLevel[];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
    readonly $defs: {
        readonly artifactReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["module_name", "artifact_type", "artifact_id", "artifact_version_nullable", "uri_nullable"];
            readonly properties: {
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").TargetModule[];
                };
                readonly artifact_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_version_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "integer";
                        readonly minimum: 1;
                    }];
                };
                readonly uri_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
            };
        };
        readonly expectedInvariant: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "description", "path"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly description: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly path: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/regression-case.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "case_name", "target_module", "input_refs", "expected_behavior", "failure_signature_nullable", "severity", "linked_dataset_entry_id_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rgc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly case_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").TargetModule[];
        };
        readonly input_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_behavior: {
            readonly type: "string";
        };
        readonly failure_signature_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
            }];
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").SeverityLevel[];
        };
        readonly linked_dataset_entry_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^gde_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
    };
    readonly $defs: {
        readonly artifactReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["module_name", "artifact_type", "artifact_id", "artifact_version_nullable", "uri_nullable"];
            readonly properties: {
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").TargetModule[];
                };
                readonly artifact_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_version_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "integer";
                        readonly minimum: 1;
                    }];
                };
                readonly uri_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/adversarial-case.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_module", "adversarial_type", "crafted_input_refs", "expected_rejection_or_behavior", "risk_level", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^adv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").TargetModule[];
        };
        readonly adversarial_type: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").AdversarialType[];
        };
        readonly crafted_input_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_rejection_or_behavior: {
            readonly type: "string";
        };
        readonly risk_level: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").RiskLevel[];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
    readonly $defs: {
        readonly artifactReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["module_name", "artifact_type", "artifact_id", "artifact_version_nullable", "uri_nullable"];
            readonly properties: {
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").TargetModule[];
                };
                readonly artifact_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_version_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "integer";
                        readonly minimum: 1;
                    }];
                };
                readonly uri_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/module-health-metric.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "module_name", "metric_name", "metric_value", "metric_unit", "measured_at", "threshold_status", "notes_nullable", "threshold_metadata_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mhm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly module_name: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").TargetModule[];
        };
        readonly metric_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly metric_value: {
            readonly type: "number";
        };
        readonly metric_unit: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").MetricUnit[];
        };
        readonly measured_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly threshold_status: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").ThresholdStatus[];
        };
        readonly notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
            }];
        };
        readonly threshold_metadata_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["threshold_min_nullable", "threshold_max_nullable", "threshold_target_nullable"];
                readonly properties: {
                    readonly threshold_min_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "number";
                        }];
                    };
                    readonly threshold_max_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "number";
                        }];
                    };
                    readonly threshold_target_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "number";
                        }];
                    };
                };
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/pipeline-health-snapshot.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "snapshot_at", "covered_modules", "module_metrics", "pass_rate", "regression_status", "release_readiness_status", "blocking_issues", "warnings"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^phs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly snapshot_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly covered_modules: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly enum: import("../reliability/index.js").TargetModule[];
            };
        };
        readonly module_metrics: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/moduleHealthMetric";
            };
        };
        readonly pass_rate: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
        readonly regression_status: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").RegressionStatus[];
        };
        readonly release_readiness_status: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").ReleaseReadinessStatus[];
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/blockingReason";
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/warningMessage";
            };
        };
    };
    readonly $defs: {
        readonly moduleHealthMetric: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["id", "module_name", "metric_name", "metric_value", "metric_unit", "measured_at", "threshold_status", "notes_nullable", "threshold_metadata_nullable"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly pattern: "^mhm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                };
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").TargetModule[];
                };
                readonly metric_name: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly metric_value: {
                    readonly type: "number";
                };
                readonly metric_unit: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").MetricUnit[];
                };
                readonly measured_at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly threshold_status: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").ThresholdStatus[];
                };
                readonly notes_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
                readonly threshold_metadata_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["threshold_min_nullable", "threshold_max_nullable", "threshold_target_nullable"];
                        readonly properties: {
                            readonly threshold_min_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                            readonly threshold_max_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                            readonly threshold_target_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                        };
                    }];
                };
            };
        };
        readonly blockingReason: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "message", "module_name", "path"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly message: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").TargetModule[];
                };
                readonly path: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly warningMessage: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "message", "path"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly message: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly path: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/release-gate-evaluation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "evaluated_at", "target_scope", "schema_gate_pass", "validator_gate_pass", "test_gate_pass", "regression_gate_pass", "compatibility_gate_pass", "readiness_gate_pass", "final_gate_status", "blocking_reasons"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rge_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly evaluated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly target_scope: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").DatasetScope[];
        };
        readonly schema_gate_pass: {
            readonly type: "boolean";
        };
        readonly validator_gate_pass: {
            readonly type: "boolean";
        };
        readonly test_gate_pass: {
            readonly type: "boolean";
        };
        readonly regression_gate_pass: {
            readonly type: "boolean";
        };
        readonly compatibility_gate_pass: {
            readonly type: "boolean";
        };
        readonly readiness_gate_pass: {
            readonly type: "boolean";
        };
        readonly final_gate_status: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").FinalGateStatus[];
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/blockingReason";
            };
        };
    };
    readonly $defs: {
        readonly blockingReason: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "message", "module_name", "path"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly message: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").TargetModule[];
                };
                readonly path: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/quality-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "report_scope", "generated_at", "summary", "key_findings", "metrics_summary", "unresolved_issues", "recommendations"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^qrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly report_scope: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").ReportScope[];
        };
        readonly generated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly summary: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly key_findings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly metrics_summary: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/moduleHealthMetric";
            };
        };
        readonly unresolved_issues: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/blockingReason";
            };
        };
        readonly recommendations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
    readonly $defs: {
        readonly moduleHealthMetric: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["id", "module_name", "metric_name", "metric_value", "metric_unit", "measured_at", "threshold_status", "notes_nullable", "threshold_metadata_nullable"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly pattern: "^mhm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                };
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").TargetModule[];
                };
                readonly metric_name: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly metric_value: {
                    readonly type: "number";
                };
                readonly metric_unit: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").MetricUnit[];
                };
                readonly measured_at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly threshold_status: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").ThresholdStatus[];
                };
                readonly notes_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
                readonly threshold_metadata_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["threshold_min_nullable", "threshold_max_nullable", "threshold_target_nullable"];
                        readonly properties: {
                            readonly threshold_min_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                            readonly threshold_max_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                            readonly threshold_target_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                        };
                    }];
                };
            };
        };
        readonly blockingReason: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "message", "module_name", "path"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly message: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../reliability/index.js").TargetModule[];
                };
                readonly path: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/observability-event.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "event_type", "module_name", "correlation_id", "emitted_at", "severity", "payload_summary", "trace_refs", "diagnostic_tags"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^obe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly event_type: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").ObservabilityEventType[];
        };
        readonly module_name: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").TargetModule[];
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly emitted_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../reliability/index.js").SeverityLevel[];
        };
        readonly payload_summary: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["summary_type", "values"];
            readonly properties: {
                readonly summary_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly values: {
                    readonly type: "object";
                    readonly additionalProperties: {
                        readonly anyOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "number";
                        }, {
                            readonly type: "boolean";
                        }, {
                            readonly type: "null";
                        }];
                    };
                };
            };
        };
        readonly trace_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["trace_id", "span_id_nullable", "parent_trace_id_nullable"];
                readonly properties: {
                    readonly trace_id: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly span_id_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly minLength: 1;
                        }];
                    };
                    readonly parent_trace_id_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly minLength: 1;
                        }];
                    };
                };
            };
        };
        readonly diagnostic_tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/race-target.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["target_key", "display_label", "semantic_definition", "active", "ordering_priority_nullable"];
    readonly properties: {
        readonly target_key: {
            readonly type: "string";
            readonly pattern: "^[a-z][a-z0-9_]{1,31}$";
        };
        readonly display_label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly semantic_definition: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly active: {
            readonly type: "boolean";
        };
        readonly ordering_priority_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "integer";
                readonly minimum: 1;
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/race-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_canonical_event_id_nullable", "race_targets", "winning_condition", "deadline_resolution", "source_hierarchy_selection", "race_validation_status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^frc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_canonical_event_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly race_targets: {
            readonly type: "array";
            readonly minItems: 2;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/frontier-markets/race-target.schema.json";
            };
        };
        readonly winning_condition: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["type", "tie_break_policy"];
            readonly properties: {
                readonly type: {
                    readonly type: "string";
                    readonly enum: import("../index.js").WinningConditionType.FIRST_TO_OCCUR[];
                };
                readonly tie_break_policy: {
                    readonly type: "string";
                    readonly enum: readonly ["none", "lowest_ordering_priority"];
                };
            };
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly source_hierarchy_selection: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json";
        };
        readonly race_validation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").RaceValidationStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: readonly ["string", "number", "boolean", "null"];
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/sequence-target.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["target_key", "canonical_event_ref_or_predicate", "display_label", "semantic_definition", "required"];
    readonly properties: {
        readonly target_key: {
            readonly type: "string";
            readonly pattern: "^[a-z][a-z0-9_]{1,31}$";
        };
        readonly canonical_event_ref_or_predicate: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "canonical_event_id"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "canonical_event_ref";
                    };
                    readonly canonical_event_id: {
                        readonly type: "string";
                        readonly pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "predicate_key", "predicate_params"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "deterministic_predicate";
                    };
                    readonly predicate_key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly predicate_params: {
                        readonly type: "object";
                        readonly additionalProperties: {
                            readonly type: readonly ["string", "number", "boolean"];
                        };
                    };
                };
            }];
        };
        readonly display_label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly semantic_definition: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly required: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/sequence-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_event_graph_context_id", "sequence_targets", "required_order_policy", "completion_policy", "deadline_resolution", "sequence_validation_status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fse_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_event_graph_context_id: {
            readonly type: "string";
            readonly pattern: "^egnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly sequence_targets: {
            readonly type: "array";
            readonly minItems: 2;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/frontier-markets/sequence-target.schema.json";
            };
        };
        readonly required_order_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").RequiredOrderPolicy[];
        };
        readonly completion_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").CompletionPolicy[];
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly sequence_validation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").SequenceValidationStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: readonly ["string", "number", "boolean", "null"];
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/trigger-condition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["trigger_type", "upstream_event_ref_or_market_ref", "triggering_outcome", "trigger_deadline_nullable", "trigger_policy_notes"];
    readonly properties: {
        readonly trigger_type: {
            readonly type: "string";
            readonly enum: import("../index.js").TriggerType[];
        };
        readonly upstream_event_ref_or_market_ref: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "event_id"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "upstream_event";
                    };
                    readonly event_id: {
                        readonly type: "string";
                        readonly pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "market_id"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "upstream_market";
                    };
                    readonly market_id: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            }];
        };
        readonly triggering_outcome: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly trigger_deadline_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }];
        };
        readonly trigger_policy_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/conditional-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "trigger_condition", "dependent_contract_type", "dependent_outcome_schema", "activation_policy", "invalidation_policy", "deadline_resolution", "conditional_validation_status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fco_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly trigger_condition: {
            readonly $ref: "https://market-design-engine.dev/schemas/frontier-markets/trigger-condition.schema.json";
        };
        readonly dependent_contract_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ContractType[];
        };
        readonly dependent_outcome_schema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["schema_version", "required_outcome_keys"];
            readonly properties: {
                readonly schema_version: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly required_outcome_keys: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly activation_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").ActivationPolicy.EXPLICIT_TRIGGER_ONLY[];
        };
        readonly invalidation_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").InvalidationPolicy[];
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly conditional_validation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ConditionalValidationStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: readonly ["string", "number", "boolean", "null"];
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/dependency-link.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "source_ref", "target_ref", "dependency_type", "dependency_strength", "blocking"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_ref: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["ref_type", "ref_id"];
            readonly properties: {
                readonly ref_type: {
                    readonly type: "string";
                    readonly enum: readonly ["event", "market", "contract"];
                };
                readonly ref_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly target_ref: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["ref_type", "ref_id"];
            readonly properties: {
                readonly ref_type: {
                    readonly type: "string";
                    readonly enum: readonly ["event", "market", "contract"];
                };
                readonly ref_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly dependency_type: {
            readonly type: "string";
            readonly enum: import("../index.js").DependencyType[];
        };
        readonly dependency_strength: {
            readonly type: "string";
            readonly enum: import("../index.js").DependencyStrength[];
        };
        readonly blocking: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/advanced-outcome-generation-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "contract_type", "generated_outcomes", "validation_notes", "exhaustiveness_policy", "exclusivity_policy", "generation_confidence"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly contract_type: {
            readonly type: "string";
            readonly enum: readonly [import("../index.js").ContractType.RACE, import("../index.js").ContractType.SEQUENCE, import("../index.js").ContractType.CONDITIONAL];
        };
        readonly generated_outcomes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json";
            };
        };
        readonly validation_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly exhaustiveness_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").OutcomeExhaustivenessPolicy[];
        };
        readonly exclusivity_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").OutcomeExclusivityPolicy[];
        };
        readonly generation_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/advanced-contract-validation-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "contract_type", "validation_status", "blocking_issues", "warnings", "checked_invariants", "compatibility_notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fvr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly contract_type: {
            readonly type: "string";
            readonly enum: readonly [import("../index.js").ContractType.RACE, import("../index.js").ContractType.SEQUENCE, import("../index.js").ContractType.CONDITIONAL];
        };
        readonly validation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").AdvancedValidationStatus[];
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly checked_invariants: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "passed", "message"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly passed: {
                        readonly type: "boolean";
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly compatibility_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/advanced-market-compatibility-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "target", "status", "mapped_artifact", "notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fcp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly target: {
            readonly type: "string";
            readonly enum: readonly ["market_draft_pipeline", "publishing_engine", "editorial_pipeline"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").AdvancedCompatibilityStatus[];
        };
        readonly mapped_artifact: {
            readonly type: "object";
            readonly required: readonly ["readiness"];
            readonly properties: {
                readonly readiness: {
                    readonly type: "string";
                    readonly enum: import("../index.js").AdvancedCompatibilityStatus[];
                };
                readonly validation_status: {
                    readonly type: readonly ["string", "null"];
                    readonly enum: readonly [...import("../index.js").AdvancedValidationStatus[], null];
                };
            };
            readonly additionalProperties: true;
        };
        readonly notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-artifact.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["artifact_type", "artifact_ref", "integrity_hash", "required"];
    readonly properties: {
        readonly artifact_type: {
            readonly type: "string";
            readonly enum: import("../live-integration/index.js").ArtifactType[];
        };
        readonly artifact_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly integrity_hash: {
            readonly type: "string";
            readonly pattern: "^([a-fA-F0-9]{64}|sha256:[a-fA-F0-9]{64})$";
        };
        readonly required: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-package.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publication_ready_artifact_id", "packaged_artifacts", "package_metadata", "package_status", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$";
        };
        readonly publication_ready_artifact_id: {
            readonly type: "string";
            readonly pattern: "^prad_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly packaged_artifacts: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["artifact_type", "artifact_ref", "integrity_hash", "required"];
                readonly properties: {
                    readonly artifact_type: {
                        readonly type: "string";
                        readonly enum: import("../live-integration/index.js").ArtifactType[];
                    };
                    readonly artifact_ref: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly integrity_hash: {
                        readonly type: "string";
                        readonly pattern: "^([a-fA-F0-9]{64}|sha256:[a-fA-F0-9]{64})$";
                    };
                    readonly required: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly package_metadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["category", "tags", "jurisdiction", "display_priority", "market_visibility", "compliance_flags"];
            readonly properties: {
                readonly category: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly tags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly jurisdiction: {
                    readonly type: "string";
                    readonly pattern: "^[A-Z]{2,3}$";
                };
                readonly display_priority: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly market_visibility: {
                    readonly type: "string";
                    readonly enum: import("../live-integration/index.js").MarketVisibility[];
                };
                readonly compliance_flags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly enum: import("../live-integration/index.js").ComplianceFlag[];
                    };
                };
            };
        };
        readonly package_status: {
            readonly type: "string";
            readonly enum: import("../live-integration/index.js").PackageStatus[];
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-handoff.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publication_package_id", "handoff_status", "initiated_by", "initiated_at", "delivery_notes", "audit_ref"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^phnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly handoff_status: {
            readonly type: "string";
            readonly enum: import("../live-integration/index.js").HandoffStatus[];
        };
        readonly initiated_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly initiated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly delivery_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly pattern: "^aref_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/scheduling-window.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["start_at", "end_at"];
    readonly properties: {
        readonly start_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly end_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/scheduling-candidate.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "publication_package_id", "scheduling_window", "priority_level", "scheduling_notes", "scheduling_status", "readiness_status", "delivery_readiness_report_id", "blocking_issues_snapshot"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^scnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly scheduling_window: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["start_at", "end_at"];
            readonly properties: {
                readonly start_at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly end_at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
            };
        };
        readonly priority_level: {
            readonly type: "string";
            readonly enum: import("../index.js").EventPriority[];
        };
        readonly scheduling_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly scheduling_status: {
            readonly type: "string";
            readonly enum: import("../live-integration/index.js").SchedulingStatus[];
        };
        readonly readiness_status: {
            readonly type: "string";
            readonly enum: import("../live-integration/index.js").ReadinessStatus[];
        };
        readonly delivery_readiness_report_id: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly pattern: "^drrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }, {
                readonly type: "null";
            }];
        };
        readonly blocking_issues_snapshot: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-metadata.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["category", "tags", "jurisdiction", "display_priority", "market_visibility", "compliance_flags"];
    readonly properties: {
        readonly category: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly jurisdiction: {
            readonly type: "string";
            readonly pattern: "^[A-Z]{2,3}$";
        };
        readonly display_priority: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly market_visibility: {
            readonly type: "string";
            readonly enum: import("../live-integration/index.js").MarketVisibility[];
        };
        readonly compliance_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../live-integration/index.js").ComplianceFlag[];
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/live-publication-contract.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publication_package_id", "canonical_contract_ref", "publication_metadata", "activation_policy", "safety_checks", "contract_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lpct_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_contract_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly publication_metadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["category", "tags", "jurisdiction", "display_priority", "market_visibility", "compliance_flags"];
            readonly properties: {
                readonly category: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly tags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly jurisdiction: {
                    readonly type: "string";
                    readonly pattern: "^[A-Z]{2,3}$";
                };
                readonly display_priority: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly market_visibility: {
                    readonly type: "string";
                    readonly enum: import("../live-integration/index.js").MarketVisibility[];
                };
                readonly compliance_flags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly enum: import("../live-integration/index.js").ComplianceFlag[];
                    };
                };
            };
        };
        readonly activation_policy: {
            readonly type: "string";
            readonly enum: import("../live-integration/index.js").ActivationPolicy[];
        };
        readonly safety_checks: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly contract_status: {
            readonly type: "string";
            readonly enum: import("../live-integration/index.js").ContractStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/delivery-readiness-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "publication_package_id", "readiness_status", "blocking_issues", "warnings", "validated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^drrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly readiness_status: {
            readonly type: "string";
            readonly enum: import("../live-integration/index.js").ReadinessStatus[];
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly validated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/market-family.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "family_key", "source_context_type", "source_context_ref", "flagship_market_ref", "satellite_market_refs", "derivative_market_refs", "family_status", "family_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly family_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly source_context_type: {
            readonly type: "string";
            readonly enum: import("../index.js").SourceContextType[];
        };
        readonly source_context_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly flagship_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly satellite_market_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly derivative_market_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly family_status: {
            readonly type: "string";
            readonly enum: import("../index.js").FamilyStatus[];
        };
        readonly family_metadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["context_hash", "generation_mode", "tags", "notes"];
            readonly properties: {
                readonly context_hash: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly generation_mode: {
                    readonly type: "string";
                    readonly const: "deterministic-v1";
                };
                readonly tags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly notes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/flagship-market-selection.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "source_context_ref", "selected_market_ref", "selection_reason", "strategic_priority", "selection_confidence"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mfs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly source_context_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly selected_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly selection_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly strategic_priority: {
            readonly type: "integer";
            readonly minimum: 1;
            readonly maximum: 10;
        };
        readonly selection_confidence: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/satellite-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_family_id", "parent_market_ref", "market_ref", "satellite_role", "dependency_notes_nullable", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^msd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly parent_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly satellite_role: {
            readonly type: "string";
            readonly enum: import("../index.js").SatelliteRole[];
        };
        readonly dependency_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/derivative-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_family_id", "source_relation_ref", "market_ref", "derivative_type", "dependency_strength", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mdd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_relation_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly derivative_type: {
            readonly type: "string";
            readonly enum: import("../index.js").DerivativeType[];
        };
        readonly dependency_strength: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/market-relationship.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "source_market_ref", "target_market_ref", "relationship_type", "relationship_strength", "blocking_cannibalization", "notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mrl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly relationship_type: {
            readonly type: "string";
            readonly enum: import("../index.js").RelationshipType[];
        };
        readonly relationship_strength: {
            readonly type: "string";
            readonly enum: import("../index.js").RelationshipStrength[];
        };
        readonly blocking_cannibalization: {
            readonly type: "boolean";
        };
        readonly notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/expansion-strategy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "source_context_ref", "strategy_type", "allowed_contract_types", "max_satellite_count", "max_derivative_count", "anti_cannibalization_policy", "expansion_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mes_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly source_context_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly strategy_type: {
            readonly type: "string";
            readonly enum: import("../index.js").StrategyType[];
        };
        readonly allowed_contract_types: {
            readonly type: "array";
            readonly minItems: 1;
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").ContractType[];
            };
        };
        readonly max_satellite_count: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly max_derivative_count: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly anti_cannibalization_policy: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly expansion_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/cannibalization-check-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "family_id", "checked_market_pairs", "blocking_conflicts", "warnings", "check_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mcc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly checked_market_pairs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["source_market_ref", "target_market_ref"];
                readonly properties: {
                    readonly source_market_ref: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly target_market_ref: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly blocking_conflicts: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly check_status: {
            readonly type: "string";
            readonly enum: import("../index.js").CannibalizationStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/expansion-validation-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "family_id", "validation_status", "blocking_issues", "warnings", "checked_invariants", "compatibility_notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mvr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly validation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ExpansionValidationStatus[];
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly checked_invariants: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "passed", "description"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly passed: {
                        readonly type: "boolean";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly compatibility_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/family-generation-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_family_id", "generated_market_refs", "flagship_ref", "generation_status", "generation_confidence", "output_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly generated_market_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly flagship_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly generation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").GenerationStatus[];
        };
        readonly generation_confidence: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
        readonly output_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/market-family-compatibility-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "target", "status", "mapped_artifact", "notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mcp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly target: {
            readonly type: "string";
            readonly enum: readonly ["market_draft_pipeline", "publishable_candidate", "publication_ready_artifact", "editorial_pipeline"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").FamilyCompatibilityStatus[];
        };
        readonly mapped_artifact: {
            readonly type: "object";
            readonly additionalProperties: true;
            readonly required: readonly ["readiness", "validation_status"];
            readonly properties: {
                readonly readiness: {
                    readonly type: "string";
                    readonly enum: import("../index.js").FamilyCompatibilityStatus[];
                };
                readonly validation_status: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
            };
        };
        readonly notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/feedback-signal.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["signal_type", "payload"];
    readonly properties: {
        readonly signal_type: {
            readonly type: "string";
            readonly enum: import("../index.js").SignalType[];
        };
        readonly payload: {
            readonly type: "object";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/rejection-pattern.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "status", "reason_codes", "supporting_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").PatternStatus[];
        };
        readonly reason_codes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly supporting_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/override-pattern.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "status", "override_type", "supporting_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lop_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").PatternStatus[];
        };
        readonly override_type: {
            readonly type: "string";
            readonly enum: import("../index.js").LearningFeedbackOverrideType[];
        };
        readonly supporting_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/editorial-feedback-signal.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "feedback_type", "decision_refs", "reason_codes", "notes", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lfs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly feedback_type: {
            readonly type: "string";
            readonly enum: import("../index.js").FeedbackType[];
        };
        readonly decision_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly reason_codes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").FeedbackReasonCode[];
            };
        };
        readonly notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/reliability-learning-signal.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "release_impact", "safe_to_ignore", "ignored_ready", "active_pattern", "pattern_status", "occurrence_count", "evidence_refs", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lrs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly release_impact: {
            readonly type: "string";
            readonly enum: import("../index.js").ReleaseImpact[];
        };
        readonly safe_to_ignore: {
            readonly type: "boolean";
        };
        readonly ignored_ready: {
            readonly type: "boolean";
        };
        readonly active_pattern: {
            readonly type: "boolean";
        };
        readonly pattern_status: {
            readonly type: "string";
            readonly enum: import("../index.js").PatternStatus[];
        };
        readonly occurrence_count: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly evidence_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/learning-aggregation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "aggregation_status", "input_signal_refs", "aggregated_insight_refs", "generated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lag_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly aggregation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").AggregationStatus[];
        };
        readonly input_signal_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly aggregated_insight_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly generated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/learning-insight.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "insight_status", "title", "supporting_refs", "derived_recommendation_refs", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lin_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly insight_status: {
            readonly type: "string";
            readonly enum: import("../index.js").LearningInsightStatus[];
        };
        readonly title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly supporting_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly derived_recommendation_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/learning-recommendation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "status", "recommendation_text", "blocking_dependency_refs", "planned_action_refs", "generated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lrc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").RecommendationStatus[];
        };
        readonly recommendation_text: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly blocking_dependency_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly planned_action_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly generated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/improvement-artifact.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "artifact_type", "derived_from_refs", "safety_constraints", "rollout_notes", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lia_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly artifact_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ImprovementArtifactType[];
        };
        readonly derived_from_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly safety_constraints: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly rollout_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/learning-compatibility-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "correlation_id", "target", "status", "mapped_artifact", "notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lcp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly target: {
            readonly type: "string";
            readonly enum: import("../index.js").LearningCompatibilityTarget[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").LearningCompatibilityStatus[];
        };
        readonly mapped_artifact: {
            readonly type: "object";
            readonly additionalProperties: true;
            readonly required: readonly ["source_id", "target_id", "readiness", "lossy_fields"];
            readonly properties: {
                readonly source_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly target_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly readiness: {
                    readonly type: "string";
                    readonly enum: import("../index.js").LearningCompatibilityStatus[];
                };
                readonly lossy_fields: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/user-identity.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "display_name", "user_type", "status", "primary_workspace_id_nullable", "capability_flags", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly display_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly user_type: {
            readonly type: "string";
            readonly enum: import("../index.js").UserType[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").UserStatus[];
        };
        readonly primary_workspace_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly capability_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly metadata: {
            readonly type: "object";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/workspace.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "workspace_key", "display_name", "workspace_type", "status", "governance_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly workspace_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly display_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly workspace_type: {
            readonly type: "string";
            readonly enum: import("../index.js").WorkspaceType[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").WorkspaceStatus[];
        };
        readonly governance_metadata: {
            readonly type: "object";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/role-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "role_key", "display_name", "permission_set", "role_scope_policy", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly role_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly display_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly permission_set: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly minItems: 1;
            readonly uniqueItems: true;
        };
        readonly role_scope_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").RoleScopePolicy[];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/role-assignment.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "user_id", "role_id", "workspace_id_nullable", "access_scope", "assigned_by", "assigned_at", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^asg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly user_id: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly role_id: {
            readonly type: "string";
            readonly pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly workspace_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly access_scope: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"];
            readonly properties: {
                readonly scope_type: {
                    readonly type: "string";
                    readonly enum: import("../index.js").ScopeType[];
                };
                readonly workspace_id_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    }];
                };
                readonly module_scope_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly enum: import("../index.js").TargetModule[];
                    }];
                };
                readonly entity_scope_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
                readonly notes_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
            };
        };
        readonly assigned_by: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly assigned_at: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/permission-policy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "policy_key", "allowed_actions", "denied_actions_nullable", "scope_constraints", "policy_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly policy_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly allowed_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").ActionKey[];
            };
            readonly minItems: 1;
            readonly uniqueItems: true;
        };
        readonly denied_actions_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                    readonly enum: import("../index.js").ActionKey[];
                };
                readonly uniqueItems: true;
            }];
        };
        readonly scope_constraints: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"];
                readonly properties: {
                    readonly scope_type: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ScopeType[];
                    };
                    readonly workspace_id_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                        }];
                    };
                    readonly module_scope_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly enum: import("../index.js").TargetModule[];
                        }];
                    };
                    readonly entity_scope_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly minLength: 1;
                        }];
                    };
                    readonly notes_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                        }];
                    };
                };
            };
        };
        readonly policy_status: {
            readonly type: "string";
            readonly enum: import("../index.js").PolicyStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/access-scope.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"];
    readonly properties: {
        readonly scope_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ScopeType[];
        };
        readonly workspace_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly module_scope_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly enum: import("../index.js").TargetModule[];
            }];
        };
        readonly entity_scope_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
        readonly notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/authorization-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "user_id", "requested_action", "evaluated_scope", "decision_status", "matched_roles", "matched_policies", "blocking_reasons", "evaluated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^adz_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly user_id: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly requested_action: {
            readonly type: "string";
            readonly enum: import("../index.js").ActionKey[];
        };
        readonly evaluated_scope: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"];
            readonly properties: {
                readonly scope_type: {
                    readonly type: "string";
                    readonly enum: import("../index.js").ScopeType[];
                };
                readonly workspace_id_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    }];
                };
                readonly module_scope_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly enum: import("../index.js").TargetModule[];
                    }];
                };
                readonly entity_scope_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
                readonly notes_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
            };
        };
        readonly decision_status: {
            readonly type: "string";
            readonly enum: import("../index.js").DecisionStatus[];
        };
        readonly matched_roles: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
        };
        readonly matched_policies: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^pol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly evaluated_at: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/action-permission-check.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "action_key", "target_module", "target_entity_type_nullable", "required_permission", "decision_ref", "check_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^chk_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly action_key: {
            readonly type: "string";
            readonly enum: import("../index.js").ActionKey[];
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: import("../index.js").TargetModule[];
        };
        readonly target_entity_type_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
        readonly required_permission: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly decision_ref: {
            readonly type: "string";
            readonly pattern: "^adz_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly check_status: {
            readonly type: "string";
            readonly enum: import("../index.js").CheckStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/admin-capability-flag.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["flag_key", "description", "sensitive", "default_enabled"];
    readonly properties: {
        readonly flag_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly sensitive: {
            readonly type: "boolean";
        };
        readonly default_enabled: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/platform-action-compatibility.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_module", "action_key", "required_scope_type", "required_capabilities_nullable", "notes_nullable", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pac_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: import("../index.js").TargetModule[];
        };
        readonly action_key: {
            readonly type: "string";
            readonly enum: import("../index.js").ActionKey[];
        };
        readonly required_scope_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ScopeType[];
        };
        readonly required_capabilities_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly uniqueItems: true;
            }];
        };
        readonly notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
            }];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/shared-console.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["version"];
    readonly properties: {
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly action_key: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").OperationsConsoleActionKey[];
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").VisibilityStatus[];
        };
        readonly readiness_status: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").ReadinessStatus[];
        };
        readonly panel_key: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").PanelKey[];
        };
        readonly filter_operator: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").FilterOperator[];
        };
        readonly sort_direction: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").SortDirection[];
        };
        readonly persisted_state_policy: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").PersistedStatePolicy[];
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").OperationsConsoleSeverityLevel[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/queue-entry-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["entry_ref", "entry_type", "display_title", "status", "priority", "created_at", "owner_nullable", "warnings", "available_actions"];
    readonly properties: {
        readonly entry_ref: {
            readonly type: "string";
            readonly pattern: "^qer_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly entry_type: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").EntryType[];
        };
        readonly display_title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly priority: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly owner_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly minLength: 1;
            }, {
                readonly type: "null";
            }];
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly available_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../operations-console/index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/queue-panel-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "panel_key", "queue_scope", "entries", "filters", "sort_config", "summary_counts", "visibility_rules"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^qpv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly panel_key: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").PanelKey[];
        };
        readonly queue_scope: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").QueueScope[];
        };
        readonly entries: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/operations-console/queue-entry-view.schema.json";
            };
        };
        readonly filters: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["field", "operator", "value"];
                readonly properties: {
                    readonly field: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly operator: {
                        readonly type: "string";
                        readonly enum: import("../operations-console/index.js").FilterOperator[];
                    };
                    readonly value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly sort_config: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["sort_field", "sort_direction"];
            readonly properties: {
                readonly sort_field: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly sort_direction: {
                    readonly type: "string";
                    readonly enum: import("../operations-console/index.js").SortDirection[];
                };
            };
        };
        readonly summary_counts: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["total", "ready", "blocked", "warnings"];
            readonly properties: {
                readonly total: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly ready: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly blocked: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly warnings: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
        readonly visibility_rules: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["permission_key", "expected_visibility"];
                readonly properties: {
                    readonly permission_key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly expected_visibility: {
                        readonly type: "string";
                        readonly enum: import("../operations-console/index.js").VisibilityStatus[];
                    };
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/candidate-list-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "view_scope", "candidate_entries", "aggregate_counts", "applied_filters", "sort_config"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^clv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly view_scope: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").ViewScope[];
        };
        readonly candidate_entries: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["candidate_ref", "title", "readiness_status", "warnings_count"];
                readonly properties: {
                    readonly candidate_ref: {
                        readonly type: "string";
                        readonly pattern: "^cdr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                    readonly title: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly readiness_status: {
                        readonly type: "string";
                        readonly enum: import("../operations-console/index.js").ReadinessStatus[];
                    };
                    readonly warnings_count: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
        readonly aggregate_counts: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "integer";
                readonly minimum: 0;
            };
        };
        readonly applied_filters: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["field", "operator", "value"];
                readonly properties: {
                    readonly field: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly operator: {
                        readonly type: "string";
                        readonly enum: import("../operations-console/index.js").FilterOperator[];
                    };
                    readonly value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly sort_config: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["sort_field", "sort_direction"];
            readonly properties: {
                readonly sort_field: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly sort_direction: {
                    readonly type: "string";
                    readonly enum: import("../operations-console/index.js").SortDirection[];
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/candidate-detail-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "candidate_ref", "artifact_sections", "readiness_snapshot", "linked_audit_refs", "linked_review_refs", "linked_publication_refs", "visible_actions", "visibility_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^cdv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly candidate_ref: {
            readonly type: "string";
            readonly pattern: "^cdr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly artifact_sections: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["artifact_ref", "artifact_type", "section_title", "field_count"];
                readonly properties: {
                    readonly artifact_ref: {
                        readonly type: "string";
                        readonly pattern: "^arf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                    readonly artifact_type: {
                        readonly type: "string";
                        readonly enum: import("../operations-console/index.js").ArtifactType[];
                    };
                    readonly section_title: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly field_count: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
        readonly readiness_snapshot: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["readiness_status", "blocking_issues", "warnings"];
            readonly properties: {
                readonly readiness_status: {
                    readonly type: "string";
                    readonly enum: import("../operations-console/index.js").ReadinessStatus[];
                };
                readonly blocking_issues: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly warnings: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly linked_audit_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^aud_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
        };
        readonly linked_review_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^rev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
        };
        readonly linked_publication_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^pub_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
        };
        readonly visible_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../operations-console/index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").VisibilityStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/artifact-inspection-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "artifact_ref", "artifact_type", "structured_fields", "validation_snapshot", "compatibility_snapshot", "related_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^aiv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly artifact_ref: {
            readonly type: "string";
            readonly pattern: "^arf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly artifact_type: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").ArtifactType[];
        };
        readonly structured_fields: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["key", "value_type", "value_summary"];
                readonly properties: {
                    readonly key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value_type: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value_summary: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly validation_snapshot: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["is_valid", "issue_count", "blocking_issue_count"];
            readonly properties: {
                readonly is_valid: {
                    readonly type: "boolean";
                };
                readonly issue_count: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly blocking_issue_count: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
        readonly compatibility_snapshot: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["is_compatible", "incompatible_with", "lossy_fields"];
            readonly properties: {
                readonly is_compatible: {
                    readonly type: "boolean";
                };
                readonly incompatible_with: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly lossy_fields: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
            };
        };
        readonly related_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/audit-timeline-item.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["item_ref", "timestamp", "actor_ref", "action_type", "summary", "severity", "linked_entity_refs"];
    readonly properties: {
        readonly item_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly timestamp: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly actor_ref: {
            readonly type: "string";
            readonly pattern: "^act_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly action_type: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").TimelineActionType[];
        };
        readonly summary: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").OperationsConsoleSeverityLevel[];
        };
        readonly linked_entity_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/audit-timeline-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_ref", "timeline_items", "correlation_groups", "filter_state", "visibility_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^atv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly timeline_items: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/operations-console/audit-timeline-item.schema.json";
            };
        };
        readonly correlation_groups: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["group_ref", "item_refs"];
                readonly properties: {
                    readonly group_ref: {
                        readonly type: "string";
                        readonly pattern: "^cgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                    readonly item_refs: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                        readonly uniqueItems: true;
                    };
                };
            };
        };
        readonly filter_state: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["actor_refs", "action_types", "severity_levels"];
            readonly properties: {
                readonly actor_refs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly action_types: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly severity_levels: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
            };
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").VisibilityStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/readiness-panel-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_ref", "readiness_status", "gating_items", "blocking_issues", "warnings", "recommended_next_actions"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rpv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly readiness_status: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").ReadinessStatus[];
        };
        readonly gating_items: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["key", "satisfied", "reason_nullable"];
                readonly properties: {
                    readonly key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly satisfied: {
                        readonly type: "boolean";
                    };
                    readonly reason_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "string";
                            readonly minLength: 1;
                        }, {
                            readonly type: "null";
                        }];
                    };
                };
            };
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly recommended_next_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["action_key", "reason"];
                readonly properties: {
                    readonly action_key: {
                        readonly type: "string";
                        readonly enum: import("../operations-console/index.js").OperationsConsoleActionKey[];
                    };
                    readonly reason: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/action-surface.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_ref", "available_action_keys", "hidden_action_keys", "disabled_action_keys", "action_constraints", "permission_basis"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^asf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly available_action_keys: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../operations-console/index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly hidden_action_keys: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../operations-console/index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly disabled_action_keys: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../operations-console/index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly action_constraints: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["constraint_ref", "description", "is_blocking"];
                readonly properties: {
                    readonly constraint_ref: {
                        readonly type: "string";
                        readonly pattern: "^acr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly is_blocking: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly permission_basis: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["roles", "explicit_allow_actions", "explicit_deny_actions", "deny_first"];
            readonly properties: {
                readonly roles: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly explicit_allow_actions: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly enum: import("../operations-console/index.js").OperationsConsoleActionKey[];
                    };
                    readonly uniqueItems: true;
                };
                readonly explicit_deny_actions: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly enum: import("../operations-console/index.js").OperationsConsoleActionKey[];
                    };
                    readonly uniqueItems: true;
                };
                readonly deny_first: {
                    readonly type: "boolean";
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/console-navigation-state.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "active_panel", "active_filters", "selected_entity_ref_nullable", "breadcrumb_state", "user_scope", "persisted_state_policy"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^cns_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly active_panel: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").PanelKey[];
        };
        readonly active_filters: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["filters"];
            readonly properties: {
                readonly filters: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["field", "operator", "value"];
                        readonly properties: {
                            readonly field: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                            readonly operator: {
                                readonly type: "string";
                                readonly enum: import("../operations-console/index.js").FilterOperator[];
                            };
                            readonly value: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                        };
                    };
                };
            };
        };
        readonly selected_entity_ref_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly minLength: 1;
            }, {
                readonly type: "null";
            }];
        };
        readonly breadcrumb_state: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["items"];
            readonly properties: {
                readonly items: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly user_scope: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").ViewScope[];
        };
        readonly persisted_state_policy: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").PersistedStatePolicy[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/permission-aware-view-state.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "user_id", "workspace_id_nullable", "target_view_key", "visibility_status", "allowed_actions", "denied_actions", "evaluation_basis"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pvs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly user_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly workspace_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly minLength: 1;
            }, {
                readonly type: "null";
            }];
        };
        readonly target_view_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: import("../operations-console/index.js").VisibilityStatus[];
        };
        readonly allowed_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../operations-console/index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly denied_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../operations-console/index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly evaluation_basis: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["source_module", "evaluated_roles", "matched_rules", "deny_reasons"];
            readonly properties: {
                readonly source_module: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly evaluated_roles: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly matched_rules: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly deny_reasons: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/virtual-credit-account.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "owner_type", "owner_ref", "account_status", "currency_key", "current_balance_nullable", "overdraft_policy", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly owner_type: {
            readonly type: "string";
            readonly enum: import("../index.js").OwnerType[];
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly account_status: {
            readonly type: "string";
            readonly enum: import("../index.js").AccountStatus[];
        };
        readonly currency_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly current_balance_nullable: {
            readonly type: readonly ["number", "null"];
        };
        readonly overdraft_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").OverdraftPolicy[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-grant.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_account_id", "grant_type", "amount", "issued_by", "issued_at", "expiration_nullable", "grant_reason", "grant_status", "source_policy_ref_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vcg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly grant_type: {
            readonly type: "string";
            readonly enum: import("../index.js").GrantType[];
        };
        readonly amount: {
            readonly type: "number";
        };
        readonly issued_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly issued_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly expiration_nullable: {
            readonly type: readonly ["string", "null"];
            readonly format: "date-time";
        };
        readonly grant_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly grant_status: {
            readonly type: "string";
            readonly enum: import("../index.js").GrantStatus[];
        };
        readonly source_policy_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-ledger-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "account_id", "entry_type", "amount_delta", "resulting_balance_nullable", "correlation_id", "caused_by_ref", "created_at", "immutable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vcl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly entry_type: {
            readonly type: "string";
            readonly enum: import("../index.js").LedgerEntryType[];
        };
        readonly amount_delta: {
            readonly type: "number";
        };
        readonly resulting_balance_nullable: {
            readonly type: readonly ["number", "null"];
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly caused_by_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly immutable: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-consumption-event.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "account_id", "action_key", "consumption_amount", "consumed_at", "related_entity_ref_nullable", "quota_evaluation_ref_nullable", "consumption_status", "notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vce_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly action_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly consumption_amount: {
            readonly type: "number";
        };
        readonly consumed_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly related_entity_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly quota_evaluation_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly consumption_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ConsumptionStatus[];
        };
        readonly notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-balance-snapshot.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "account_id", "snapshot_balance", "snapshot_at", "included_ledger_refs", "consistency_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vcs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly snapshot_balance: {
            readonly type: "number";
        };
        readonly snapshot_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly included_ledger_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^vcl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
        };
        readonly consistency_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ConsistencyStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/quota-policy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "policy_key", "target_scope", "quota_type", "max_amount", "window_definition", "enforcement_mode", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vqp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly policy_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_scope: {
            readonly type: "string";
            readonly enum: import("../index.js").AccountOwnerScope[];
        };
        readonly quota_type: {
            readonly type: "string";
            readonly enum: import("../index.js").QuotaType[];
        };
        readonly max_amount: {
            readonly type: "number";
        };
        readonly window_definition: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["unit", "size"];
            readonly properties: {
                readonly unit: {
                    readonly type: "string";
                    readonly enum: import("../index.js").MeasurementWindowUnit[];
                };
                readonly size: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
            };
        };
        readonly enforcement_mode: {
            readonly type: "string";
            readonly enum: import("../index.js").EnforcementMode[];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/quota-evaluation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "policy_id", "target_account_id", "evaluated_action_key", "current_usage", "requested_usage", "decision_status", "blocking_reasons", "evaluated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vqe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly policy_id: {
            readonly type: "string";
            readonly pattern: "^vqp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly target_account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly evaluated_action_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly current_usage: {
            readonly type: "number";
        };
        readonly requested_usage: {
            readonly type: "number";
        };
        readonly decision_status: {
            readonly type: "string";
            readonly enum: import("../index.js").QuotaDecisionStatus[];
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly evaluated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/usage-counter.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "owner_ref", "counter_type", "measured_value", "measurement_window", "updated_at", "consistency_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vuc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly counter_type: {
            readonly type: "string";
            readonly enum: import("../index.js").CounterType[];
        };
        readonly measured_value: {
            readonly type: "number";
        };
        readonly measurement_window: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["unit", "size"];
            readonly properties: {
                readonly unit: {
                    readonly type: "string";
                    readonly enum: import("../index.js").MeasurementWindowUnit[];
                };
                readonly size: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
            };
        };
        readonly updated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly consistency_notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/bonus-eligibility.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_owner_ref", "bonus_type", "eligibility_status", "evaluated_at", "blocking_reasons", "supporting_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vbe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly bonus_type: {
            readonly type: "string";
            readonly enum: import("../index.js").BonusType[];
        };
        readonly eligibility_status: {
            readonly type: "string";
            readonly enum: import("../index.js").EligibilityStatus[];
        };
        readonly evaluated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly supporting_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/admin-credit-adjustment.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_account_id", "adjustment_type", "amount_delta", "initiated_by", "initiated_at", "adjustment_reason", "audit_ref", "applied_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vaa_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly adjustment_type: {
            readonly type: "string";
            readonly enum: import("../index.js").AdjustmentType[];
        };
        readonly amount_delta: {
            readonly type: "number";
        };
        readonly initiated_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly initiated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly adjustment_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly applied_status: {
            readonly type: "string";
            readonly enum: import("../index.js").AppliedStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/abuse-risk-flag.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_owner_ref", "risk_type", "severity", "detected_at", "related_refs", "active", "mitigation_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^var_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly risk_type: {
            readonly type: "string";
            readonly enum: import("../index.js").RiskType[];
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../index.js").RiskSeverity[];
        };
        readonly detected_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly related_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly active: {
            readonly type: "boolean";
        };
        readonly mitigation_notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credits-compatibility-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "owner_ref", "access_scope_ref", "account_ref_nullable", "visible_balance_nullable", "active_quota_refs", "active_risk_flags", "allowed_actions", "warnings", "compatibility_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly access_scope_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly account_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly visible_balance_nullable: {
            readonly type: readonly ["number", "null"];
        };
        readonly active_quota_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly active_risk_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly allowed_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly compatibility_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ConsistencyStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/admin-feature-flag.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "flag_key", "module_id", "source_id_nullable", "default_state", "enabled", "safety_level", "owner_ref", "audit_ref", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly flag_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly module_id: {
            readonly type: "string";
            readonly pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^ags_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly default_state: {
            readonly type: "string";
            readonly enum: import("../index.js").DefaultState[];
        };
        readonly enabled: {
            readonly type: "boolean";
        };
        readonly safety_level: {
            readonly type: "string";
            readonly enum: import("../index.js").SafetyControlLevel[];
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-module.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "status", "supported_operations", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").GovernanceModuleStatus[];
        };
        readonly supported_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-source.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "source_key", "source_type", "trust_weight", "active", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ags_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly source_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly source_type: {
            readonly type: "string";
            readonly enum: import("../index.js").GovernanceSourceType[];
        };
        readonly trust_weight: {
            readonly type: "number";
        };
        readonly active: {
            readonly type: "boolean";
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/guardrail-policy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "operation_key", "severity", "deny_by_default", "active", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly operation_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../index.js").GuardrailSeverity[];
        };
        readonly deny_by_default: {
            readonly type: "boolean";
        };
        readonly active: {
            readonly type: "boolean";
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/emergency-control.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "state", "reason", "activated_by", "activated_at", "expires_at_nullable", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^age_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly state: {
            readonly type: "string";
            readonly enum: import("../index.js").EmergencyState[];
        };
        readonly reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly activated_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly activated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly expires_at_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly format: "date-time";
            }];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/override-request.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "operation_key", "requested_by", "reason", "status", "requested_at", "expires_at_nullable", "resolved_by_nullable", "audit_ref", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ago_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly operation_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly requested_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").OverrideStatus[];
        };
        readonly requested_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly expires_at_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly format: "date-time";
            }];
        };
        readonly resolved_by_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-environment-binding.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_id", "environment_key", "environment_tier", "status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_id: {
            readonly type: "string";
            readonly pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly environment_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly environment_tier: {
            readonly type: "string";
            readonly enum: import("../index.js").EnvironmentTier[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").EnvironmentStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_id", "operation_key", "status", "decided_by", "decided_at", "audit_ref", "reasons", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_id: {
            readonly type: "string";
            readonly pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly operation_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").AdminGovernanceDecisionStatus[];
        };
        readonly decided_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly decided_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-audit-link.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "audit_ref", "link_type", "decision_ref_nullable", "override_ref_nullable", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^aga_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly link_type: {
            readonly type: "string";
            readonly enum: import("../index.js").AuditLinkType[];
        };
        readonly decision_ref_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^agd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly override_ref_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^ago_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/admin-governance-compatibility-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "requested_operations", "allowed_operations", "denied_operations", "lossy_fields", "status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly requested_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly allowed_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly lossy_fields: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").CompatibilityStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-compatibility-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "allowed_operations", "denied_operations", "status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly allowed_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").CompatibilityStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/platform-access-governance-context.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["module_key", "requested_operations", "denied_operations"];
    readonly properties: {
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly requested_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/operations-console-governance-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["module_key", "visible_operations"];
    readonly properties: {
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly visible_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/editorial-governance-guard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["denied_operations"];
    readonly properties: {
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/publication-governance-guard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["denied_operations"];
    readonly properties: {
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/reliability-governance-guard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["denied_operations"];
    readonly properties: {
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/virtual-credits-governance-guard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["denied_operations"];
    readonly properties: {
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-provenance-metadata.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["fetchedAt", "sourceDefinitionId", "runIdNullable", "sourceKey", "sourceRoleNullable", "sourceTier", "trustTier", "endpointReferenceNullable", "adapterKeyNullable", "fetchMetadataNullable"];
    readonly properties: {
        readonly fetchedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
        readonly sourceDefinitionId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId";
        };
        readonly runIdNullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryRunId";
            }, {
                readonly type: "null";
            }];
        };
        readonly sourceKey: {
            readonly type: "string";
            readonly pattern: "^[a-z0-9][a-z0-9_-]{2,62}$";
        };
        readonly sourceRoleNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly enum: import("../index.js").DiscoverySourceUsageRole[];
            }, {
                readonly type: "null";
            }];
        };
        readonly sourceTier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceTier[];
        };
        readonly trustTier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryTrustTier[];
        };
        readonly endpointReferenceNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly adapterKeyNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly fetchMetadataNullable: {
            readonly oneOf: readonly [{
                type: string;
                additionalProperties: boolean;
                properties: {
                    statusCodeNullable: {
                        oneOf: {
                            type: string;
                        }[];
                    };
                    etagNullable: {
                        oneOf: {
                            type: string;
                        }[];
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/normalized-discovery-item.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["headline", "bodySnippetNullable", "canonicalUrl", "externalItemId", "publishedAt", "publishedAtPresent", "sourceReference", "geoSignalNullable", "geoPlaceTextNullable", "topicSignalNullable", "languageCode", "observedMetricsNullable"];
    readonly properties: {
        readonly headline: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly bodySnippetNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly canonicalUrl: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly externalItemId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly publishedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
        readonly publishedAtPresent: {
            readonly type: "boolean";
        };
        readonly sourceReference: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                sourceId: {
                    $ref: string;
                };
                locator: {
                    type: string;
                    minLength: number;
                };
                labelNullable: {
                    oneOf: {
                        type: string;
                    }[];
                };
                sourceKeyNullable: {
                    oneOf: ({
                        type: string;
                        pattern: string;
                    } | {
                        type: string;
                        pattern?: never;
                    })[];
                };
            };
        };
        readonly geoSignalNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly enum: import("../index.js").DiscoveryGeoScope[];
            }, {
                readonly type: "null";
            }];
        };
        readonly geoPlaceTextNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly topicSignalNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly enum: import("../index.js").DiscoveryTopicScope[];
            }, {
                readonly type: "null";
            }];
        };
        readonly languageCode: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/languageCode";
        };
        readonly observedMetricsNullable: {
            readonly oneOf: readonly [{
                type: string;
                additionalProperties: boolean;
                properties: {
                    pageviewsNullable: {
                        type: string;
                    };
                    timeframeNullable: {
                        type: string;
                    };
                    regionNullable: {
                        type: string;
                    };
                    channelIdNullable: {
                        type: string;
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/normalized-discovery-payload.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["items", "provenanceMetadata", "sourceId"];
    readonly properties: {
        readonly items: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/discovery/normalized-discovery-item.schema.json";
            };
        };
        readonly provenanceMetadata: {
            readonly $ref: "https://market-design-engine.dev/schemas/discovery/discovery-provenance-metadata.schema.json";
        };
        readonly sourceId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-source-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "key", "kind", "tier", "status", "pollingHint", "geoScope", "topicScope", "trustTier", "endpoint", "authMode", "sourceDefinitionIdNullable"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId";
        };
        readonly key: {
            readonly type: "string";
            readonly pattern: "^[a-z0-9][a-z0-9_-]{2,62}$";
        };
        readonly kind: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceKind[];
        };
        readonly tier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceTier[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceStatus[];
        };
        readonly pollingHint: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryPollingHint[];
        };
        readonly geoScope: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryGeoScope[];
        };
        readonly topicScope: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryTopicScope[];
        };
        readonly trustTier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryTrustTier[];
        };
        readonly endpoint: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                url: {
                    type: string;
                    minLength: number;
                };
                method: {
                    type: string;
                    minLength: number;
                };
                headersNullable: {
                    oneOf: ({
                        type: string;
                        additionalProperties: {
                            type: string;
                        };
                    } | {
                        type: string;
                        additionalProperties?: never;
                    })[];
                };
            };
        };
        readonly authMode: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceAuthMode[];
        };
        readonly sourceDefinitionIdNullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId";
            }, {
                readonly type: "null";
            }];
        };
        readonly roleNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly enum: import("../index.js").DiscoverySourceUsageRole[];
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-source-catalog-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "key", "name", "kind", "tier", "status", "role", "pollingHint", "geoScope", "topicScope", "trustTier", "endpoint", "authMode", "sourceDefinitionIdNullable", "scheduleHint", "descriptionNullable", "capabilities"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId";
        };
        readonly key: {
            readonly type: "string";
            readonly pattern: "^[a-z0-9][a-z0-9_-]{2,62}$";
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly kind: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceKind[];
        };
        readonly tier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceTier[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceStatus[];
        };
        readonly role: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceUsageRole[];
        };
        readonly pollingHint: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryPollingHint[];
        };
        readonly geoScope: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryGeoScope[];
        };
        readonly topicScope: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryTopicScope[];
        };
        readonly trustTier: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryTrustTier[];
        };
        readonly endpoint: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                url: {
                    type: string;
                    minLength: number;
                };
                method: {
                    type: string;
                    minLength: number;
                };
                headersNullable: {
                    oneOf: ({
                        type: string;
                        additionalProperties: {
                            type: string;
                        };
                    } | {
                        type: string;
                        additionalProperties?: never;
                    })[];
                };
            };
        };
        readonly authMode: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySourceAuthMode[];
        };
        readonly sourceDefinitionIdNullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId";
            }, {
                readonly type: "null";
            }];
        };
        readonly scheduleHint: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                cronExpressionNullable: {
                    oneOf: {
                        type: string;
                    }[];
                };
                intervalSecondsNullable: {
                    oneOf: ({
                        type: string;
                        minimum: number;
                    } | {
                        type: string;
                        minimum?: never;
                    })[];
                };
            };
        };
        readonly descriptionNullable: {
            readonly oneOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly capabilities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").DiscoverySourceCapability[];
            };
            readonly minItems: 0;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-validation-failure.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["code", "path", "message", "contextNullable"];
    readonly properties: {
        readonly code: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly path: {
            readonly type: "string";
        };
        readonly message: {
            readonly type: "string";
        };
        readonly contextNullable: {
            readonly oneOf: readonly [{
                readonly type: "object";
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-error-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["runId", "code", "message", "failures", "timestamp"];
    readonly properties: {
        readonly runId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryRunId";
        };
        readonly code: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryErrorCode[];
        };
        readonly message: {
            readonly type: "string";
        };
        readonly failures: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/discovery/discovery-validation-failure.schema.json";
            };
        };
        readonly timestamp: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-run-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["runId", "sourceIds", "trigger", "scheduleHintNullable", "executionWindowNullable"];
    readonly properties: {
        readonly runId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryRunId";
        };
        readonly sourceIds: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySourceId";
            };
        };
        readonly trigger: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoveryRunTrigger[];
        };
        readonly scheduleHintNullable: {
            readonly oneOf: readonly [{
                type: string;
                additionalProperties: boolean;
                required: string[];
                properties: {
                    cronExpressionNullable: {
                        oneOf: {
                            type: string;
                        }[];
                    };
                    intervalSecondsNullable: {
                        oneOf: {
                            type: string;
                        }[];
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly executionWindowNullable: {
            readonly oneOf: readonly [{
                type: string;
                additionalProperties: boolean;
                required: string[];
                properties: {
                    start: {
                        $ref: string;
                    };
                    end: {
                        $ref: string;
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-job-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["jobId", "runDefinition", "scheduleHint", "maxDurationSecondsNullable"];
    readonly properties: {
        readonly jobId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryJobId";
        };
        readonly runDefinition: {
            readonly $ref: "https://market-design-engine.dev/schemas/discovery/discovery-run-definition.schema.json";
        };
        readonly scheduleHint: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                cronExpressionNullable: {
                    oneOf: {
                        type: string;
                    }[];
                };
                intervalSecondsNullable: {
                    oneOf: {
                        type: string;
                    }[];
                };
            };
        };
        readonly maxDurationSecondsNullable: {
            readonly oneOf: readonly [{
                readonly type: "number";
            }, {
                readonly type: "null";
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-signal.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "kind", "payloadRef", "timeWindow", "freshnessClass", "priorityHint", "status", "evidenceRefs", "provenanceMetadata", "createdAt"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoverySignalId";
        };
        readonly kind: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySignalKind[];
        };
        readonly payloadRef: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                normalizedItemId: {
                    type: string;
                    minLength: number;
                };
            };
        };
        readonly timeWindow: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                start: {
                    $ref: string;
                };
                end: {
                    $ref: string;
                };
            };
        };
        readonly freshnessClass: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySignalFreshnessClass[];
        };
        readonly priorityHint: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySignalPriorityHint[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").DiscoverySignalStatus[];
        };
        readonly evidenceRefs: {
            readonly type: "array";
            readonly items: {
                type: string;
                additionalProperties: boolean;
                required: string[];
                properties: {
                    itemId: {
                        type: string;
                        minLength: number;
                    };
                    role: {
                        type: string;
                        enum: import("../index.js").DiscoveryEvidenceRole[];
                    };
                };
            };
        };
        readonly provenanceMetadata: {
            readonly $ref: "https://market-design-engine.dev/schemas/discovery/discovery-provenance-metadata.schema.json";
        };
        readonly createdAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/entities/source-record.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "sourceType", "sourceName", "sourceAuthorityScore", "title", "description", "url", "publishedAt", "capturedAt", "locale", "tags", "externalRef", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId";
        };
        readonly sourceType: {
            readonly type: "string";
            readonly enum: import("../index.js").SourceType[];
        };
        readonly sourceName: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly sourceAuthorityScore: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly title: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json";
        };
        readonly description: {
            readonly type: readonly ["string", "null"];
        };
        readonly url: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/url.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly publishedAt: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly capturedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly locale: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/locale";
            }, {
                readonly type: "null";
            }];
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag";
            };
        };
        readonly externalRef: {
            readonly type: readonly ["string", "null"];
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/entities/event-signal.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "sourceRecordIds", "rawHeadline", "rawSummary", "eventCategory", "eventPriority", "occurredAt", "detectedAt", "jurisdictions", "involvedEntities", "tags", "confidenceScore", "status", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId";
        };
        readonly sourceRecordIds: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId";
            };
        };
        readonly rawHeadline: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json";
        };
        readonly rawSummary: {
            readonly type: readonly ["string", "null"];
        };
        readonly eventCategory: {
            readonly type: "string";
            readonly enum: import("../index.js").EventCategory[];
        };
        readonly eventPriority: {
            readonly type: "string";
            readonly enum: import("../index.js").EventPriority[];
        };
        readonly occurredAt: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly detectedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly jurisdictions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly involvedEntities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag";
            };
        };
        readonly confidenceScore: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").EventStatus[];
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/entities/canonical-event.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "title", "slug", "description", "category", "priority", "status", "occurredAt", "firstObservedAt", "lastUpdatedAt", "jurisdictions", "involvedEntities", "supportingSourceRecordIds", "supportingSignalIds", "tags", "confidenceScore", "resolutionWindow", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId";
        };
        readonly title: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json";
        };
        readonly slug: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/slug.schema.json";
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly category: {
            readonly type: "string";
            readonly enum: import("../index.js").EventCategory[];
        };
        readonly priority: {
            readonly type: "string";
            readonly enum: import("../index.js").EventPriority[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").EventStatus[];
        };
        readonly occurredAt: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly firstObservedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly lastUpdatedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly jurisdictions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly involvedEntities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly supportingSourceRecordIds: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId";
            };
        };
        readonly supportingSignalIds: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId";
            };
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag";
            };
        };
        readonly confidenceScore: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json";
        };
        readonly resolutionWindow: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["openAt", "closeAt"];
                readonly properties: {
                    readonly openAt: {
                        readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                    };
                    readonly closeAt: {
                        readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/entities/structured-claim.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "canonicalEventId", "claimText", "normalizedClaimText", "polarity", "claimSubject", "claimPredicate", "claimObject", "resolutionBasis", "resolutionWindow", "confidenceScore", "sourceRecordIds", "tags", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/claimId";
        };
        readonly canonicalEventId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId";
        };
        readonly claimText: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly normalizedClaimText: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly polarity: {
            readonly type: "string";
            readonly enum: import("../index.js").ClaimPolarity[];
        };
        readonly claimSubject: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly claimPredicate: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly claimObject: {
            readonly type: readonly ["string", "null"];
        };
        readonly resolutionBasis: {
            readonly type: "string";
            readonly enum: import("../index.js").MarketResolutionBasis[];
        };
        readonly resolutionWindow: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["openAt", "closeAt"];
            readonly properties: {
                readonly openAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                };
                readonly closeAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                };
            };
        };
        readonly confidenceScore: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json";
        };
        readonly sourceRecordIds: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId";
            };
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag";
            };
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/entities/market-outcome.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "outcomeType", "label", "shortLabel", "description", "orderIndex", "probabilityHint", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/outcomeId";
        };
        readonly outcomeType: {
            readonly type: "string";
            readonly enum: import("../index.js").CandidateOutcomeType[];
        };
        readonly label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly shortLabel: {
            readonly type: readonly ["string", "null"];
        };
        readonly description: {
            readonly type: readonly ["string", "null"];
        };
        readonly orderIndex: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly probabilityHint: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/probability.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/entities/candidate-market.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "claimId", "canonicalEventId", "title", "slug", "description", "resolutionBasis", "resolutionWindow", "outcomes", "marketType", "categories", "tags", "confidenceScore", "draftNotes", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/candidateMarketId";
        };
        readonly claimId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/claimId";
        };
        readonly canonicalEventId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId";
        };
        readonly title: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json";
        };
        readonly slug: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/slug.schema.json";
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly resolutionBasis: {
            readonly type: "string";
            readonly enum: import("../index.js").MarketResolutionBasis[];
        };
        readonly resolutionWindow: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["openAt", "closeAt"];
            readonly properties: {
                readonly openAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                };
                readonly closeAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                };
            };
        };
        readonly outcomes: {
            readonly type: "array";
            readonly minItems: 2;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/entities/market-outcome.schema.json";
            };
        };
        readonly marketType: {
            readonly type: "string";
            readonly enum: import("../index.js").MarketType[];
        };
        readonly categories: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag";
            };
        };
        readonly confidenceScore: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json";
        };
        readonly draftNotes: {
            readonly type: readonly ["string", "null"];
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/entities/validation-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["targetType", "targetId", "isValid", "issues", "generatedAt"];
    readonly properties: {
        readonly targetType: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly targetId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly isValid: {
            readonly type: "boolean";
        };
        readonly issues: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/shared.schema.json#/$defs/validationIssue";
            };
        };
        readonly generatedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/entities/workflow-instance.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["workflowId", "targetType", "targetId", "currentState", "previousState", "transitionHistory", "lastTransitionAt", "entityVersion"];
    readonly properties: {
        readonly workflowId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly targetType: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly targetId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly currentState: {
            readonly type: "string";
            readonly enum: import("../index.js").WorkflowState[];
        };
        readonly previousState: {
            readonly oneOf: readonly [{
                readonly type: "string";
                readonly enum: import("../index.js").WorkflowState[];
            }, {
                readonly type: "null";
            }];
        };
        readonly transitionHistory: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/shared.schema.json#/$defs/workflowTransitionRecord";
            };
        };
        readonly lastTransitionAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
}];
export { canonicalEventSchema, candidateMarketSchema, confidenceScoreSchema, eventSignalSchema, marketOutcomeSchema, moneySchema, primitivesSchema, probabilitySchema, reliabilityProfileSchema, freshnessProfileSchema, sourceDefinitionSchema, sourceRegistryEntrySchema, sourceObservationSchema, observationNormalizationResultSchema, eventIntelligenceSharedSchema, observationInterpretationSchema, eventCandidateSchema, canonicalEventIntelligenceSchema, eventGraphNodeSchema, eventRelationSchema, entityNormalizationResultSchema, eventClusterSchema, deduplicationDecisionSchema, eventConflictSchema, opportunityAssessmentSchema, contractSelectionSchema, outcomeDefinitionSchema, outcomeGenerationResultSchema, deadlineResolutionSchema, sourceHierarchySelectionSchema, preliminaryScorecardSchema, marketDraftPipelineSchema, titleSetSchema, resolutionSummarySchema, rulebookSectionSchema, rulebookCompilationSchema, timePolicyRenderSchema, sourcePolicyRenderSchema, edgeCaseRenderSchema, publishableCandidateSchema, reviewQueueEntrySchema, editorialReviewSchema, approvalDecisionSchema, rejectionDecisionSchema, manualOverrideSchema, auditRecordSchema, revisionRecordSchema, publicationReadyArtifactSchema, controlledStateTransitionSchema, goldenDatasetEntrySchema, regressionCaseSchema, adversarialCaseSchema, moduleHealthMetricSchema, pipelineHealthSnapshotSchema, releaseGateEvaluationSchema, qualityReportSchema, observabilityEventSchema, raceTargetSchema, raceMarketDefinitionSchema, sequenceTargetSchema, sequenceMarketDefinitionSchema, triggerConditionSchema, conditionalMarketDefinitionSchema, dependencyLinkSchema, advancedOutcomeGenerationResultSchema, advancedContractValidationReportSchema, advancedMarketCompatibilityResultSchema, liveIntegrationSchemas, publicationArtifactSchema, publicationPackageSchema, publicationHandoffSchema, schedulingWindowSchema, schedulingCandidateSchema, publicationMetadataSchema, livePublicationContractSchema, deliveryReadinessReportSchema, marketExpansionSchemas, marketFamilySchema, flagshipMarketSelectionSchema, satelliteMarketDefinitionSchema, derivativeMarketDefinitionSchema, marketRelationshipSchema, expansionStrategySchema, cannibalizationCheckResultSchema, expansionValidationReportSchema, familyGenerationResultSchema, marketFamilyCompatibilityResultSchema, learningFeedbackSchemas, feedbackSignalSchema, editorialFeedbackSchema, rejectionPatternSchema, overridePatternSchema, reliabilityFeedbackSchema, feedbackAggregationSchema, editorialFeedbackSignalSchema, reliabilityLearningSignalSchema, learningAggregationSchema, learningInsightSchema, recommendationSetSchema, learningRecommendationSchema, generatorImprovementArtifactSchema, improvementArtifactSchema, learningCompatibilityResultSchema, platformAccessSchemas, userIdentitySchema, workspaceSchema, roleDefinitionSchema, roleAssignmentSchema, permissionPolicySchema, accessScopeSchema, authorizationDecisionSchema, actionPermissionCheckSchema, adminCapabilityFlagSchema, platformActionCompatibilitySchema, operationsConsoleSchemas, virtualCreditSchemas, queuePanelViewSchema, queueEntryViewSchema, candidateListViewSchema, candidateDetailViewSchema, artifactInspectionViewSchema, auditTimelineItemSchema, auditTimelineViewSchema, readinessPanelViewSchema, actionSurfaceSchema, consoleNavigationStateSchema, permissionAwareViewStateSchema, sharedConsoleSchema, adminGovernanceSchemas, adminFeatureFlagSchema, governanceModuleSchema, governanceSourceSchema, guardrailPolicySchema, emergencyControlSchema, overrideRequestSchema, governanceEnvironmentBindingSchema, governanceDecisionSchema, governanceAuditLinkSchema, adminGovernanceCompatibilityViewSchema, ADMIN_FEATURE_FLAG_SCHEMA_ID, ADMIN_GOVERNANCE_COMPATIBILITY_VIEW_SCHEMA_ID, sharedSchema, slugSchema, sourceRecordSchema, structuredClaimSchema, timestampSchema, titleSchema, urlSchema, validationReportSchema, workflowInstanceSchema, };
//# sourceMappingURL=index.d.ts.map