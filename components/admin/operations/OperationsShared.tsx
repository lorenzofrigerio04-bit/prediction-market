"use client";

import Link from "next/link";
import type { OperationsPermissionSurface } from "@/lib/admin-operations";

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ToneBadge({
  label,
  tone,
  title,
}: {
  label: string;
  tone: "success" | "warning" | "danger" | "neutral";
  title?: string;
}) {
  const classes =
    tone === "success"
      ? "bg-success/10 text-success"
      : tone === "warning"
        ? "bg-warning/10 text-warning"
        : tone === "danger"
          ? "bg-danger/10 text-danger"
          : "bg-surface text-fg-muted";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
      title={title}
    >
      {label}
    </span>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-raised rounded-2xl p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-fg-muted">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function actionConstraintText(
  actionKey: string,
  surface: OperationsPermissionSurface["actionSurface"]
) {
  return (
    surface.actionConstraints.find((constraint) => constraint.actionKey === actionKey)?.description ??
    null
  );
}

export function ActionSurfaceBar({
  surface,
  detailHref,
  eventHref,
  auditHref,
  creditsHref,
  onRunPipeline,
  busyAction,
}: {
  surface: OperationsPermissionSurface["actionSurface"];
  detailHref?: string;
  eventHref?: string;
  auditHref?: string;
  creditsHref?: string;
  onRunPipeline?: () => void;
  busyAction?: string | null;
}) {
  const hidden = new Set(surface.hiddenActionKeys);
  const disabled = new Set(surface.disabledActionKeys);
  const available = new Set(surface.availableActionKeys);

  return (
    <div className="flex flex-wrap gap-2">
      {!hidden.has("open_detail") && detailHref ? (
        <Link
          href={detailHref}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            available.has("open_detail")
              ? "bg-primary text-white hover:bg-primary-hover"
              : "border border-border dark:border-white/10 text-fg-muted pointer-events-none opacity-60"
          }`}
        >
          Open detail
        </Link>
      ) : null}

      {!hidden.has("open_event") ? (
        available.has("open_event") && !disabled.has("open_event") ? (
          <Link
            href={eventHref ?? "#"}
            className="rounded-xl border border-border dark:border-white/10 px-4 py-2 text-sm font-medium text-fg hover:bg-surface/80 transition-colors"
          >
            Open event
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title={actionConstraintText("open_event", surface) ?? undefined}
            className="rounded-xl border border-border dark:border-white/10 px-4 py-2 text-sm font-medium text-fg-muted opacity-60"
          >
            Open event
          </button>
        )
      ) : null}

      {!hidden.has("view_audit") && available.has("view_audit") && !disabled.has("view_audit") && auditHref ? (
        <Link
          href={auditHref}
          className="rounded-xl border border-border dark:border-white/10 px-4 py-2 text-sm font-medium text-fg hover:bg-surface/80 transition-colors"
        >
          Audit summary
        </Link>
      ) : null}

      {!hidden.has("run_pipeline") && onRunPipeline ? (
        <button
          type="button"
          onClick={available.has("run_pipeline") && !disabled.has("run_pipeline") ? onRunPipeline : undefined}
          disabled={!available.has("run_pipeline") || disabled.has("run_pipeline") || busyAction === "run_pipeline"}
          title={actionConstraintText("run_pipeline", surface) ?? undefined}
          className="rounded-xl border border-border dark:border-white/10 px-4 py-2 text-sm font-medium text-fg hover:bg-surface/80 disabled:opacity-60 transition-colors"
        >
          {busyAction === "run_pipeline" ? "Running..." : "Run pipeline"}
        </button>
      ) : null}

      {!hidden.has("view_audit") && disabled.has("view_audit") ? (
        <span
          className="rounded-xl border border-border dark:border-white/10 px-4 py-2 text-sm text-fg-muted opacity-70"
          title={actionConstraintText("view_audit", surface) ?? undefined}
        >
          Audit summary unavailable
        </span>
      ) : null}

      {!hidden.has("view_credits") && disabled.has("view_credits") ? (
        <span
          className="rounded-xl border border-border dark:border-white/10 px-4 py-2 text-sm text-fg-muted opacity-70"
          title={actionConstraintText("view_credits", surface) ?? undefined}
        >
          Credits unavailable
        </span>
      ) : null}

      {!hidden.has("view_credits") && available.has("view_credits") && !disabled.has("view_credits") && creditsHref ? (
        <Link
          href={creditsHref}
          className="rounded-xl border border-border dark:border-white/10 px-4 py-2 text-sm font-medium text-fg hover:bg-surface/80 transition-colors"
        >
          Credits
        </Link>
      ) : null}
    </div>
  );
}
