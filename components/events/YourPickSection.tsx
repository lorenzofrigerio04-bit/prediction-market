'use client';

export interface YourPickSectionProps {
  userVote: 'yes' | 'no' | null;
  isAuthenticated: boolean;
  pointsMultiplier: number;
}

export function YourPickSection({
  userVote,
  isAuthenticated,
  pointsMultiplier,
}: YourPickSectionProps) {
  const points = Math.round(100 * pointsMultiplier);

  if (!isAuthenticated) {
    return (
      <div className="your-pick-section">
        <h2 className="section-title">Il tuo pick</h2>
        <div className="pick-placeholder">
          <p>Accedi per votare e guadagnare punti</p>
        </div>
        <style jsx>{`
          .your-pick-section {
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

          .pick-placeholder {
            text-align: center;
            padding: 2rem;
            color: var(--color-text-light);
          }
        `}</style>
      </div>
    );
  }

  if (userVote === null) {
    return (
      <div className="your-pick-section">
        <h2 className="section-title">Il tuo pick</h2>
        <div className="pick-not-voted">
          <p className="pick-message">Non hai ancora votato</p>
          <p className="pick-points">Punti possibili: +{points}</p>
        </div>
        <style jsx>{`
          .your-pick-section {
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

          .pick-not-voted {
            text-align: center;
            padding: 2rem;
          }

          .pick-message {
            font-size: 1.125rem;
            color: var(--color-text-light);
            margin: 0 0 0.5rem 0;
          }

          .pick-points {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-primary);
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="your-pick-section">
      <h2 className="section-title">Il tuo pick</h2>
      <div className={`pick-voted pick-${userVote}`}>
        <div className="pick-badge">
          <span className="pick-icon">{userVote === 'yes' ? '✓' : '✗'}</span>
          <span className="pick-value">{userVote === 'yes' ? 'SÌ' : 'NO'}</span>
        </div>
        <p className="pick-confirmation">Hai votato {userVote === 'yes' ? 'SÌ' : 'NO'}</p>
        <p className="pick-points">Punti possibili: +{points}</p>
      </div>

      <style jsx>{`
        .your-pick-section {
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

        .pick-voted {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          border-radius: var(--radius);
        }

        .pick-yes {
          background: rgba(16, 185, 129, 0.1);
          border: 2px solid var(--color-success);
        }

        .pick-no {
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid var(--color-danger);
        }

        .pick-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 2rem;
          font-weight: 700;
        }

        .pick-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .pick-yes .pick-icon {
          background: var(--color-success);
        }

        .pick-no .pick-icon {
          background: var(--color-danger);
        }

        .pick-value {
          color: var(--color-text);
        }

        .pick-confirmation {
          font-size: 1.125rem;
          color: var(--color-text);
          margin: 0;
        }

        .pick-points {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-primary);
          margin: 0;
        }

        @media (max-width: 768px) {
          .your-pick-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
