/**
 * Test unitari per selezione candidati
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { selectCandidates } from '../selection';
import type { PrismaClient } from '@prisma/client';
import type { ScoredCandidate } from '../types';

describe('selection', () => {
  let mockPrisma: any;
  const now = new Date('2025-01-01');

  beforeEach(() => {
    mockPrisma = {
      event: {
        count: vi.fn(),
      },
    };
  });

  const createCandidate = (
    title: string,
    category: string,
    storylineId: string,
    score: number
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
  });

  it('should return empty array when target is already reached', async () => {
    // Mock: 40 eventi OPEN già presenti (target raggiunto)
    mockPrisma.event.count.mockResolvedValue(40);
    
    const candidates = [
      createCandidate('Title 1', 'Tech', 's1', 80),
    ];

    const selected = await selectCandidates(mockPrisma as PrismaClient, candidates, now);
    expect(selected).toHaveLength(0);
  });

  it('should respect category cap', async () => {
    // Mock: 0 eventi OPEN (need = 40)
    mockPrisma.event.count.mockResolvedValue(0);
    
    // Crea 15 candidati Tech (cap default = 10)
    const candidates: ScoredCandidate[] = [];
    for (let i = 0; i < 15; i++) {
      candidates.push(createCandidate(`Tech ${i}`, 'Tech', `s${i}`, 80 - i));
    }

    const selected = await selectCandidates(mockPrisma as PrismaClient, candidates, now);
    
    // Dovrebbe selezionare solo 10 (CATEGORY_CAP_DEFAULT)
    expect(selected.length).toBeLessThanOrEqual(10);
    expect(selected.every(c => c.category === 'Tech')).toBe(true);
  });

  it('should respect storyline cap', async () => {
    // Mock: 0 eventi OPEN
    mockPrisma.event.count.mockResolvedValue(0);
    
    // Crea 5 candidati dalla stessa storyline (cap = 3)
    const candidates: ScoredCandidate[] = [];
    for (let i = 0; i < 5; i++) {
      candidates.push(createCandidate(`Title ${i}`, 'Tech', 's1', 80 - i));
    }

    const selected = await selectCandidates(mockPrisma as PrismaClient, candidates, now);
    
    // Dovrebbe selezionare solo 3 (MAX_EVENTS_PER_STORYLINE)
    expect(selected.length).toBeLessThanOrEqual(3);
    expect(selected.every(c => c.sourceStorylineId === 's1')).toBe(true);
  });

  it('should select candidates up to need', async () => {
    // Mock: 30 eventi OPEN (need = 10)
    mockPrisma.event.count.mockResolvedValue(30);
    
    const candidates: ScoredCandidate[] = [];
    for (let i = 0; i < 20; i++) {
      candidates.push(createCandidate(`Title ${i}`, `Cat${i % 3}`, `s${i}`, 80 - i));
    }

    const selected = await selectCandidates(mockPrisma as PrismaClient, candidates, now);
    
    // Dovrebbe selezionare fino a 10 (need)
    expect(selected.length).toBeLessThanOrEqual(10);
  });

  it('should prioritize higher scores', async () => {
    // Mock: 0 eventi OPEN
    mockPrisma.event.count.mockResolvedValue(0);
    
    const candidates = [
      createCandidate('Low Score', 'Tech', 's1', 30),
      createCandidate('High Score', 'Tech', 's2', 90),
      createCandidate('Medium Score', 'Tech', 's3', 60),
    ];

    const selected = await selectCandidates(mockPrisma as PrismaClient, candidates, now);
    
    // Dovrebbe selezionare in ordine di score
    expect(selected.length).toBeGreaterThan(0);
    if (selected.length >= 2) {
      expect(selected[0].score).toBeGreaterThanOrEqual(selected[1].score);
    }
  });
});
