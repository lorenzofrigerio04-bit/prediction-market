import { describe, expect, it } from "vitest";
import {
  ActivationPolicy,
  ArtifactType,
  ComplianceFlag,
  ContractStatus,
  MarketVisibility,
  DeterministicDeliveryReadinessEvaluator,
  DeterministicLiveContractBuilder,
  DeterministicPublicationHandoffManager,
  DeterministicPublicationPackager,
  DeterministicSchedulingPreparer,
  HandoffStatus,
  PackageStatus,
  ReadinessStatus,
  SchedulingStatus,
  createDeliveryReadinessReport,
  createLivePublicationContract,
  createPublicationArtifact,
  createPublicationHandoff,
  createPublicationMetadata,
  createPublicationPackage,
  createSchedulingCandidate,
  createSchedulingWindow,
  validateDeliveryReadinessReport,
  validateLiveIntegrationPipeline,
  validateLivePublicationContract,
  validatePublicationHandoff,
  validatePublicationPackage,
  validateSchedulingCandidate,
  DELIVERY_READINESS_REPORT_SCHEMA_ID,
  LIVE_PUBLICATION_CONTRACT_SCHEMA_ID,
  PUBLICATION_ARTIFACT_SCHEMA_ID,
  PUBLICATION_HANDOFF_SCHEMA_ID,
  PUBLICATION_METADATA_SCHEMA_ID,
  PUBLICATION_PACKAGE_SCHEMA_ID,
  SCHEDULING_CANDIDATE_SCHEMA_ID,
  SCHEDULING_WINDOW_SCHEMA_ID,
} from "../../src/live-integration/index.js";
import { EventPriority } from "../../src/enums/event-priority.enum.js";
import { FinalReadinessStatus } from "../../src/editorial/enums/final-readiness-status.enum.js";
import { createPublicationReadyArtifact } from "../../src/editorial/readiness/entities/publication-ready-artifact.entity.js";
import {
  createApprovalDecisionId,
  createEditorialActorId,
  createPublicationReadyArtifactId,
} from "../../src/editorial/value-objects/editorial-ids.vo.js";
import { createPublishableCandidateId } from "../../src/publishing/value-objects/publishing-ids.vo.js";
import { createEntityVersion } from "../../src/value-objects/entity-version.vo.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
import { requireSchemaValidator } from "../../src/validators/common/validation-result.js";
import type { LiveIntegrationPipelineInput } from "../../src/live-integration/contracts/interfaces/publication-validator.js";
import type { AuditReference } from "../../src/live-integration/value-objects/audit-reference.vo.js";

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);

const makePublicationReadyArtifact = () =>
  createPublicationReadyArtifact({
    id: createPublicationReadyArtifactId("prad_live0001"),
    version: createEntityVersion(1),
    publishable_candidate_id: createPublishableCandidateId("pcnd_live0001"),
    final_readiness_status: FinalReadinessStatus.APPROVED,
    approved_artifacts: [createApprovalDecisionId("apd_live0001")],
    gating_summary: {
      readiness_status: FinalReadinessStatus.APPROVED,
      has_valid_approval: true,
      has_terminal_rejection: false,
      unresolved_blocking_flags_count: 0,
      checks: ["editorial gate passed"],
    },
    generated_at: createTimestamp("2026-03-01T12:00:00.000Z"),
    generated_by: createEditorialActorId("actor_live0001"),
    handoff_notes_nullable: null,
  });

const makePublicationMetadata = () =>
  createPublicationMetadata({
    category: "macro",
    tags: ["rates", "fed"],
    jurisdiction: "US",
    display_priority: 1,
    market_visibility: MarketVisibility.PUBLIC,
    compliance_flags: [ComplianceFlag.REVIEWED, ComplianceFlag.JURISDICTION_CHECKED],
  });

const makePublicationPackage = () =>
  createPublicationPackage({
    id: "ppkg_live0001",
    version: "1.0.0",
    publication_ready_artifact_id: "prad_live0001",
    packaged_artifacts: [
      createPublicationArtifact({
        artifact_type: ArtifactType.MARKET_PAYLOAD,
        artifact_ref: "payload/market.json",
        integrity_hash: HASH_A,
        required: true,
      }),
      createPublicationArtifact({
        artifact_type: ArtifactType.RULEBOOK,
        artifact_ref: "payload/rulebook.json",
        integrity_hash: HASH_B,
        required: true,
      }),
    ],
    package_metadata: makePublicationMetadata(),
    package_status: PackageStatus.VALIDATED,
    created_at: "2026-03-01T12:05:00.000Z",
  });

