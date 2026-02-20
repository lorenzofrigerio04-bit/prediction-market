import { useState, useEffect } from 'react';

interface TodayFeedData {
  closingSoon: {
    events: Array<{
      id: string;
      title: string;
      closesAt: string;
      category: string;
    }>;
    totalCount: number;
  };
  trendingNow: {
    events: Array<{
      id: string;
      title: string;
      closesAt: string;
      category: string;
      volume?: number;
    }>;
  };
  streakStatus: {
    streakCount: number;
    hasPredictedToday: boolean;
  };
  rewardProgress?: {
    remainingPredictions: number;
    rewardCredits: number;
    currentProgress: number;
    targetProgress: number;
  };
}

export function useTodayFeed() {
  const [data, setData] = useState<TodayFeedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTodayFeed() {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/today-feed');
        // const result = await response.json();
        
        // Mock data for now - replace with actual API call
        const result: TodayFeedData = {
          closingSoon: {
            events: [],
            totalCount: 0,
          },
          trendingNow: {
            events: [],
          },
          streakStatus: {
            streakCount: 0,
            hasPredictedToday: false,
          },
        };

        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch today feed'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTodayFeed();
  }, []);

  return { data, isLoading, error };
}
