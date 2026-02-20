'use client';

import { LeaderboardEntry } from '@/hooks/useLeaderboard';

interface PodioTop3Props {
  entries: LeaderboardEntry[];
}

export function PodioTop3({ entries }: PodioTop3Props) {
  const top3 = entries.slice(0, 3);

  if (top3.length === 0) {
    return null;
  }

  const [first, second, third] = top3;

  return (
    <div className="podio-container">
      <div className="podio-grid">
        {/* Secondo posto */}
        {second && (
          <div className="podio-card podio-second">
            <div className="podio-medal">🥈</div>
            <div className="podio-position">2°</div>
            <div className="podio-avatar">
              {second.avatar ? (
                <img src={second.avatar} alt={second.username} />
              ) : (
                <div className="podio-avatar-placeholder">
                  {second.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="podio-username">
              {second.username}
              {second.isCurrentUser && <span className="podio-you-badge"> (Tu)</span>}
            </div>
            <div className="podio-stats">
              <div className="podio-stat">
                <span className="podio-stat-label">Punteggio</span>
                <span className="podio-stat-value">{second.score.toLocaleString()}</span>
              </div>
              <div className="podio-stat">
                <span className="podio-stat-label">Accuratezza</span>
                <span className="podio-stat-value">{second.accuracy.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Primo posto */}
        {first && (
          <div className="podio-card podio-first">
            <div className="podio-crown">👑</div>
            <div className="podio-medal">🥇</div>
            <div className="podio-position">1°</div>
            <div className="podio-avatar">
              {first.avatar ? (
                <img src={first.avatar} alt={first.username} />
              ) : (
                <div className="podio-avatar-placeholder">
                  {first.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="podio-username">
              {first.username}
              {first.isCurrentUser && <span className="podio-you-badge"> (Tu)</span>}
            </div>
            <div className="podio-stats">
              <div className="podio-stat">
                <span className="podio-stat-label">Punteggio</span>
                <span className="podio-stat-value">{first.score.toLocaleString()}</span>
              </div>
              <div className="podio-stat">
                <span className="podio-stat-label">Accuratezza</span>
                <span className="podio-stat-value">{first.accuracy.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Terzo posto */}
        {third && (
          <div className="podio-card podio-third">
            <div className="podio-medal">🥉</div>
            <div className="podio-position">3°</div>
            <div className="podio-avatar">
              {third.avatar ? (
                <img src={third.avatar} alt={third.username} />
              ) : (
                <div className="podio-avatar-placeholder">
                  {third.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="podio-username">
              {third.username}
              {third.isCurrentUser && <span className="podio-you-badge"> (Tu)</span>}
            </div>
            <div className="podio-stats">
              <div className="podio-stat">
                <span className="podio-stat-label">Punteggio</span>
                <span className="podio-stat-value">{third.score.toLocaleString()}</span>
              </div>
              <div className="podio-stat">
                <span className="podio-stat-label">Accuratezza</span>
                <span className="podio-stat-value">{third.accuracy.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .podio-container {
          margin-bottom: 3rem;
        }

        .podio-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          align-items: end;
        }

        @media (min-width: 768px) {
          .podio-grid {
            grid-template-columns: 1fr 1.2fr 1fr;
            gap: 1rem;
          }
        }

        .podio-card {
          background: var(--color-bg);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          text-align: center;
          box-shadow: var(--shadow-md);
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .podio-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .podio-first {
          order: 2;
          padding-top: 2rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
        }

        @media (min-width: 768px) {
          .podio-first {
            transform: scale(1.1);
            z-index: 1;
          }
        }

        .podio-second {
          order: 1;
        }

        .podio-third {
          order: 3;
        }

        .podio-crown {
          font-size: 2rem;
          position: absolute;
          top: -1rem;
          left: 50%;
          transform: translateX(-50%);
        }

        .podio-medal {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .podio-position {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 1rem;
        }

        .podio-avatar {
          width: 80px;
          height: 80px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .podio-first .podio-avatar {
          width: 100px;
          height: 100px;
          border-color: #f59e0b;
          border-width: 4px;
        }

        .podio-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .podio-avatar-placeholder {
          width: 100%;
          height: 100%;
          background: var(--color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
        }

        .podio-first .podio-avatar-placeholder {
          background: #f59e0b;
        }

        .podio-username {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 1rem;
        }

        .podio-you-badge {
          font-size: 1rem;
          color: var(--color-primary);
          font-weight: 700;
        }

        .podio-stats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .podio-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: var(--color-bg-secondary);
          border-radius: var(--radius);
        }

        .podio-stat-label {
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        .podio-stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}
