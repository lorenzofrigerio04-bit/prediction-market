import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import { evaluateAdminCapability } from "@/lib/integration/adapters/admin-capability-adapter";
import {
  buildOperationsDetailViewModel,
  type AuditSummaryRecord,
  type OperationsEventSummary,
  type OperationsPipelineRunRecord,
  type OperationsSubmissionRecord,
  type OperationsUserSummary,
} from "@/lib/admin-operations";

export const dynamic = "force-dynamic";

async function resolveCurrentRole(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role ?? null;
}

async function loadLatestPipelineRun(): Promise<OperationsPipelineRunRecord | null> {
  try {
    const run = await prisma.pipelineRun.findFirst({
      orderBy: { startedAt: "desc" },
      select: {
        runId: true,
        startedAt: true,
        completedAt: true,
        source: true,
        eligibleCount: true,
        candidatesCount: true,
        rulebookValidCount: true,
        rulebookRejectedCount: true,
        selectedCount: true,
        createdCount: true,
        skippedCount: true,
        errorMessage: true,
      },
    });

    return run ?? null;
  } catch (error) {
    console.warn("[admin/operations/detail] PipelineRun unavailable:", error);
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 403 });
    }

    await requireAdminCapability("events:create");

    const role = session.user.role ?? (await resolveCurrentRole(session.user.id));
    const { id } = await params;
    const submission = await prisma.eventSubmission.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        closesAt: true,
        resolutionSource: true,
        status: true,
        reviewNotes: true,
        eventId: true,
        notifyPhone: true,
        createdAt: true,
        updatedAt: true,
        reviewedAt: true,
        reviewedById: true,
        submittedById: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission non trovata" }, { status: 404 });
    }

    const [submitter, event, latestPipelineRun] = await Promise.all([
      prisma.user.findUnique({
        where: { id: submission.submittedById },
        select: {
          id: true,
          name: true,
          email: true,
          credits: true,
          creditsMicros: true,
        },
      }),
      submission.eventId
        ? prisma.event.findUnique({
            where: { id: submission.eventId },
            select: {
              id: true,
              title: true,
              category: true,
              status: true,
              resolutionStatus: true,
              closesAt: true,
              createdAt: true,
              updatedAt: true,
              resolved: true,
              outcome: true,
              marketId: true,
              tradingMode: true,
              totalCredits: true,
              resolutionSourceUrl: true,
              creationMetadata: true,
            },
          })
        : Promise.resolve(null),
      loadLatestPipelineRun(),
    ]);

    const canReadAudit = evaluateAdminCapability("audit:read", { role }).allowed;
    const auditLogs = canReadAudit && submission.eventId
      ? await prisma.auditLog.findMany({
          where: {
            OR: [
              { entityType: "event", entityId: submission.eventId },
              { entityType: "event_submission", entityId: submission.id },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 8,
        })
      : [];

    const auditUserIds = [...new Set(auditLogs.map((log) => log.userId).filter(Boolean))] as string[];
    const auditUsers = auditUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: auditUserIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const auditUserMap = new Map<string, OperationsUserSummary>(auditUsers.map((user) => [user.id, user]));

    const eventSummary: OperationsEventSummary | null = event
      ? {
          id: event.id,
          title: event.title,
          category: event.category,
          status: event.status,
          resolutionStatus: event.resolutionStatus,
          closesAtIso: event.closesAt.toISOString(),
          createdAtIso: event.createdAt.toISOString(),
          updatedAtIso: event.updatedAt.toISOString(),
          resolved: event.resolved,
          outcome: event.outcome,
          marketId: event.marketId,
          tradingMode: event.tradingMode,
          totalCredits: event.totalCredits,
          resolutionSourceUrl: event.resolutionSourceUrl,
          creationMetadata: event.creationMetadata as Record<string, unknown> | null ?? null,
        }
      : null;

    const submissionRecord: OperationsSubmissionRecord = {
      ...submission,
      submittedBy: submitter
        ? {
            id: submitter.id,
            name: submitter.name,
            email: submitter.email,
          }
        : null,
      event: eventSummary,
      submitterCredits: submitter
        ? {
            credits: submitter.credits,
            creditsMicros: submitter.creditsMicros,
          }
        : null,
    };

    const detail = buildOperationsDetailViewModel({
      role,
      submission: submissionRecord,
      auditItems: auditLogs.map<AuditSummaryRecord>((log) => ({
        id: log.id,
        createdAt: log.createdAt,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        user: log.userId ? auditUserMap.get(log.userId) ?? null : null,
      })),
      latestPipelineRun,
      gates: {
        mdeEnforceValidation: process.env.MDE_ENFORCE_VALIDATION === "true",
        // Deprecated: no longer gates pipeline path; runPipelineV2 always uses event-gen-v2.
        enableLegacyPipelineV2: process.env.ENABLE_LEGACY_PIPELINE_V2 === "true",
      },
    });

    return NextResponse.json(detail);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Non autenticato" || error.message.includes("Accesso negato"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[admin/operations/detail]", error);
    return NextResponse.json(
      {
        error: "Errore nel caricamento del dettaglio operativo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
