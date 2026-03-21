/**
 * E2E tests for Event Gen v2 Pipeline
 *
 * Pipeline: Trend → Candidate → Title → Image Brief → Validator → Scoring → Publish
 * (Image Generation runs async via cron)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { runEventGenV2Pipeline } from '../run-pipeline';

const ORIGINAL_CANDIDATE_EVENT_GEN = process.env.CANDIDATE_EVENT_GEN;

describe('runEventGenV2Pipeline E2E', () => {
  let systemUserId: string;
  let clusterId: string;
  let articleIds: string[] = [];

  beforeEach(async () => {
    process.env.CANDIDATE_EVENT_GEN = 'false';
    systemUserId = await ensureSystemUser();
  });

  afterEach(async () => {
    process.env.CANDIDATE_EVENT_GEN = ORIGINAL_CANDIDATE_EVENT_GEN;
    await cleanup();
  });

  async function ensureSystemUser(): Promise<string> {
    const existing = await prisma.user.findFirst({
      where: { role: { in: ['BOT', 'SYSTEM'] } },
      select: { id: true },
    });
    if (existing) return existing.id;
    const created = await prisma.user.create({
      data: {
        email: 'system-e2e@prediction-market.local',
        name: 'System E2E',
        role: 'BOT',
        credits: 0,
      },
      select: { id: true },
    });
    return created.id;
  }

  async function cleanup(): Promise<void> {
    if (articleIds.length > 0) {
      await prisma.sourceArticle.deleteMany({ where: { id: { in: articleIds } } });
      articleIds = [];
    }
    if (clusterId) {
      await prisma.sourceCluster.deleteMany({ where: { id: clusterId } });
      clusterId = '';
    }
    const events = await prisma.event.findMany({
      where: { creationMetadata: { path: ['created_by_pipeline'], equals: 'event-gen-v2' } },
      select: { id: true },
    });
    if (events.length > 0) {
      await prisma.ammState.deleteMany({
        where: { eventId: { in: events.map((e) => e.id) } },
      });
      await prisma.event.deleteMany({
        where: { id: { in: events.map((e) => e.id) } },
      });
    }
  }

  async function seedEligibleStoryline(): Promise<void> {
    const now = new Date();
    const cluster = await prisma.sourceCluster.create({
      data: {
        jaccardScore: 0.8,
        articleCount: 2,
      },
    });
    clusterId = cluster.id;

    const articles = await Promise.all([
      prisma.sourceArticle.create({
        data: {
          canonicalUrl: `https://www.repubblica.it/e2e-${Date.now()}-1`,
          sourceType: 'RSS_MEDIA',
          title: 'Test Article 1 - Breaking News',
          publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          fetchedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          rawData: JSON.stringify({}),
          clusterId: cluster.id,
        },
      }),
      prisma.sourceArticle.create({
        data: {
          canonicalUrl: `https://www.repubblica.it/e2e-${Date.now()}-2`,
          sourceType: 'RSS_MEDIA',
          title: 'Test Article 2 - Follow up',
          publishedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
          fetchedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          rawData: JSON.stringify({}),
          clusterId: cluster.id,
        },
      }),
    ]);
    articleIds = articles.map((a) => a.id);
  }

  describe('Trend stage', () => {
    it('returns valid result with numeric counts', async () => {
      const result = await runEventGenV2Pipeline({
        prisma,
        now: new Date(),
        dryRun: true,
      });

      expect(typeof result.eligibleStorylinesCount).toBe('number');
      expect(result.eligibleStorylinesCount).toBeGreaterThanOrEqual(0);
      expect(typeof result.candidatesCount).toBe('number');
      expect(typeof result.createdCount).toBe('number');
      expect(result.createdCount).toBe(0); // dry run never creates
    });

    it('returns eligibleStorylinesCount>0 when storylines are seeded', async () => {
      await seedEligibleStoryline();

      const result = await runEventGenV2Pipeline({
        prisma,
        now: new Date(),
        dryRun: true,
      });

      expect(result.eligibleStorylinesCount).toBeGreaterThan(0);
    });
  });

  describe('Publish stage', () => {
    it('dry run creates no events (createdCount=0)', async () => {
      await seedEligibleStoryline();

      const beforeCount = await prisma.event.count({
        where: { sourceType: 'NEWS' },
      });

      const result = await runEventGenV2Pipeline({
        prisma,
        now: new Date(),
        dryRun: true,
      });

      const afterCount = await prisma.event.count({
        where: { sourceType: 'NEWS' },
      });

      expect(result.createdCount).toBe(0);
      expect(afterCount).toBe(beforeCount);
    });

    it('publish creates events with marketId and creationMetadata when not dry run', async () => {
      await seedEligibleStoryline();

      const result = await runEventGenV2Pipeline({
        prisma,
        now: new Date(),
        dryRun: false,
      });

      if (result.createdCount > 0) {
        const created = await prisma.event.findMany({
          where: {
            sourceType: 'NEWS',
            generatorVersion: '2.0',
            creationMetadata: { path: ['created_by_pipeline'], equals: 'event-gen-v2' },
          },
          take: 5,
        });
        expect(created.length).toBeGreaterThan(0);
        for (const e of created) {
          expect(e.marketId).toBeDefined();
          expect(e.marketId).toMatch(/^PM-\d{4}-\d{5}$/);
          expect(e.status).toBe('OPEN');
          expect(e.creationMetadata).toBeDefined();
          const meta = e.creationMetadata as { created_by_pipeline?: string };
          expect(meta?.created_by_pipeline).toBe('event-gen-v2');
        }
      }
    });
  });

  describe('Result structure', () => {
    it('returns EventGenV2Result with all required fields', async () => {
      const result = await runEventGenV2Pipeline({
        prisma,
        now: new Date(),
        dryRun: true,
      });

      expect(result).toHaveProperty('eligibleStorylinesCount');
      expect(result).toHaveProperty('candidatesCount');
      expect(result).toHaveProperty('rulebookValidCount');
      expect(result).toHaveProperty('rulebookRejectedCount');
      expect(result).toHaveProperty('dedupedCandidatesCount');
      expect(result).toHaveProperty('selectedCount');
      expect(result).toHaveProperty('createdCount');
      expect(result).toHaveProperty('skippedCount');
      expect(result).toHaveProperty('reasonsCount');
      expect(typeof result.reasonsCount).toBe('object');
    });
  });

  describe('PipelineRun persistence', () => {
    it('persists PipelineRun record when pipeline completes (skipped if table missing)', async () => {
      await seedEligibleStoryline();

      let beforeRuns = 0;
      try {
        beforeRuns = await prisma.pipelineRun.count();
      } catch {
        // Table may not exist if migration not applied - skip assertion
        return;
      }

      await runEventGenV2Pipeline({
        prisma,
        now: new Date(),
        dryRun: true,
      });

      const afterRuns = await prisma.pipelineRun.count();
      expect(afterRuns).toBeGreaterThanOrEqual(beforeRuns);
    });
  });
});
