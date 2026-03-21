/**
 * Unit tests: AI Event Generator service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateEventsFromTrend } from '../service';
import type { TrendObject } from '../../trend-detection/types';

const NOW = new Date('2025-03-04T12:00:00Z');

function makeTrend(overrides: Partial<TrendObject> = {}): TrendObject {
  return {
    topic: 'Bitcoin 100k',
    category: 'Crypto',
    entities: ['Bitcoin'],
    trend_score: 0.8,
    time_sensitivity: 'medium',
    source_signals: [
      { providerId: 'newsapi', signalId: 'https://example.com/btc', timestamp: NOW },
    ],
    timestamp: NOW,
    ...overrides,
  };
}

const VALID_AI_RESPONSE = {
  candidates: [
    {
      category: 'Crypto',
      subject_entity: 'Bitcoin',
      condition: 'prezzo >= 100000 USD',
      threshold: 100000,
      deadline: '2025-03-15',
      resolution_source_primary: 'https://www.coingecko.com/',
      resolution_source_secondary: 'https://www.coinmarketcap.com/',
      resolution_criteria: {
        yes: 'Prezzo di Bitcoin >= 100000 USD su CoinGecko entro la deadline.',
        no: 'Prezzo di Bitcoin < 100000 USD alla deadline.',
      },
      title: 'Il prezzo di Bitcoin raggiungerà 100000 USD entro il 15 marzo 2025?',
    },
    {
      category: 'Crypto',
      subject_entity: 'Bitcoin',
      condition: 'market cap >= 2 trilioni USD',
      threshold: '2 trilioni',
      deadline: '2025-04-01',
      resolution_source_primary: 'https://www.coingecko.com/',
      resolution_criteria: {
        yes: 'Market cap di Bitcoin >= 2 trilioni USD su CoinGecko.',
        no: 'Market cap di Bitcoin < 2 trilioni USD.',
      },
      title: 'La capitalizzazione di Bitcoin supererà 2 trilioni USD entro aprile 2025?',
    },
    {
      category: 'Crypto',
      subject_entity: 'Bitcoin',
      condition: 'prezzo >= 95000 USD',
      threshold: 95000,
      deadline: '2025-03-20',
      resolution_source_primary: 'CoinGecko',
      resolution_criteria: {
        yes: 'Prezzo >= 95000 USD su CoinGecko.',
        no: 'Prezzo < 95000 USD.',
      },
    },
  ],
  best_index: 0,
};

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('generateEventsFromTrend', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, OPENAI_API_KEY: 'test-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns candidate when AI returns valid JSON', async () => {
    const OpenAI = (await import('openai')).default;
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(VALID_AI_RESPONSE),
          },
        },
      ],
    });
    (OpenAI as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }));

    const trend = makeTrend();
    const result = await generateEventsFromTrend({ trend, now: NOW });

    expect(result.candidate).not.toBeNull();
    expect(result.candidate?.category).toBe('Crypto');
    expect(result.candidate?.title).toContain('Bitcoin');
    expect(result.candidate?.title).toMatch(/\?$/);
    expect(result.candidate?.closesAt).toEqual(new Date('2025-03-15'));
    expect(result.candidate?.resolutionCriteriaYes).toContain('100000');
    expect(result.candidate?.resolutionCriteriaNo).toContain('100000');
    expect(result.candidate?.sourceStorylineId).toBe('trend:Bitcoin 100k');
    expect(result.candidate?.templateId).toBe('ai-event-generator');
    expect(result.candidatesGenerated).toBe(3);
  });

  it('parses JSON from markdown code block', async () => {
    const OpenAI = (await import('openai')).default;
    const wrapped = '```json\n' + JSON.stringify(VALID_AI_RESPONSE) + '\n```';
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: wrapped } }],
    });
    (OpenAI as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }));

    const result = await generateEventsFromTrend({
      trend: makeTrend(),
      now: NOW,
    });

    expect(result.candidate).not.toBeNull();
    expect(result.candidatesGenerated).toBe(3);
  });

  it('returns null when all candidates fail validation (deadline in past)', async () => {
    const pastResponse = {
      ...VALID_AI_RESPONSE,
      candidates: VALID_AI_RESPONSE.candidates.map((c) => ({
        ...c,
        deadline: '2020-01-01',
      })),
    };
    const OpenAI = (await import('openai')).default;
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(pastResponse) } }],
    });
    (OpenAI as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }));

    const result = await generateEventsFromTrend({
      trend: makeTrend(),
      now: NOW,
    });

    expect(result.candidate).toBeNull();
    expect(result.rejectionReasons).toContain('DEADLINE_IN_PAST');
  });

  it('returns null when AI returns invalid structure', async () => {
    const OpenAI = (await import('openai')).default;
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({ candidates: [], wrong: 'structure' }),
          },
        },
      ],
    });
    (OpenAI as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }));

    const result = await generateEventsFromTrend({
      trend: makeTrend(),
      now: NOW,
    });

    expect(result.candidate).toBeNull();
    expect(result.rejectionReasons).toContain('INVALID_STRUCTURE');
  });

  it('returns null and LLM_ERROR when API throws', async () => {
    const OpenAI = (await import('openai')).default;
    const mockCreate = vi.fn().mockRejectedValue(new Error('Network error'));
    (OpenAI as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }));

    const result = await generateEventsFromTrend({
      trend: makeTrend(),
      now: NOW,
    });

    expect(result.candidate).toBeNull();
    expect(result.rejectionReasons).toContain('LLM_ERROR');
  });

  it('throws when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    vi.resetModules();

    await expect(
      generateEventsFromTrend({ trend: makeTrend(), now: NOW })
    ).rejects.toThrow(/OPENAI_API_KEY/);
  });
});
