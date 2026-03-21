import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import {
  buildOperationsDashboardViewModel,
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
    console.warn("[admin/operations] PipelineRun unavailable:", error);
    return null;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 403 });
    }

    await requireAdminCapability("events:create");

    const role = session.user.role ?? (await resolveCurrentRole(session.user.id));
    const [submissions, latestPipelineRun] = await Promise.all([
      prisma.eventSubmission.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
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
      }),
      loadLatestPipelineRun(),
    ]);

    const userIds = [...new Set(submissions.map((submission) => submission.submittedById))];
    const eventIds = [...new Set(submissions.map((submission) => submission.eventId).filter(Boolean))] as string[];

    const [users, events] = await Promise.all([
      userIds.length > 0
        ? prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
              id: true,
              name: true,
              email: true,
              credits: true,
              creditsMicros: true,
            },
          })
        : Promise.resolve([]),
      eventIds.length > 0
        ? prisma.event.findMany({
            where: { id: { in: eventIds } },
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
            },
          })
        : Promise.resolve([]),
    ]);

    const userMap = new Map<
      string,
      OperationsUserSummary & {
        credits: number;
        creditsMicros: bigint | null;
      }
    >(users.map((user) => [user.id, user]));
    const eventMap = new Map<string, OperationsEventSummary>(
      events.map((event) => [
        event.id,
        {
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
        },
      ])
    );

    const viewModel = buildOperationsDashboardViewModel({
      role,
      submissions: submissions.map<OperationsSubmissionRecord>((submission) => {
        const submitter = userMap.get(submission.submittedById);
        return {
          ...submission,
          submittedBy: submitter
            ? {
                id: submitter.id,
                name: submitter.name,
                email: submitter.email,
              }
            : null,
          event: submission.eventId ? eventMap.get(submission.eventId) ?? null : null,
          submitterCredits: submitter
            ? {
                credits: submitter.credits,
                creditsMicros: submitter.creditsMicros,
              }
            : null,
        };
      }),
      latestPipelineRun,
      gates: {
        mdeEnforceValidation: process.env.MDE_ENFORCE_VALIDATION === "true",
        // Deprecated: no longer gates pipeline path; runPipelineV2 always uses event-gen-v2.
        enableLegacyPipelineV2: process.env.ENABLE_LEGACY_PIPELINE_V2 === "true",
      },
    });

    return NextResponse.json(viewModel);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Non autenticato" || error.message.includes("Accesso negato"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[admin/operations]", error);
    return NextResponse.json(
      {
        error: "Errore nel caricamento del cockpit operativo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
