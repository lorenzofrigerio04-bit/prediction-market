'use client';

import { TODAY_FEED_COPY } from '@/constants/todayFeed';

interface ProgressRewardCardProps {
  remainingPredictions: number;
  rewardCredits: number;
  currentProgress: number;
  targetProgress: number;
}

export function ProgressRewardCard({
  remainingPredictions,
  rewardCredits,
  currentProgress,
  targetProgress,
}: ProgressRewardCardProps) {
  const progressPercentage = Math.min(
    (currentProgress / targetProgress) * 100,
    100
  );

  return (
    <div className="progress-reward-card">
      <h3 className="card-title">{TODAY_FEED_COPY.REWARD_TITLE}</h3>
      <p className="card-description">
        Ti mancano {remainingPredictions} previsioni per +{rewardCredits} crediti (oggi)
      </p>
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="progress-text">
        <span>{currentProgress}</span>
        <span>/</span>
        <span>{targetProgress}</span>
      </div>
      <style jsx>{`
        .progress-reward-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          color: white;
          margin-top: 2rem;
        }
        .card-title {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .card-description {
          font-size: 0.875rem;
          opacity: 0.95;
          margin-bottom: 1rem;
        }
        .progress-bar-container {
          background: rgba(255, 255, 255, 0.2);
          border-radius: var(--radius);
          height: 0.5rem;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        .progress-bar-fill {
          background: white;
          height: 100%;
          border-radius: var(--radius);
          transition: width 0.3s ease;
        }
        .progress-text {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .progress-text span:first-child {
          font-size: 1.125rem;
        }
        .progress-text span:last-child {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
