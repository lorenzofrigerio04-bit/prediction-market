'use client';

import { LeaderboardEntry } from '@/hooks/useLeaderboard';

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  currentUserPosition?: number;
  showTop3?: boolean; // Se true, rimuove i top 3 dalla lista (per tipo score con podio)
}

export function LeaderboardList({ entries, currentUserPosition, showTop3 = false }: LeaderboardListProps) {
  // Rimuovi i top 3 dalla lista solo se showTop3 è true (già mostrati nel podio)
  const listEntries = showTop3 ? entries.slice(3) : entries;
  const currentUserEntry = entries.find((e) => e.isCurrentUser);

  return (
    <div className="leaderboard-list-container">
      {listEntries.length === 0 ? (
        <div className="leaderboard-empty">
          <p>Nessun altro utente in classifica.</p>
        </div>
      ) : (
        <>
          <div className="leaderboard-list">
            {listEntries.map((entry) => (
              <div
                key={entry.id}
                className={`leaderboard-row ${entry.isCurrentUser ? 'current-user' : ''}`}
              >
                <div className="leaderboard-position">{entry.position}</div>
                <div className="leaderboard-avatar">
                  {entry.avatar ? (
                    <img src={entry.avatar} alt={entry.username} />
                  ) : (
                    <div className="leaderboard-avatar-placeholder">
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="leaderboard-info">
                  <div className="leaderboard-username">{entry.username}</div>
                  <div className="leaderboard-meta">
                    <span>{entry.accuracy.toFixed(1)}% accuratezza</span>
                    {!showTop3 && (
                      <>
                        <span>•</span>
                        <span>{entry.streak} giorni streak</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="leaderboard-score">
                  {showTop3 ? entry.score.toLocaleString() : `${entry.streak} giorni`}
                </div>
              </div>
            ))}
          </div>

          {/* Riga "Tu" sticky se non è nei top 3 (quando c'è podio) */}
          {currentUserEntry && showTop3 && currentUserEntry.position > 3 && (
            <div className="leaderboard-current-user-sticky">
              <div className="leaderboard-row current-user sticky">
                <div className="leaderboard-position">{currentUserEntry.position}</div>
                <div className="leaderboard-avatar">
                  {currentUserEntry.avatar ? (
                    <img src={currentUserEntry.avatar} alt={currentUserEntry.username} />
                  ) : (
                    <div className="leaderboard-avatar-placeholder">
                      {currentUserEntry.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="leaderboard-info">
                  <div className="leaderboard-username">
                    {currentUserEntry.username} <span className="you-badge">(Tu)</span>
                  </div>
                  <div className="leaderboard-meta">
                    <span>{currentUserEntry.accuracy.toFixed(1)}% accuratezza</span>
                    {!showTop3 && (
                      <>
                        <span>•</span>
                        <span>{currentUserEntry.streak} giorni streak</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="leaderboard-score">
                  {showTop3 ? currentUserEntry.score.toLocaleString() : `${currentUserEntry.streak} giorni`}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .leaderboard-list-container {
          position: relative;
        }

        .leaderboard-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-text-light);
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .leaderboard-row {
          display: grid;
          grid-template-columns: 3rem 3rem 1fr auto;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          background: var(--color-bg);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .leaderboard-row:hover {
          transform: translateX(4px);
          box-shadow: var(--shadow-md);
        }

        .leaderboard-row.current-user {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 2px solid var(--color-primary);
          font-weight: 600;
        }

        .leaderboard-position {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-text);
          text-align: center;
        }

        .leaderboard-avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .leaderboard-row.current-user .leaderboard-avatar {
          border-color: var(--color-primary);
        }

        .leaderboard-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .leaderboard-avatar-placeholder {
          width: 100%;
          height: 100%;
          background: var(--color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .leaderboard-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }

        .leaderboard-username {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .you-badge {
          font-size: 0.875rem;
          color: var(--color-primary);
          font-weight: 700;
        }

        .leaderboard-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        .leaderboard-score {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-text);
          text-align: right;
        }

        .leaderboard-current-user-sticky {
          position: sticky;
          bottom: 1rem;
          z-index: 10;
          margin-top: 1rem;
        }

        .leaderboard-current-user-sticky .leaderboard-row.sticky {
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .leaderboard-row {
            grid-template-columns: 2.5rem 2.5rem 1fr auto;
            gap: 0.75rem;
            padding: 0.75rem;
          }

          .leaderboard-position {
            font-size: 1rem;
          }

          .leaderboard-avatar {
            width: 2.5rem;
            height: 2.5rem;
          }

          .leaderboard-username {
            font-size: 0.875rem;
          }

          .leaderboard-meta {
            font-size: 0.75rem;
          }

          .leaderboard-score {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
