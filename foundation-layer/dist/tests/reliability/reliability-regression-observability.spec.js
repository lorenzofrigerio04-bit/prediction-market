import { describe, expect, it } from "vitest";
import { createEntityVersion } from "@/value-objects/entity-version.vo.js";
import { createTimestamp } from "@/value-objects/timestamp.vo.js";
import { AdversarialType, DatasetScope, DeterministicPipelineHealthEvaluator, DeterministicReleaseGateEvaluator, FinalGateStatus, InMemoryObservabilityEmitter, MetricUnit, ObservabilityEventType, PriorityLevel, RegressionStatus, ReleaseReadinessStatus, ReportScope, RiskLevel, SeverityLevel, TargetModule, ThresholdStatus, createAdversarialCase, createAdversarialCaseId, createArtifactReference, createBlockingReason, createCorrelationId, createExpectedInvariant, createGoldenDatasetEntry, createGoldenDatasetEntryId, createModuleHealthMetric, createModuleHealthMetricId, createObservabilityEvent, createObservabilityEventId, createPipelineHealthSnapshot, createPipelineHealthSnapshotId, createQualityReport, createQualityReportId, createRegressionCase, createRegressionCaseId, createReleaseGateEvaluation, createReleaseGateEvaluationId, validateAdversarialCase, validateGoldenDatasetEntry, validateModuleHealthMetric, validateObservabilityEvent, validatePipelineHealthSnapshot, validateQualityReport, validateRegressionCase, validateReleaseGateEvaluation, } from "@/reliability/index.js";
const makeArtifactRef = (artifactId) => createArtifactReference({
    module_name: TargetModule.FOUNDATION_LAYER,
    artifact_type: "candidate_market",
    artifact_id: artifactId,
    artifact_version_nullable: 1,
    uri_nullable: null,
});
describe("Reliability, Regression & Observability v1", () => {
    it("valid GoldenDatasetEntry", () => {
        const entry = createGoldenDatasetEntry({
            id: createGoldenDatasetEntryId("gde_datasetref1"),
            version: createEntityVersion(1),
            dataset_scope: DatasetScope.FULL_PIPELINE,
            input_artifact_refs: [makeArtifactRef("evt_one001")],
            expected_output_refs: [makeArtifactRef("evt_two001")],
            expected_invariants: [
                createExpectedInvariant({
                    code: "PIPELINE_STABLE",
                    description: "Pipeline must remain stable for golden dataset",
                    path: "/pipeline",
                }),
            ],
            category_tags: ["full", "pipeline"],
            priority_level: PriorityLevel.HIGH,
            active: true,
        });
        expect(validateGoldenDatasetEntry(entry).isValid).toBe(true);
    });
    it("invalid GoldenDatasetEntry with missing invariants", () => {
        const bad = {
            id: createGoldenDatasetEntryId("gde_datasetref2"),
            version: createEntityVersion(1),
            dataset_scope: DatasetScope.FULL_PIPELINE,
            input_artifact_refs: [makeArtifactRef("evt_one002")],
            expected_output_refs: [makeArtifactRef("evt_two002")],
            expected_invariants: [],
            category_tags: ["full", "pipeline"],
            priority_level: PriorityLevel.HIGH,
            active: true,
        };
        const report = validateGoldenDatasetEntry(bad);
        expect(report.isValid).toBe(false);
    });
    it("valid RegressionCase", () => {
        const regressionCase = createRegressionCase({
            id: createRegressionCaseId("rgc_regression1"),
            version: createEntityVersion(1),
            case_name: "critical-validation-regression",
            target_module: TargetModule.PUBLISHING_ENGINE,
            input_refs: [makeArtifactRef("evt_reg001")],
            expected_behavior: "Must preserve deterministic validator output",
            failure_signature_nullable: null,
            severity: SeverityLevel.CRITICAL,
            linked_dataset_entry_id_nullable: createGoldenDatasetEntryId("gde_datasetref3"),
        });
        expect(validateRegressionCase(regressionCase).isValid).toBe(true);
    });
    it("invalid RegressionCase critical without expected behavior", () => {
        const bad = {
            id: createRegressionCaseId("rgc_regression2"),
            version: createEntityVersion(1),
            case_name: "critical-empty-behavior",
            target_module: TargetModule.PUBLISHING_ENGINE,
            input_refs: [makeArtifactRef("evt_reg002")],
            expected_behavior: "",
            failure_signature_nullable: null,
            severity: SeverityLevel.CRITICAL,
            linked_dataset_entry_id_nullable: null,
        };
        const report = validateRegressionCase(bad);
        expect(report.isValid).toBe(false);
    });
    it("valid AdversarialCase", () => {
        const adversarial = createAdversarialCase({
            id: createAdversarialCaseId("adv_adverscase1"),
            version: createEntityVersion(1),
            target_module: TargetModule.EVENT_INTELLIGENCE_LAYER,
            adversarial_type: AdversarialType.SCHEMA_MISMATCH,
            crafted_input_refs: [makeArtifactRef("evt_adv001")],
            expected_rejection_or_behavior: "Must reject malformed payload",
            risk_level: RiskLevel.HIGH,
            active: true,
        });
        expect(validateAdversarialCase(adversarial).isValid).toBe(true);
    });
    it("invalid AdversarialCase active without expected behavior", () => {
        const bad = {
            id: createAdversarialCaseId("adv_adverscase2"),
            version: createEntityVersion(1),
            target_module: TargetModule.EVENT_INTELLIGENCE_LAYER,
            adversarial_type: AdversarialType.SCHEMA_MISMATCH,
            crafted_input_refs: [makeArtifactRef("evt_adv002")],
            expected_rejection_or_behavior: "",
            risk_level: RiskLevel.HIGH,
            active: true,
        };
        const report = validateAdversarialCase(bad);
        expect(report.isValid).toBe(false);
    });
    it("valid ModuleHealthMetric", () => {
        const metric = createModuleHealthMetric({
            id: createModuleHealthMetricId("mhm_metricgood1"),
            module_name: TargetModule.EVENT_INTELLIGENCE_LAYER,
            metric_name: "deterministic_pass_rate",
            metric_value: 0.92,
            metric_unit: MetricUnit.RATIO,
            measured_at: createTimestamp("2026-03-08T10:00:00.000Z"),
            threshold_status: ThresholdStatus.HEALTHY,
            notes_nullable: null,
            threshold_metadata_nullable: {
                threshold_min_nullable: 0.75,
                threshold_max_nullable: 1,
                threshold_target_nullable: 0.9,
            },
        });
        expect(validateModuleHealthMetric(metric).isValid).toBe(true);
    });
    it("invalid ModuleHealthMetric with threshold mismatch", () => {
        const bad = createModuleHealthMetric({
            id: createModuleHealthMetricId("mhm_metricbad01"),
            module_name: TargetModule.EVENT_INTELLIGENCE_LAYER,
            metric_name: "deterministic_pass_rate",
            metric_value: 0.7,
            metric_unit: MetricUnit.RATIO,
            measured_at: createTimestamp("2026-03-08T10:00:00.000Z"),
            threshold_status: ThresholdStatus.HEALTHY,
            notes_nullable: null,
            threshold_metadata_nullable: {
                threshold_min_nullable: 0.75,
                threshold_max_nullable: 1,
                threshold_target_nullable: 0.9,
            },
        });
        const report = validateModuleHealthMetric(bad);
        expect(report.isValid).toBe(false);
    });
    it("valid PipelineHealthSnapshot", () => {
        const metric = createModuleHealthMetric({
            id: createModuleHealthMetricId("mhm_metricok002"),
            module_name: TargetModule.FULL_PIPELINE,
            metric_name: "pipeline_pass_rate",
            metric_value: 0.98,
            metric_unit: MetricUnit.RATIO,
            measured_at: createTimestamp("2026-03-08T10:10:00.000Z"),
            threshold_status: ThresholdStatus.HEALTHY,
            notes_nullable: null,
            threshold_metadata_nullable: {
                threshold_min_nullable: 0.8,
                threshold_max_nullable: 1,
                threshold_target_nullable: 0.95,
            },
        });
        const snapshot = createPipelineHealthSnapshot({
            id: createPipelineHealthSnapshotId("phs_snapshotok01"),
            version: createEntityVersion(1),
            snapshot_at: createTimestamp("2026-03-08T10:15:00.000Z"),
            covered_modules: [TargetModule.FULL_PIPELINE],
            module_metrics: [metric],
            pass_rate: 0.98,
            regression_status: RegressionStatus.STABLE,
            release_readiness_status: ReleaseReadinessStatus.READY,
            blocking_issues: [],
            warnings: [],
        });
        expect(validatePipelineHealthSnapshot(snapshot).isValid).toBe(true);
    });
    it("invalid PipelineHealthSnapshot marked ready with blocking issues", () => {
        const metric = createModuleHealthMetric({
            id: createModuleHealthMetricId("mhm_metricok003"),
            module_name: TargetModule.FULL_PIPELINE,
            metric_name: "pipeline_pass_rate",
            metric_value: 0.96,
            metric_unit: MetricUnit.RATIO,
            measured_at: createTimestamp("2026-03-08T10:20:00.000Z"),
            threshold_status: ThresholdStatus.HEALTHY,
            notes_nullable: null,
            threshold_metadata_nullable: {
                threshold_min_nullable: 0.8,
                threshold_max_nullable: 1,
                threshold_target_nullable: 0.95,
            },
        });
        const bad = {
            id: createPipelineHealthSnapshotId("phs_snapshotbd01"),
            version: createEntityVersion(1),
            snapshot_at: createTimestamp("2026-03-08T10:25:00.000Z"),
            covered_modules: [TargetModule.FULL_PIPELINE],
            module_metrics: [metric],
            pass_rate: 0.96,
            regression_status: RegressionStatus.STABLE,
            release_readiness_status: ReleaseReadinessStatus.READY,
            blocking_issues: [
                createBlockingReason({
                    code: "B1",
                    message: "Blocking issue present",
                    module_name: TargetModule.FULL_PIPELINE,
                    path: "/blocking_issues/0",
                }),
            ],
            warnings: [],
        };
        const report = validatePipelineHealthSnapshot(bad);
        expect(report.isValid).toBe(false);
    });
    it("valid ReleaseGateEvaluation", () => {
        const evaluation = createReleaseGateEvaluation({
            id: createReleaseGateEvaluationId("rge_releaseok001"),
            version: createEntityVersion(1),
            evaluated_at: createTimestamp("2026-03-08T10:30:00.000Z"),
            target_scope: DatasetScope.FULL_PIPELINE,
            schema_gate_pass: true,
            validator_gate_pass: true,
            test_gate_pass: true,
            regression_gate_pass: true,
            compatibility_gate_pass: true,
            readiness_gate_pass: true,
            final_gate_status: FinalGateStatus.PASSED,
            blocking_reasons: [],
        });
        expect(validateReleaseGateEvaluation(evaluation).isValid).toBe(true);
    });
    it("invalid ReleaseGateEvaluation passed with one mandatory gate false", () => {
        const bad = {
            id: createReleaseGateEvaluationId("rge_releasebd001"),
            version: createEntityVersion(1),
            evaluated_at: createTimestamp("2026-03-08T10:35:00.000Z"),
            target_scope: DatasetScope.FULL_PIPELINE,
            schema_gate_pass: true,
            validator_gate_pass: true,
            test_gate_pass: false,
            regression_gate_pass: true,
            compatibility_gate_pass: true,
            readiness_gate_pass: true,
            final_gate_status: FinalGateStatus.PASSED,
            blocking_reasons: [],
        };
        const report = validateReleaseGateEvaluation(bad);
        expect(report.isValid).toBe(false);
    });
    it("valid QualityReport", () => {
        const metric = createModuleHealthMetric({
            id: createModuleHealthMetricId("mhm_metricok004"),
            module_name: TargetModule.FULL_PIPELINE,
            metric_name: "pipeline_pass_rate",
            metric_value: 0.97,
            metric_unit: MetricUnit.RATIO,
            measured_at: createTimestamp("2026-03-08T10:40:00.000Z"),
            threshold_status: ThresholdStatus.HEALTHY,
            notes_nullable: null,
            threshold_metadata_nullable: {
                threshold_min_nullable: 0.8,
                threshold_max_nullable: 1,
                threshold_target_nullable: 0.95,
            },
        });
        const reportEntity = createQualityReport({
            id: createQualityReportId("qrp_qualityok001"),
            version: createEntityVersion(1),
            report_scope: ReportScope.FULL_PIPELINE,
            generated_at: createTimestamp("2026-03-08T10:45:00.000Z"),
            summary: "Pipeline quality healthy and deterministic",
            key_findings: ["All mandatory quality gates passed"],
            metrics_summary: [metric],
            unresolved_issues: [],
            recommendations: ["Keep regression suite active"],
        });
        expect(validateQualityReport(reportEntity).isValid).toBe(true);
    });
    it("valid ObservabilityEvent", () => {
        const event = createObservabilityEvent({
            id: createObservabilityEventId("obe_observeok001"),
            version: createEntityVersion(1),
            event_type: ObservabilityEventType.RELEASE_GATE_EVALUATED,
            module_name: TargetModule.RELIABILITY_REGRESSION_OBSERVABILITY,
            correlation_id: createCorrelationId("corr_observeok01"),
            emitted_at: createTimestamp("2026-03-08T10:50:00.000Z"),
            severity: SeverityLevel.MEDIUM,
            payload_summary: {
                summary_type: "release_gate_outcome",
                values: { final_status: "passed", blocking_count: 0 },
            },
            trace_refs: [{ trace_id: "trace-a", span_id_nullable: "span-a", parent_trace_id_nullable: null }],
            diagnostic_tags: ["release", "gate"],
        });
        expect(validateObservabilityEvent(event).isValid).toBe(true);
    });
    it("invalid ObservabilityEvent without correlationId", () => {
        const bad = {
            id: createObservabilityEventId("obe_observebd001"),
            version: createEntityVersion(1),
            event_type: ObservabilityEventType.RELEASE_GATE_EVALUATED,
            module_name: TargetModule.RELIABILITY_REGRESSION_OBSERVABILITY,
            correlation_id: "",
            emitted_at: createTimestamp("2026-03-08T10:55:00.000Z"),
            severity: SeverityLevel.MEDIUM,
            payload_summary: {
                summary_type: "release_gate_outcome",
                values: { final_status: "failed", blocking_count: 1 },
            },
            trace_refs: [{ trace_id: "trace-b", span_id_nullable: null, parent_trace_id_nullable: null }],
            diagnostic_tags: ["release", "gate"],
        };
        const report = validateObservabilityEvent(bad);
        expect(report.isValid).toBe(false);
    });
    it("derives deterministic final gate status and release readiness", () => {
        const releaseGate = new DeterministicReleaseGateEvaluator().evaluate({
            target_scope: DatasetScope.FULL_PIPELINE,
            schema_gate_pass: true,
            validator_gate_pass: true,
            test_gate_pass: false,
            regression_gate_pass: true,
            compatibility_gate_pass: false,
            readiness_gate_pass: false,
        });
        expect(releaseGate.final_gate_status).toBe(FinalGateStatus.BLOCKED);
        const snapshot = new DeterministicPipelineHealthEvaluator().evaluate({
            covered_modules: [TargetModule.FULL_PIPELINE],
            module_metrics: [
                createModuleHealthMetric({
                    id: createModuleHealthMetricId("mhm_metricdriv01"),
                    module_name: TargetModule.FULL_PIPELINE,
                    metric_name: "pipeline_pass_rate",
                    metric_value: 0.7,
                    metric_unit: MetricUnit.RATIO,
                    measured_at: createTimestamp("2026-03-08T11:00:00.000Z"),
                    threshold_status: ThresholdStatus.BREACHED,
                    notes_nullable: null,
                    threshold_metadata_nullable: {
                        threshold_min_nullable: 0.8,
                        threshold_max_nullable: 1,
                        threshold_target_nullable: 0.95,
                    },
                }),
            ],
            pass_rate: 0.7,
            regression_status: RegressionStatus.BROKEN,
        });
        expect(snapshot.release_readiness_status).toBe(ReleaseReadinessStatus.NOT_READY);
    });
    it("stores observability events in memory deterministically", () => {
        const emitter = new InMemoryObservabilityEmitter();
        emitter.emit(createObservabilityEvent({
            id: createObservabilityEventId("obe_memoryev001"),
            version: createEntityVersion(1),
            event_type: ObservabilityEventType.VALIDATION_EXECUTED,
            module_name: TargetModule.RELIABILITY_REGRESSION_OBSERVABILITY,
            correlation_id: createCorrelationId("corr_memoryev01"),
            emitted_at: createTimestamp("2026-03-08T11:05:00.000Z"),
            severity: SeverityLevel.LOW,
            payload_summary: {
                summary_type: "validator_run",
                values: { target: "golden_dataset_entry", valid: true },
            },
            trace_refs: [{ trace_id: "trace-c", span_id_nullable: null, parent_trace_id_nullable: null }],
            diagnostic_tags: ["validator", "deterministic"],
        }));
        expect(emitter.listEvents()).toHaveLength(1);
    });
});
//# sourceMappingURL=reliability-regression-observability.spec.js.map