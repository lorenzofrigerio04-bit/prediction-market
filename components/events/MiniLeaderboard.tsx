'use client';

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  points?: number;
  accuracy?: number;
}

export interface MiniLeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

export function MiniLeaderboard({ entries, isLoading }: MiniLeaderboardProps) {
  if (isLoading) {
    return (
      <div className="mini-leaderboard">
        <h2 className="section-title">Top 5</h2>
        <div className="leaderboard-loading">
          <p>Caricamento classifica...</p>
        </div>
        <style jsx>{`
          .mini-leaderboard {
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: 2rem;
            margin-bottom: 2rem;
          }

          .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-text);
            margin: 0 0 1.5rem 0;
          }

          .leaderboard-loading {
            text-align: center;
            padding: 2rem;
            color: var(--color-text-light);
          }
        `}</style>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="mini-leaderboard">
        <h2 className="section-title">Top 5</h2>
        <div className="leaderboard-empty">
          <p>Nessun dato disponibile</p>
        </div>
        <style jsx>{`
          .mini-leaderboard {
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: 2rem;
            margin-bottom: 2rem;
          }

          .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-text);
            margin: 0 0 1.5rem 0;
          }

          .leaderboard-empty {
            text-align: center;
            padding: 2rem;
            color: var(--color-text-light);
          }
        `}</style>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="mini-leaderboard">
      <h2 className="section-title">Top 5</h2>
      <div className="leaderboard-list" role="list">
        {entries.map((entry) => (
          <div key={entry.rank} className="leaderboard-item" role="listitem">
            <div className="item-rank">{getRankIcon(entry.rank)}</div>
            <div className="item-info">
              <div className="item-nickname">{entry.nickname}</div>
              <div className="item-stats">
                {entry.points !== undefined && (
                  <span className="stat">{entry.points.toLocaleString()} punti</span>
                )}
                {entry.accuracy !== undefined && (
                  <span className="stat">{Math.round(entry.accuracy)}% accuratezza</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .mini-leaderboard {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0 0 1.5rem 0;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--color-bg-secondary);
          border-radius: var(--radius);
          transition: all 0.2s;
        }

        .leaderboard-item:hover {
          background: var(--color-border-light);
        }

        .item-rank {
          font-size: 1.5rem;
          font-weight: 700;
          min-width: 3rem;
          text-align: center;
          color: var(--color-text);
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .item-nickname {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text);
        }

        .item-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat {
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        @media (max-width: 768px) {
          .mini-leaderboard {
            padding: 1.5rem;
          }

          .item-rank {
            min-width: 2.5rem;
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
