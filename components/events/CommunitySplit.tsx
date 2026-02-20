'use client';

import { useEffect, useState } from 'react';

export interface CommunitySplitProps {
  yesPct: number;
  noPct: number;
  participants: number;
}

export function CommunitySplit({ yesPct, noPct, participants }: CommunitySplitProps) {
  const [animatedYes, setAnimatedYes] = useState(0);
  const [animatedNo, setAnimatedNo] = useState(0);

  useEffect(() => {
    // Animazione di entrata per le percentuali
    const duration = 1000; // 1 secondo
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const animate = () => {
      if (currentStep <= steps) {
        const progress = currentStep / steps;
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedYes(yesPct * eased);
        setAnimatedNo(noPct * eased);
        currentStep++;
        setTimeout(animate, stepDuration);
      }
    };

    animate();
  }, [yesPct, noPct]);

  return (
    <div className="community-split">
      <div className="community-split-header">
        <h2 className="community-split-title">Community dice</h2>
        <span className="community-participants">{participants} partecipanti</span>
      </div>

      <div className="split-visualization">
        <div 
          className="split-bar yes-bar" 
          style={{ width: `${yesPct}%` }}
          role="progressbar"
          aria-valuenow={yesPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${yesPct}% voti SÌ`}
        >
          <span className="split-label yes-label">SÌ</span>
          <span className="split-percentage yes-percentage">
            {Math.round(animatedYes)}%
          </span>
        </div>
        <div 
          className="split-bar no-bar" 
          style={{ width: `${noPct}%` }}
          role="progressbar"
          aria-valuenow={noPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${noPct}% voti NO`}
        >
          <span className="split-label no-label">NO</span>
          <span className="split-percentage no-percentage">
            {Math.round(animatedNo)}%
          </span>
        </div>
      </div>

      <div className="split-details">
        <div className="split-detail-item">
          <span className="detail-label">SÌ</span>
          <span className="detail-value">{Math.round((participants * yesPct) / 100)} voti</span>
        </div>
        <div className="split-detail-item">
          <span className="detail-label">NO</span>
          <span className="detail-value">{Math.round((participants * noPct) / 100)} voti</span>
        </div>
      </div>

      <style jsx>{`
        .community-split {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .community-split-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .community-split-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .community-participants {
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        .split-visualization {
          display: flex;
          height: 120px;
          border-radius: var(--radius);
          overflow: hidden;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .split-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          min-width: 0;
        }

        .yes-bar {
          background: linear-gradient(135deg, var(--color-success), #059669);
        }

        .no-bar {
          background: linear-gradient(135deg, var(--color-danger), #dc2626);
        }

        .split-label {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .split-percentage {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          font-variant-numeric: tabular-nums;
        }

        .split-details {
          display: flex;
          gap: 2rem;
          justify-content: center;
        }

        .split-detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.875rem;
          color: var(--color-text-light);
          font-weight: 500;
        }

        .detail-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text);
        }

        @media (max-width: 768px) {
          .community-split {
            padding: 1.5rem;
          }

          .split-visualization {
            height: 100px;
          }

          .split-bar {
            padding: 0 1rem;
          }

          .split-label {
            font-size: 1.25rem;
          }

          .split-percentage {
            font-size: 2rem;
          }

          .split-details {
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .split-bar {
            flex-direction: column;
            justify-content: center;
            gap: 0.25rem;
          }

          .split-label {
            font-size: 1rem;
          }

          .split-percentage {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
