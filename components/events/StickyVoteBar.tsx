'use client';

import { useState } from 'react';

export interface StickyVoteBarProps {
  isAuthenticated: boolean;
  isClosed?: boolean;
  onVote: (vote: 'yes' | 'no') => void;
  onAuthRequired: () => void;
}

export function StickyVoteBar({
  isAuthenticated,
  isClosed,
  onVote,
  onAuthRequired,
}: StickyVoteBarProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (vote: 'yes' | 'no') => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    setIsVoting(true);
    try {
      await onVote(vote);
    } finally {
      setIsVoting(false);
    }
  };

  if (isClosed) {
    return null;
  }

  return (
    <div className="sticky-vote-bar">
      <div className="sticky-vote-bar-content">
        <button
          type="button"
          className="vote-button vote-yes"
          onClick={() => handleVote('yes')}
          disabled={isVoting}
          aria-label="Vota SÌ"
        >
          SÌ
        </button>
        <button
          type="button"
          className="vote-button vote-no"
          onClick={() => handleVote('no')}
          disabled={isVoting}
          aria-label="Vota NO"
        >
          NO
        </button>
      </div>

      <style jsx>{`
        .sticky-vote-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-bg);
          border-top: 1px solid var(--color-border);
          padding: 1rem;
          z-index: 100;
          box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .sticky-vote-bar-content {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          gap: 1rem;
        }

        .vote-button {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: var(--radius);
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .vote-button:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        .vote-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .vote-yes {
          background: var(--color-success);
          color: white;
        }

        .vote-yes:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .vote-yes:active:not(:disabled) {
          transform: translateY(0);
        }

        .vote-no {
          background: var(--color-danger);
          color: white;
        }

        .vote-no:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .vote-no:active:not(:disabled) {
          transform: translateY(0);
        }

        @media (min-width: 769px) {
          .sticky-vote-bar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