const makeReadinessReport = () =>
  createDeliveryReadinessReport({
    id: "drrp_live0001",
    publication_package_id: "ppkg_live0001",
    readiness_status: ReadinessStatus.READY,
    blocking_issues: [],
    warnings: [],
    validated_at: "2026-03-01T12:10:00.000Z",
  });

const makeSchedulingCandidate = () =>
  createSchedulingCandidate({
    id: "scnd_live0001",
    publication_package_id: "ppkg_live0001",
    scheduling_window: createSchedulingWindow({
      start_at: "2026-03-02T10:00:00.000Z",
      end_at: "2026-03-02T11:00:00.000Z",
    }),
    priority_level: EventPriority.HIGH,
    scheduling_notes: ["window validated"],
    scheduling_status: SchedulingStatus.READY,
    readiness_status: ReadinessStatus.READY,
    delivery_readiness_report_id: "drrp_live0001",
    blocking_issues_snapshot: [],
  });

const makeHandoff = () =>
  createPublicationHandoff({
    id: "phnd_live0001",
    version: "1.0.0",
    publication_package_id: "ppkg_live0001",
    handoff_status: HandoffStatus.PENDING,
    initiated_by: "editorial-bot",
    initiated_at: "2026-03-01T12:15:00.000Z",
    delivery_notes: ["handoff prepared"],
    audit_ref: "aref_live0001",
  });

const makeLiveContract = () =>
  createLivePublicationContract({
    id: "lpct_live0001",
    version: "1.0.0",
    publication_package_id: "ppkg_live0001",
    canonical_contract_ref: "contract/ref/live-0001",
    publication_metadata: makePublicationMetadata(),
    activation_policy: ActivationPolicy.SCHEDULED,
    safety_checks: ["hashes verified", "audit linkage present"],
    contract_status: ContractStatus.READY,
  });

