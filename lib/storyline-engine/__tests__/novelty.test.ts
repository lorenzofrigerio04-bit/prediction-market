import { describe, it, expect } from 'vitest';
import { calculateNovelty } from '../novelty';
import type { StorylineInput, SourceSignalLite } from '../types';

describe('calculateNovelty', () => {
  it('returns high novelty for very recent storyline', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    
    const storyline: StorylineInput = {
      id: 'storyline-1',
      signals: [
        {
          id: '1',
          title: 'Recent Signal',
          publishedAt: new Date('2024-01-01T11:00:00Z'), // 1h ago
          host: 'example.com',
          sourceType: 'RSS_MEDIA',
        },
      ],
    };
    
    const allStorylines: StorylineInput[] = [storyline];
    
    const novelty = calculateNovelty(storyline, allStorylines, now);
    
    // ageScore = 100 - (1 * 5) = 95
    // uniqScore = 100 (only one storyline)
    // novelty = round(0.7 * 95 + 0.3 * 100) = round(66.5 + 30) = 97
    expect(novelty).toBeGreaterThan(90);
  });
  
  it('returns low novelty for old storyline', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    
    const storyline: StorylineInput = {
      id: 'storyline-1',
      signals: [
        {
          id: '1',
          title: 'Old Signal',
          publishedAt: new Date('2023-12-29T12:00:00Z'), // 50h ago
          host: 'example.com',
          sourceType: 'RSS_MEDIA',
        },
      ],
    };
    
    const allStorylines: StorylineInput[] = [storyline];
    
    const novelty = calculateNovelty(storyline, allStorylines, now);
    
    // ageScore = 100 - (50 * 5) = 100 - 250 = -150 → clamped to 0
    // uniqScore = 100 (only one storyline)
    // novelty = round(0.7 * 0 + 0.3 * 100) = 30
    expect(novelty).toBeLessThan(50);
  });
  
  it('returns lower novelty for storyline similar to others', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    
    // Create two very similar storylines
    const storyline1: StorylineInput = {
      id: 'storyline-1',
      signals: [
        {
          id: '1',
          title: 'Bitcoin price reaches new high',
          snippet: 'Cryptocurrency market surges',
          publishedAt: new Date('2024-01-01T11:00:00Z'),
          host: 'example.com',
          sourceType: 'RSS_MEDIA',
        },
      ],
    };
    
    const storyline2: StorylineInput = {
      id: 'storyline-2',
      signals: [
        {
          id: '2',
          title: 'Bitcoin price reaches new high',
          snippet: 'Cryptocurrency market surges',
          publishedAt: new Date('2024-01-01T11:30:00Z'),
          host: 'example2.com',
          sourceType: 'RSS_MEDIA',
        },
      ],
    };
    
    const allStorylines: StorylineInput[] = [storyline1, storyline2];
    
    const novelty1 = calculateNovelty(storyline1, allStorylines, now);
    const novelty2 = calculateNovelty(storyline2, allStorylines, now);
    
    // Both should have high ageScore (recent), but lower uniqScore due to similarity
    // Novelty should be lower than if they were unique
    expect(novelty1).toBeLessThan(95);
    expect(novelty2).toBeLessThan(95);
  });
  
  it('returns high novelty for unique storyline', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    
    const uniqueStoryline: StorylineInput = {
      id: 'storyline-unique',
      signals: [
        {
          id: '1',
          title: 'Completely unique topic about quantum computing',
          snippet: 'Scientists discover new quantum phenomenon',
          publishedAt: new Date('2024-01-01T11:00:00Z'),
          host: 'example.com',
          sourceType: 'RSS_MEDIA',
        },
      ],
    };
    
    const differentStoryline: StorylineInput = {
      id: 'storyline-different',
      signals: [
        {
          id: '2',
          title: 'Sports news about football match',
          snippet: 'Team wins championship',
          publishedAt: new Date('2024-01-01T10:00:00Z'),
          host: 'example2.com',
          sourceType: 'RSS_MEDIA',
        },
      ],
    };
    
    const allStorylines: StorylineInput[] = [uniqueStoryline, differentStoryline];
    
    const novelty = calculateNovelty(uniqueStoryline, allStorylines, now);
    
    // Should have high novelty due to uniqueness
    expect(novelty).toBeGreaterThan(70);
  });
  
  it('handles empty signals array', () => {
    const storyline: StorylineInput = {
      id: 'empty',
      signals: [],
    };
    
    const novelty = calculateNovelty(storyline, [storyline], new Date());
    expect(novelty).toBe(0);
  });
});
