import { useState, useEffect } from 'react';

export type PeriodFilter = 'week' | 'month' | 'all-time';
export type LeaderboardType = 'score' | 'streak';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  position: number;
  score: number;
  accuracy: number; // percentuale
  streak: number;
  totalPredictions: number;
  correctPredictions: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentUserPosition?: number;
  period: PeriodFilter;
  hasData: boolean;
}

export function useLeaderboard(
  period: PeriodFilter,
  type: LeaderboardType = 'score'
) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API endpoint
        // const response = await fetch(`/api/leaderboard?period=${period}&type=${type}`);
        // const result = await response.json();

        // Mock data per sviluppo
        let mockEntries: LeaderboardEntry[] = [];

        // Genera dati mock per il periodo selezionato
        if (period === 'all-time' || period === 'month' || period === 'week') {
          mockEntries = generateMockEntries(period, type);
        }

        const hasData = mockEntries.length > 0;

        setData({
          entries: mockEntries,
          currentUserPosition: mockEntries.findIndex((e) => e.isCurrentUser) + 1 || undefined,
          period: period,
          hasData,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Errore nel caricamento classifica'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [period, type]);

  return { data, isLoading, error };
}

function generateMockEntries(
  period: PeriodFilter,
  type: LeaderboardType
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];

  // Genera top 20 utenti
  for (let i = 0; i < 20; i++) {
    const baseScore = type === 'score' ? 5000 - i * 200 : 0;
    const baseStreak = type === 'streak' ? 45 - i * 2 : 10 + Math.floor(Math.random() * 30);
    
    entries.push({
      id: `user-${i + 1}`,
      userId: `user-${i + 1}`,
      username: `Utente${i + 1}`,
      position: i + 1,
      score: type === 'score' ? baseScore : baseStreak * 100, // Per streak, score derivato
      accuracy: 85 - i * 2 + Math.random() * 5,
      streak: baseStreak,
      totalPredictions: 150 - i * 5,
      correctPredictions: Math.floor((150 - i * 5) * (0.85 - i * 0.02)),
      isCurrentUser: i === 7, // Simula utente corrente alla posizione 8
    });
  }

  // Ordina per tipo
  if (type === 'streak') {
    entries.sort((a, b) => b.streak - a.streak);
    entries.forEach((entry, index) => {
      entry.position = index + 1;
    });
  } else {
    entries.sort((a, b) => b.score - a.score);
  }

  return entries;
}
