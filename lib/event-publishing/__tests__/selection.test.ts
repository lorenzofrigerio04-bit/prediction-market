/**
 * Test unitari per selezione candidati
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { selectCandidates, selectCandidatesWithInfo } from '../selection';
import type { PrismaClient } from '@prisma/client';
import type { ScoredCandidate } from '../types';

describe('selection', () => {
  let mockPrisma: any;
  const now = new Date('2025-01-01');
  const origUseLimits = process.env.GENERATION_USE_LIMITS;

  beforeEach(() => {
    process.env.GENERATION_USE_LIMITS = 'true'; // test con limiti (target 30, maxNew 25)
    mockPrisma = {
      event: {
        count: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
      },
    };
  });

  afterEach(() => {
    if (origUseLimits !== undefined) process.env.GENERATION_USE_LIMITS = origUseLimits;
    else delete process.env.GENERATION_USE_LIMITS;
  });

  const createCandidate = (
    title: string,
    category: string,
    storylineId: string,
    score: number,
    overall_score?: number
  ): ScoredCandidate => ({
    title,
    description: 'Desc',
    category,
    closesAt: new Date('2025-12-31'),
    resolutionAuthorityHost: 'www.example.com',
    resolutionAuthorityType: 'OFFICIAL',
    resolutionCriteriaYes: 'Yes',
    resolutionCriteriaNo: 'No',
    sourceStorylineId: storylineId,
    templateId: 't1',
    score,
    scoreBreakdown: { momentum: score, novelty: score, authority: 100, clarity: 50 },
    overall_score: overall_score ?? score / 100,
  });

  it('should return empty array when target is already reached', async () => {
    mockPrisma.event.count.mockResolvedValue(30);

    const candidates = [createCandidate('Title 1', 'Tech', 's1', 80)];

    const selected = await selectCandidates(mockPrisma as PrismaClient, candidates, now);
    expect(selected).toHaveLength(0);
  });

  it('should respect category cap', async () => {
    mockPrisma.event.count.mockResolvedValue(0);

    const candidates: ScoredCandidate[] = [];
    for (let i = 0; i < 15; i++) {
      candidates.push(createCandidate(`Tech ${i}`, 'Tecnologia', `s${i}`, 80, 0.85));
    }

    const selected = await selectCandidates(mockPrisma as PrismaClient, candidates, now);

    expect(selected.length).toBeLessThanOrEqual(25);
    expect(selected.every((c) => c.category === 'Tecnologia')).toBe(true);
  });

  it('should respect storyline cap', async () => {
    mockPrisma.event.count.mockResolvedValue(0);

    const candidates: ScoredCandidate[] = [];
    for (let i = 0; i < 5; i++) {
      candidates.push(createCandidate(`Title ${i}`, 'Tecnologia', 's1', 80, 0.85));
    }

    const selected = await selectCandidates(mockPrisma as PrismaClient, candidates, now);

    expect(selected.length).toBeLessThanOrEqual(1);
    expect(selected.every((c) => c.sourceStorylineId === 's1')).toBe(true);
  });

  it('should select candidates up to need', async () => {
    mockPrisma.event.count.mockResolvedValue(8);
    const target = 30;
    const maxNew = 25;
    const need = Math.min(Math.max(0, target - 8), maxNew);

    const candidates: ScoredCandidate[] = [];
    for (let i = 0; i < 20; i++) {
      candidates.push(
        createCandidate(`Title ${i}`, `Tecnologia`, `s${i}`, 80 - i, 0.85)
      );
    }

    const selected = await selectCandidates(mockPrisma as PrismaClient, candidates, now);

    expect(selected.length).toBeLessThanOrEqual(need);
  });

  it('should filter by quality gate and prioritize higher scores', async () => {
    mockPrisma.event.count.mockResolvedValue(0);

    const candidates = [
      createCandidate('Low Score', 'Tecnologia', 's1', 30, 0.3),
      createCandidate('High Score', 'Tecnologia', 's2', 90, 0.9),
      createCandidate('Medium Score', 'Tecnologia', 's3', 60, 0.6),
    ];

    const selected = await selectCandidates(mockPrisma as PrismaClient, candidates, now);

    expect(selected.length).toBeGreaterThan(0);
    const passed = selected.filter((c) => (c.overall_score ?? c.score / 100) >= 0.75);
    expect(passed.length).toBe(selected.length);
    if (selected.length >= 2) {
      expect(selected[0].score).toBeGreaterThanOrEqual(selected[1].score);
    }
  });

  describe('selectCandidatesWithInfo / zeroSelectedReason', () => {
    it('returns NEED_ZERO when open events already at target (need=0)', async () => {
      mockPrisma.event.count.mockResolvedValue(30);
      mockPrisma.event.findMany.mockResolvedValue([]);

      const candidates = [createCandidate('Title', 'Tech', 's1', 80, 0.85)];
      const info = await selectCandidatesWithInfo(mockPrisma as PrismaClient, candidates, now);

      expect(info.selected).toHaveLength(0);
      expect(info.need).toBe(0);
      expect(info.zeroSelectedReason).toBe('NEED_ZERO');
      expect(info.openEventsCount).toBe(30);
    });

    it('returns ALL_FAILED_QUALITY when all candidates below quality threshold', async () => {
      mockPrisma.event.count.mockResolvedValue(0);
      mockPrisma.event.findMany.mockResolvedValue([]);

      const candidates = [
        createCandidate('Low 1', 'Tech', 's1', 50, 0.5),
        createCandidate('Low 2', 'Tech', 's2', 60, 0.6),
      ];
      const info = await selectCandidatesWithInfo(mockPrisma as PrismaClient, candidates, now);

      expect(info.selected).toHaveLength(0);
      expect(info.need).toBeGreaterThan(0);
      expect(info.zeroSelectedReason).toBe('ALL_FAILED_QUALITY');
    });
  });

  describe('discovery relaxed selection (ENABLE_DISCOVERY_RELAXED_SELECTION)', () => {
    const discoveryStorylineId = 'mde-pipeline';

    beforeEach(() => {
      mockPrisma.event.count.mockResolvedValue(0);
      mockPrisma.event.findMany.mockResolvedValue([]);
    });

    it('when false: standard 0.70 does not pass, discovery 0.70 does not pass', async () => {
      const orig = process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = 'false';
      try {
        const standard = [createCandidate('Std', 'Tech', 's1', 70, 0.70)];
        const discovery = [createCandidate('Disc', 'Tech', discoveryStorylineId, 70, 0.70)];

        const infoStandard = await selectCandidatesWithInfo(mockPrisma as PrismaClient, standard, now);
        const infoDiscovery = await selectCandidatesWithInfo(mockPrisma as PrismaClient, discovery, now);

        expect(infoStandard.selected).toHaveLength(0);
        expect(infoStandard.zeroSelectedReason).toBe('ALL_FAILED_QUALITY');
        expect(infoDiscovery.selected).toHaveLength(0);
        expect(infoDiscovery.zeroSelectedReason).toBe('ALL_FAILED_QUALITY');
      } finally {
        if (orig !== undefined) process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = orig;
        else delete process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      }
    });

    it('when true: standard 0.70 does not pass, discovery 0.70 passes', async () => {
      const orig = process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      const origThreshold = process.env.QUALITY_THRESHOLD_DISCOVERY;
      process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = 'true';
      process.env.QUALITY_THRESHOLD_DISCOVERY = '0.65';
      try {
        const standard = [createCandidate('Std', 'Tech', 's1', 70, 0.70)];
        const discovery = [createCandidate('Disc', 'Tech', discoveryStorylineId, 70, 0.70)];

        const infoStandard = await selectCandidatesWithInfo(mockPrisma as PrismaClient, standard, now);
        const infoDiscovery = await selectCandidatesWithInfo(mockPrisma as PrismaClient, discovery, now);

        expect(infoStandard.selected).toHaveLength(0);
        expect(infoStandard.zeroSelectedReason).toBe('ALL_FAILED_QUALITY');
        expect(infoDiscovery.selected).toHaveLength(1);
        expect(infoDiscovery.selected[0]!.sourceStorylineId).toBe(discoveryStorylineId);
      } finally {
        if (orig !== undefined) process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = orig;
        else delete process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
        if (origThreshold !== undefined) process.env.QUALITY_THRESHOLD_DISCOVERY = origThreshold;
        else delete process.env.QUALITY_THRESHOLD_DISCOVERY;
      }
    });

    it('when true: discovery 0.64 does not pass (below 0.65)', async () => {
      const orig = process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = 'true';
      process.env.QUALITY_THRESHOLD_DISCOVERY = '0.65';
      try {
        const discovery = [createCandidate('Disc', 'Tech', discoveryStorylineId, 64, 0.64)];
        const info = await selectCandidatesWithInfo(mockPrisma as PrismaClient, discovery, now);
        expect(info.selected).toHaveLength(0);
        expect(info.zeroSelectedReason).toBe('ALL_FAILED_QUALITY');
      } finally {
        if (orig !== undefined) process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = orig;
        else delete process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      }
    });

    it('when true: standard 0.80 passes', async () => {
      const orig = process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = 'true';
      try {
        const standard = [createCandidate('Std', 'Tech', 's1', 80, 0.80)];
        const info = await selectCandidatesWithInfo(mockPrisma as PrismaClient, standard, now);
        expect(info.selected).toHaveLength(1);
        expect(info.selected[0]!.overall_score).toBe(0.80);
      } finally {
        if (orig !== undefined) process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = orig;
        else delete process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      }
    });

    it('zeroSelectedReason still correct when relaxed and all standard below threshold', async () => {
      const orig = process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = 'true';
      try {
        const standard = [
          createCandidate('A', 'Tech', 's1', 70, 0.70),
          createCandidate('B', 'Tech', 's2', 70, 0.70),
        ];
        const info = await selectCandidatesWithInfo(mockPrisma as PrismaClient, standard, now);
        expect(info.selected).toHaveLength(0);
        expect(info.zeroSelectedReason).toBe('ALL_FAILED_QUALITY');
      } finally {
        if (orig !== undefined) process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = orig;
        else delete process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      }
    });

    it('when true: discovery with sourceStorylineId mde-pipeline:observationId still uses relaxed threshold', async () => {
      const orig = process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = 'true';
      process.env.QUALITY_THRESHOLD_DISCOVERY = '0.65';
      try {
        const discovery = [createCandidate('Disc', 'Tech', 'mde-pipeline:obs_123', 70, 0.70)];
        const info = await selectCandidatesWithInfo(mockPrisma as PrismaClient, discovery, now);
        expect(info.selected).toHaveLength(1);
        expect(info.selected[0]!.sourceStorylineId).toBe('mde-pipeline:obs_123');
      } finally {
        if (orig !== undefined) process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = orig;
        else delete process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      }
    });
  });

  describe('caps: storyline and category other', () => {
    beforeEach(() => {
      mockPrisma.event.count.mockResolvedValue(0);
      mockPrisma.event.findMany.mockResolvedValue([]);
    });

    it('with distinct discovery storyline ids (mde-pipeline:id) can select more than one up to need', async () => {
      const orig = process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = 'true';
      process.env.QUALITY_THRESHOLD_DISCOVERY = '0.65';
      try {
        const in3d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const in14d = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        const in30d = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const candidates = [
          { ...createCandidate('A', 'Tecnologia', 'mde-pipeline:obs1', 70, 0.70), closesAt: in3d },
          { ...createCandidate('B', 'Tecnologia', 'mde-pipeline:obs2', 70, 0.70), closesAt: in14d },
          { ...createCandidate('C', 'Tecnologia', 'mde-pipeline:obs3', 70, 0.70), closesAt: in30d },
        ];
        const info = await selectCandidatesWithInfo(mockPrisma as PrismaClient, candidates, now);
        expect(info.selected.length).toBeGreaterThanOrEqual(2);
        expect(info.selected.length).toBeLessThanOrEqual(info.need);
        const ids = new Set(info.selected.map((c) => c.sourceStorylineId));
        expect(ids.size).toBe(info.selected.length);
      } finally {
        if (orig !== undefined) process.env.ENABLE_DISCOVERY_RELAXED_SELECTION = orig;
        else delete process.env.ENABLE_DISCOVERY_RELAXED_SELECTION;
      }
    });

    it('category other (e.g. general) allows at least one candidate', async () => {
      const candidate = createCandidate('General topic', 'general', 's1', 80, 0.85);
      const info = await selectCandidatesWithInfo(mockPrisma as PrismaClient, [candidate], now);
      expect(info.selected).toHaveLength(1);
      expect(info.selected[0]!.category).toBe('general');
    });
  });
});