describe("live-integration module", () => {
  it("validates a valid PublicationPackage", () => {
    const report = validatePublicationPackage(makePublicationPackage());
    expect(report.isValid).toBe(true);
  });

  it("rejects invalid PublicationPackage without artifacts", () => {
    const invalid = {
      ...makePublicationPackage(),
      packaged_artifacts: [],
    };
    const report = validatePublicationPackage(invalid);
    expect(report.isValid).toBe(false);
  });

  it("validates a valid PublicationHandoff", () => {
    const report = validatePublicationHandoff(makeHandoff());
    expect(report.isValid).toBe(true);
  });

  it("rejects PublicationHandoff without audit linkage", () => {
    const invalid = { ...makeHandoff(), audit_ref: "" as unknown as AuditReference };
    const report = validatePublicationHandoff(invalid);
    expect(report.isValid).toBe(false);
  });

  it("validates a valid SchedulingCandidate", () => {
    const report = validateSchedulingCandidate(makeSchedulingCandidate());
    expect(report.isValid).toBe(true);
  });

  it("rejects SchedulingCandidate when readiness fails", () => {
    const invalid = {
      ...makeSchedulingCandidate(),
      readiness_status: ReadinessStatus.FAILED,
      scheduling_status: SchedulingStatus.READY,
    };
    const report = validateSchedulingCandidate(invalid);
    expect(report.isValid).toBe(false);
  });

  it("validates a valid LivePublicationContract", () => {
    const report = validateLivePublicationContract(makeLiveContract());
    expect(report.isValid).toBe(true);
  });

  it("rejects LivePublicationContract without safety checks", () => {
    const invalid = { ...makeLiveContract(), safety_checks: [] };
    const report = validateLivePublicationContract(invalid);
    expect(report.isValid).toBe(false);
  });

  it("is compatible with PublicationReadyArtifact upstream", () => {
    const packager = new DeterministicPublicationPackager();
    const publicationReady = makePublicationReadyArtifact();
    const pkg = packager.createPackage({
      publication_ready_artifact: publicationReady,
      packaged_artifacts: makePublicationPackage().packaged_artifacts,
      package_metadata: makePublicationMetadata(),
      created_at: "2026-03-01T12:20:00.000Z",
      version: "1.0.0",
    });
    expect(pkg.publication_ready_artifact_id).toBe(publicationReady.id);
  });

  it("enforces integrity hash format", () => {
    expect(() =>
      createPublicationArtifact({
        artifact_type: ArtifactType.MARKET_PAYLOAD,
        artifact_ref: "payload/market.json",
        integrity_hash: "not-a-hash",
        required: true,
      }),
    ).toThrow();
  });

  it("accepts READY DeliveryReadinessReport without blocking issues", () => {
    const report = validateDeliveryReadinessReport(makeReadinessReport());
    expect(report.isValid).toBe(true);
  });

  it("requires blocking issues for FAILED/BLOCKED DeliveryReadinessReport", () => {
    const invalid = {
      ...makeReadinessReport(),
      readiness_status: ReadinessStatus.BLOCKED,
      blocking_issues: [],
    };
    const report = validateDeliveryReadinessReport(invalid);
    expect(report.isValid).toBe(false);
  });

  it("propagates status conservatively from readiness to scheduling and contract", () => {
    const evaluator = new DeterministicDeliveryReadinessEvaluator();
    const preparer = new DeterministicSchedulingPreparer();
    const contractBuilder = new DeterministicLiveContractBuilder();
    const failedPackage = createPublicationPackage({
      ...makePublicationPackage(),
      id: "ppkg_live0002",
      package_status: PackageStatus.INVALID,
    });
    const readyArtifact = makePublicationReadyArtifact();
    const readiness = evaluator.evaluate({
      publication_package: failedPackage,
      publication_ready_artifact: readyArtifact,
      validated_at: "2026-03-01T12:40:00.000Z",
    });
    const scheduling = preparer.prepareSchedulingCandidate({
      publication_package: failedPackage,
      scheduling_window: createSchedulingWindow({
        start_at: "2026-03-03T10:00:00.000Z",
        end_at: "2026-03-03T11:00:00.000Z",
      }),
      priority_level: EventPriority.MEDIUM,
      readiness_report: readiness,
      scheduling_notes: ["automatic conservative gate"],
    });
    const contract = contractBuilder.buildLiveContract({
      publication_package: failedPackage,
      publication_metadata: makePublicationMetadata(),
      canonical_contract_ref: "contract/ref/live-0002",
      activation_policy: ActivationPolicy.MANUAL,
      safety_checks: ["manual review required"],
      version: "1.0.0",
      contract_status: ContractStatus.READY,
    });
    expect(scheduling.scheduling_status).toBe(SchedulingStatus.BLOCKED);
    expect(contract.contract_status).toBe(ContractStatus.BLOCKED);
  });

  it("maintains audit trail compatibility with editorial artifacts", () => {
    const manager = new DeterministicPublicationHandoffManager();
    const handoff = manager.createHandoff({
      publication_package_id: makePublicationPackage().id,
      initiated_by: "editorial-ops",
      initiated_at: "2026-03-01T12:45:00.000Z",
      delivery_notes: ["linked to editorial audit"],
      audit_ref: "aref_live0002",
      version: "1.0.1",
    });
    expect(handoff.audit_ref.startsWith("aref_")).toBe(true);
  });

  it("keeps schema exports registered and stable", () => {
    const schemaIds = [
      PUBLICATION_ARTIFACT_SCHEMA_ID,
      PUBLICATION_PACKAGE_SCHEMA_ID,
      PUBLICATION_HANDOFF_SCHEMA_ID,
      SCHEDULING_WINDOW_SCHEMA_ID,
      SCHEDULING_CANDIDATE_SCHEMA_ID,
      PUBLICATION_METADATA_SCHEMA_ID,
      LIVE_PUBLICATION_CONTRACT_SCHEMA_ID,
      DELIVERY_READINESS_REPORT_SCHEMA_ID,
    ];
    for (const schemaId of schemaIds) {
      expect(() => requireSchemaValidator(schemaId)).not.toThrow();
    }
  });

  it("keeps validator output deterministic for same pipeline input", () => {
    const pipeline: LiveIntegrationPipelineInput = {
      publication_package: makePublicationPackage(),
      publication_handoff: makeHandoff(),
      scheduling_candidate: makeSchedulingCandidate(),
      live_publication_contract: makeLiveContract(),
      delivery_readiness_report: makeReadinessReport(),
    };
    const reportA = validateLiveIntegrationPipeline(pipeline);
    const reportB = validateLiveIntegrationPipeline(pipeline);
    expect(reportA).toEqual(reportB);
  });
});
