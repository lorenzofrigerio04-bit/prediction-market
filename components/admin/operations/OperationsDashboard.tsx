"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { OperationsDashboardViewModel } from "@/lib/admin-operations";
import { ActionSurfaceBar, SectionCard, ToneBadge, formatDateTime } from "./OperationsShared";

interface SubmitResult {
  success?: boolean;
  approved?: boolean;
  pendingReview?: boolean;
  submissionId?: string;
  eventId?: string;
  message?: string;
  error?: string;
}

const inputClass =
  "w-full rounded-xl border border-border dark:border-white/10 bg-white/5 px-4 py-3 text-fg placeholder:text-fg-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors";

export default function OperationsDashboard() {
  const [data, setData] = useState<OperationsDashboardViewModel | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pipelineBusy, setPipelineBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [pipelineResult, setPipelineResult] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    closesAt: "",
    resolutionSource: "",
    notifyPhone: "",
  });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/operations");
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Errore caricamento cockpit");
      }
      const payload: OperationsDashboardViewModel = await response.json();
      setData(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Errore caricamento cockpit");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/events/categories");
      if (!response.ok) return;
      const payload = await response.json();
      const nextCategories = Array.isArray(payload.categories) ? payload.categories : [];
      setCategories(nextCategories);
      setFormData((current) => ({
        ...current,
        category: current.category || nextCategories[0] || "",
      }));
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchCategories();
  }, [fetchDashboard, fetchCategories]);

  const canSubmit = useMemo(
    () => data?.permissions.actionSurface.availableActionKeys.includes("submit") ?? false,
    [data]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      setError("Invio non consentito dai permessi correnti.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSubmitResult(null);
    try {
      const response = await fetch("/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          closesAt: new Date(formData.closesAt).toISOString(),
          resolutionSource: formData.resolutionSource.trim() || null,
          notifyPhone: formData.notifyPhone.trim() || null,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || payload.message || "Errore invio submission");
      }

      setSubmitResult(payload);
      await fetchDashboard();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Errore invio submission");
    } finally {
      setSubmitting(false);
    }
  };

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
      await fetchDashboard();
    } catch (pipelineError) {
      setError(pipelineError instanceof Error ? pipelineError.message : "Errore esecuzione pipeline");
    } finally {
      setPipelineBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg p-6 text-fg md:p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg md:text-3xl">Operations cockpit</h1>
          <p className="mt-2 max-w-3xl text-fg-muted">
            Cockpit operativo MDE per submission, inspection, readiness e audit. Solo mercati
            binari (YES/NO) sono supportati; multi-outcome, scalar e altri tipi non sono ancora disponibili.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ToneBadge
            label={data?.gates.mdeEnforceValidation ? "MDE enforce" : "MDE shadow"}
            tone={data?.gates.mdeEnforceValidation ? "warning" : "neutral"}
          />
          <ToneBadge
            label="Event Gen v2"
            tone="success"
          />
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {submitResult ? (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <ToneBadge
              label={submitResult.approved ? "Published" : submitResult.pendingReview ? "Pending review" : "Recorded"}
              tone={submitResult.approved ? "success" : "warning"}
            />
            {submitResult.submissionId ? (
              <Link href={`/admin/operations/${submitResult.submissionId}`} className="text-sm font-medium text-primary hover:underline">
                Open latest result
              </Link>
            ) : null}
            {submitResult.eventId ? (
              <Link href={`/events/${submitResult.eventId}`} className="text-sm font-medium text-primary hover:underline">
                Open event
              </Link>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-fg">
            {submitResult.message ?? "Submission registrata nel cockpit operativo."}
          </p>
        </div>
      ) : null}

      {loading && !data ? (
        <p className="text-fg-muted">Caricamento cockpit operativo...</p>
      ) : data ? (
        <div className="space-y-6">
          <SectionCard
            title="Submission"
            subtitle="Solo mercati binari (YES/NO). Titolo, categoria, chiusura e fonte di risoluzione obbligatori."
          >
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-fg-muted">Titolo</span>
                  <input
                    required
                    value={formData.title}
                    onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                    className={inputClass}
                    placeholder="Es. Il Milan vincerà il campionato?"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-fg-muted">Categoria</span>
                  <select
                    required
                    value={formData.category}
                    onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Seleziona categoria
                    </option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-fg-muted">Descrizione</span>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                  className={inputClass}
                  placeholder="Contesto minimo per l'operatore."
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-fg-muted">Chiusura</span>
                  <input
                    required
                    type="datetime-local"
                    value={formData.closesAt}
                    onChange={(event) => setFormData((current) => ({ ...current, closesAt: event.target.value }))}
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-fg-muted">Telefono notify</span>
                  <input
                    value={formData.notifyPhone}
                    onChange={(event) => setFormData((current) => ({ ...current, notifyPhone: event.target.value }))}
                    className={inputClass}
                    placeholder="+39..."
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-fg-muted">Fonte di risoluzione</span>
                <input
                  required
                  value={formData.resolutionSource}
                  onChange={(event) => setFormData((current) => ({ ...current, resolutionSource: event.target.value }))}
                  className={inputClass}
                  placeholder="https://..."
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit into bridge"}
                </button>
                <Link
                  href="/admin/events/create"
                  className="rounded-xl border border-border dark:border-white/10 px-5 py-2.5 text-sm font-medium text-fg hover:bg-surface/80 transition-colors"
                >
                  Open legacy create form
                </Link>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title="Pipeline snapshot"
            subtitle="Riusa la pipeline bridged esistente e mostra lo stato dell'ultima esecuzione disponibile."
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <ToneBadge
                  label={
                    data.pipelineSnapshot
                      ? data.pipelineSnapshot.status === "success"
                        ? "Healthy"
                        : data.pipelineSnapshot.status === "warning"
                          ? "Idle"
                          : "Attention"
                      : "No runs"
                  }
                  tone={data.pipelineSnapshot?.status ?? "neutral"}
                />
                {data.pipelineSnapshot ? (
                  <span className="text-sm text-fg-muted">
                    Last run {formatDateTime(data.pipelineSnapshot.startedAtIso)}
                  </span>
                ) : null}
              </div>
              <ActionSurfaceBar
                surface={data.permissions.actionSurface}
                onRunPipeline={handleRunPipeline}
                busyAction={pipelineBusy ? "run_pipeline" : null}
              />
            </div>

            {data.pipelineSnapshot ? (
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-border dark:border-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-fg-subtle">Candidates</p>
                  <p className="mt-2 text-2xl font-semibold text-fg">{data.pipelineSnapshot.candidatesCount}</p>
                </div>
                <div className="rounded-xl border border-border dark:border-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-fg-subtle">Validated</p>
                  <p className="mt-2 text-2xl font-semibold text-fg">{data.pipelineSnapshot.rulebookValidCount}</p>
                </div>
                <div className="rounded-xl border border-border dark:border-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-fg-subtle">Created</p>
                  <p className="mt-2 text-2xl font-semibold text-fg">{data.pipelineSnapshot.createdCount}</p>
                </div>
                <div className="rounded-xl border border-border dark:border-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-fg-subtle">Skipped</p>
                  <p className="mt-2 text-2xl font-semibold text-fg">{data.pipelineSnapshot.skippedCount}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-fg-muted">Nessuna run pipeline disponibile nel read-model attuale.</p>
            )}

            {pipelineResult ? (
              <pre className="mt-4 max-h-64 overflow-auto rounded-xl border border-border dark:border-white/10 bg-white/5 p-4 text-xs text-fg-muted">
                {JSON.stringify(pipelineResult, null, 2)}
              </pre>
            ) : null}
          </SectionCard>

          <SectionCard
            title="Recent submissions"
            subtitle="Submission result, stato pipeline bridged e accesso rapido al detail operativo."
          >
            {data.submissions.length === 0 ? (
              <p className="text-sm text-fg-muted">Nessuna submission disponibile.</p>
            ) : (
              <div className="space-y-4">
                {data.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-2xl border border-border dark:border-white/10 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-fg">{submission.title}</h3>
                          <ToneBadge label={submission.submissionResult.label} tone={submission.submissionResult.tone} />
                          <ToneBadge label={submission.pipelineState.label} tone={submission.pipelineState.tone} />
                        </div>
                        <p className="mt-2 text-sm text-fg-muted">
                          {submission.category} · closes {formatDateTime(submission.closesAtIso)} · created{" "}
                          {formatDateTime(submission.createdAtIso)}
                        </p>
                        {submission.reviewNotes.length > 0 ? (
                          <p className="mt-2 text-sm text-warning">
                            {submission.reviewNotes.join(" | ")}
                          </p>
                        ) : null}
                      </div>
                      <ActionSurfaceBar
                        surface={submission.actionSurface}
                        detailHref={`/admin/operations/${submission.id}`}
                        eventHref={submission.eventId ? `/events/${submission.eventId}` : undefined}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
