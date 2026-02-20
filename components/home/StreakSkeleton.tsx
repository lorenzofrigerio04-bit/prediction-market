export function StreakSkeleton() {
  return (
    <div className="section skeleton">
      <div className="skeleton-title" />
      <div className="streak-content">
        <div className="skeleton-streak-number" />
        <div className="skeleton-streak-label" />
      </div>
      <style jsx>{`
        .section {
          background: var(--color-bg);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        .skeleton-title {
          height: 1.5rem;
          background: var(--color-border);
          border-radius: 0.25rem;
          width: 60%;
          margin-bottom: 1rem;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .streak-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .skeleton-streak-number {
          height: 3rem;
          width: 4rem;
          background: var(--color-border);
          border-radius: 0.25rem;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .skeleton-streak-label {
          height: 1rem;
          width: 5rem;
          background: var(--color-border);
          border-radius: 0.25rem;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
