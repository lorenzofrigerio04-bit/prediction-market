"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { OperationsDetailViewModel } from "@/lib/admin-operations";
import { ActionSurfaceBar, SectionCard, ToneBadge, formatDateTime } from "./OperationsShared";

export default function OperationsDetail({ id }: { id: string }) {
  const [data, setData] = useState<OperationsDetailViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pipelineBusy, setPipelineBusy] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<Record<string, unknown> | null>(null);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/operations/${id}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Errore caricamento dettaglio operativo");
      }
      const payload: OperationsDetailViewModel = await response.json();
      setData(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Errore caricamento dettaglio operativo");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleRunPipeline = async () => {
    setPipelineBusy(true);
    setPipelineResult(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/run-generate-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxTotal: 5 }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || payload.details || "Errore esecuzione pipeline");
      }
      setPipelineResult(payload);
      await fetchDetail();
    } catch (pipelineError) {
      setError(pipelineError instanceof Error ? pipelineError.message : "Errore esecuzione pipeline");
    } finally {
      setPipelineBusy(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    setApproveError(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/operations/submissions/${id}/approve`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || payload.details || "Errore approvazione");
      }
      await fetchDetail();
    } catch (approveErr) {
      const msg = approveErr instanceof Error ? approveErr.message : "Errore approvazione";
      setApproveError(msg);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg p-6 text-fg md:p-8">
      <div className="mb-6">
        <Link
          href="/admin/operations"
          className="inline-flex items-center text-sm font-medium text-fg-muted transition-colors hover:text-primary"
        >
          ← Back to operations cockpit
        </Link>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <p className="text-fg-muted">Caricamento dettaglio operativo...</p>
      ) : data ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-fg md:text-3xl">{data.submission.title}</h1>
                <ToneBadge
                  label={data.pipelineSummary.label}
                  tone={
                    data.pipelineSummary.state === "published"
                      ? "success"
                      : data.pipelineSummary.state === "pending_review"
                        ? "warning"
                        : "danger"
                  }
                />
              </div>
              <p className="mt-2 max-w-3xl text-fg-muted">
                Submission `{data.submission.id}` · category {data.submission.category} · created{" "}
                {formatDateTime(data.submission.createdAtIso)}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <ToneBadge
                  label={data.gates.mdeEnforceValidation ? "MDE enforce" : "MDE shadow"}
                  tone={data.gates.mdeEnforceValidation ? "warning" : "neutral"}
                  title="Config: MDE validation mode (shadow vs enforce) for submissions"
                />
                <ToneBadge
                  label="Event Gen v2"
                  tone="success"
                  title="Pipeline: Event Gen v2"
                />
                {data.pipelineSummary.publicationPath != null ? (
                  <ToneBadge
                    label={
                      data.pipelineSummary.publicationPath === "mde_authoritative"
                        ? "Publication path: MDE"
                        : "Publication path: Legacy"
                    }
                    tone={data.pipelineSummary.publicationPath === "mde_authoritative" ? "success" : "neutral"}
                  />
                ) : null}
              </div>
              <ActionSurfaceBar
                surface={data.permissions.actionSurface}
                detailHref={`/admin/operations/${data.submission.id}`}
                eventHref={data.submission.eventId ? `/events/${data.submission.eventId}` : undefined}
                auditHref="#audit-summary"
                creditsHref="#credits-summary"
                onRunPipeline={handleRunPipeline}
                busyAction={pipelineBusy ? "run_pipeline" : null}
              />
            </div>
          </div>

          <SectionCard
            title="Submission result"
            subtitle="Esito normalizzato del bridge di submission e identificatori utili per l'operatore."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-border dark:border-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-fg-subtle">Submission ID</p>
                <p className="mt-2 text-sm font-mono text-fg">{data.submission.id}</p>
              </div>
              <div className="rounded-xl border border-border dark:border-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-fg-subtle">Event ID</p>
                <p className="mt-2 text-sm font-mono text-fg">{data.submission.eventId ?? "—"}</p>
              </div>
              <div className="rounded-xl border border-border dark:border-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-fg-subtle">Status</p>
                <p className="mt-2 text-sm text-fg">{data.submission.status}</p>
              </div>
              <div className="rounded-xl border border-border dark:border-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-fg-subtle">Closes at</p>
                <p className="mt-2 text-sm text-fg">{formatDateTime(data.submission.closesAtIso)}</p>
              </div>
            </div>
            {data.submission.reviewNotes.length > 0 ? (
              <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                {data.submission.reviewNotes.join(" | ")}
              </div>
            ) : null}
            {data.submission.status === "PENDING" && !data.submission.eventId ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approving}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                >
                  {approving ? "Approvazione..." : "Approva e pubblica"}
                </button>
                {approveError ? (
                  <span className="text-sm text-danger">{approveError}</span>
                ) : null}
              </div>
            ) : null}
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <SectionCard
              title="Pipeline summary"
              subtitle="Stato bridged della submission e ultima run pipeline disponibile."
            >
              <div className="flex flex-wrap items-center gap-2">
                <ToneBadge
                  label={data.pipelineSummary.label}
                  tone={
                    data.pipelineSummary.state === "published"
                      ? "success"
                      : data.pipelineSummary.state === "pending_review"
                        ? "warning"
                        : "danger"
                  }
                />
                <span className="text-sm text-fg-muted">
                  Validation mode {data.pipelineSummary.validationMode} · runtime{" "}
                  {data.pipelineSummary.legacyPipelineMode}
                </span>
              </div>
              <p className="mt-3 text-sm text-fg">{data.pipelineSummary.detail}</p>
              {data.pipelineSummary.latestRun ? (
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-xl border border-border dark:border-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-fg-subtle">Last run</p>
                    <p className="mt-2 text-sm text-fg">
                      {formatDateTime(data.pipelineSummary.latestRun.startedAtIso)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border dark:border-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-fg-subtle">Candidates</p>
                    <p className="mt-2 text-xl font-semibold text-fg">
                      {data.pipelineSummary.latestRun.candidatesCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border dark:border-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-fg-subtle">Validated</p>
                    <p className="mt-2 text-xl font-semibold text-fg">
                      {data.pipelineSummary.latestRun.rulebookValidCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border dark:border-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-fg-subtle">Created</p>
                    <p className="mt-2 text-xl font-semibold text-fg">
                      {data.pipelineSummary.latestRun.createdCount}
                    </p>
                  </div>
                </div>
              ) : null}
              {pipelineResult ? (
                <pre className="mt-4 max-h-64 overflow-auto rounded-xl border border-border dark:border-white/10 bg-white/5 p-4 text-xs text-fg-muted">
                  {JSON.stringify(pipelineResult, null, 2)}
                </pre>
              ) : null}
            </SectionCard>

            <SectionCard
              title="Review summary"
              subtitle="Snapshot minimale della review queue adattata per il cockpit."
            >
              <div className="space-y-2 text-sm text-fg">
                <p>
                  <span className="text-fg-muted">Queue status:</span> {data.reviewQueueEntry.status}
                </p>
                <p>
                  <span className="text-fg-muted">Closes at:</span>{" "}
                  {formatDateTime(data.reviewQueueEntry.closesAtIso)}
                </p>
                <p>
                  <span className="text-fg-muted">Created at:</span>{" "}
                  {formatDateTime(data.reviewQueueEntry.createdAtIso)}
                </p>
                <p>
                  <span className="text-fg-muted">Subtitle:</span>{" "}
                  {data.reviewQueueEntry.subtitle ?? "—"}
                </p>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="Candidate inspection"
            subtitle="Artifact candidate, provenance minima e market artifact dove disponibile."
          >
            <div className="grid gap-4 xl:grid-cols-3">
              {data.candidateInspection.artifactSections.map((section) => (
                <div
                  key={section.key}
                  className="rounded-2xl border border-border dark:border-white/10 p-4"
                >
                  <h3 className="text-sm font-semibold text-fg">{section.title}</h3>
                  <dl className="mt-3 space-y-2">
                    {section.items.map((item) => (
                      <div key={item.label}>
                        <dt className="text-xs uppercase tracking-wide text-fg-subtle">{item.label}</dt>
                        <dd className="text-sm text-fg">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            {data.candidateInspection.flags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {data.candidateInspection.flags.map((flag) => (
                  <ToneBadge key={flag} label={flag} tone="neutral" />
                ))}
              </div>
            ) : null}
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Readiness summary"
              subtitle="Readiness minima e blockers derivati in modo conservativo dallo stato reale."
            >
              <div className="mb-4">
                <ToneBadge
                  label={data.readinessSummary.readinessStatus}
                  tone={
                    data.readinessSummary.readinessStatus === "ready"
                      ? "success"
                      : data.readinessSummary.readinessStatus === "needs_review"
                        ? "warning"
                        : "danger"
                  }
                />
              </div>
              <div className="space-y-3">
                {data.readinessSummary.gatingItems.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-xl border border-border dark:border-white/10 p-3"
                  >
                    <p className="text-sm font-medium text-fg">{item.key}</p>
                    <p className="mt-1 text-sm text-fg-muted">
                      {item.satisfied ? "Satisfied" : item.reason ?? "Not satisfied"}
                    </p>
                  </div>
                ))}
              </div>
              {data.readinessSummary.blockingIssues.length > 0 ? (
                <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                  {data.readinessSummary.blockingIssues.join(" | ")}
                </div>
              ) : null}
              {data.readinessSummary.warnings.length > 0 ? (
                <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                  {data.readinessSummary.warnings.join(" | ")}
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              title="Publication summary"
              subtitle="Stato di publication/readiness verso la piattaforma legacy."
            >
              <div className="mb-4">
                <ToneBadge
                  label={data.publicationSummary.state}
                  tone={
                    data.publicationSummary.state === "published"
                      ? "success"
                      : data.publicationSummary.state === "pending_review"
                        ? "warning"
                        : "danger"
                  }
                />
              </div>
              {data.publicationSummary.event ? (
                <div className="space-y-2 text-sm text-fg">
                  <p>
                    <span className="text-fg-muted">Legacy event:</span> {data.publicationSummary.event.id}
                  </p>
                  <p>
                    <span className="text-fg-muted">Status:</span> {data.publicationSummary.event.status}
                  </p>
                  <p>
                    <span className="text-fg-muted">Resolution:</span>{" "}
                    {data.publicationSummary.event.resolutionStatus}
                  </p>
                  <p>
                    <span className="text-fg-muted">Trading mode:</span>{" "}
                    {data.publicationSummary.event.tradingMode ?? "—"}
                  </p>
                  <p>
                    <span className="text-fg-muted">Market ID:</span>{" "}
                    {data.publicationSummary.event.marketId ?? "—"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-fg-muted">Nessun evento pubblicato collegato a questa submission.</p>
              )}
              {data.publicationSummary.blockers.length > 0 ? (
                <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                  {data.publicationSummary.blockers.join(" | ")}
                </div>
              ) : null}
              {data.publicationSummary.warnings.length > 0 ? (
                <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                  {data.publicationSummary.warnings.join(" | ")}
                </div>
              ) : null}
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {data.auditSummary.visibilityStatus !== "hidden" ? (
              <SectionCard
                title="Audit summary"
                subtitle="Trace minima leggibile con chi, cosa e quando."
              >
                <div id="audit-summary">
                  {data.auditSummary.items.length === 0 ? (
                    <p className="text-sm text-fg-muted">
                      Nessuna voce audit disponibile per questa submission.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {data.auditSummary.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-border dark:border-white/10 p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <ToneBadge label={item.action} tone="neutral" />
                            <span className="text-sm text-fg-muted">
                              {formatDateTime(item.createdAtIso)} · {item.actorLabel}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-fg">{item.summary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>
            ) : null}

            {data.creditsSummary?.visibilityStatus !== "hidden" ? (
              <SectionCard
                title="Credits visibility"
                subtitle="Balance minima del submitter dove rilevante e consentita."
              >
                <div id="credits-summary">
                  {data.creditsSummary ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-border dark:border-white/10 p-4">
                        <p className="text-xs uppercase tracking-wide text-fg-subtle">Owner</p>
                        <p className="mt-2 text-sm text-fg">{data.creditsSummary.ownerLabel}</p>
                      </div>
                      <div className="rounded-xl border border-border dark:border-white/10 p-4">
                        <p className="text-xs uppercase tracking-wide text-fg-subtle">Display credits</p>
                        <p className="mt-2 text-2xl font-semibold text-fg">{data.creditsSummary.displayCredits}</p>
                        <p className="mt-1 text-xs text-fg-subtle">
                          Micros balance {data.creditsSummary.microsBalance ?? "—"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-fg-muted">Dati credits non disponibili.</p>
                  )}
                </div>
              </SectionCard>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
