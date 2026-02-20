interface SectionSkeletonProps {
  title: string;
  maxCards: number;
}

export function SectionSkeleton({ title, maxCards }: SectionSkeletonProps) {
  return (
    <div className="section skeleton">
      <h2 className="section-title">{title}</h2>
      <div className="section-cards">
        {Array.from({ length: maxCards }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line skeleton-line-short" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line-short" />
          </div>
        ))}
      </div>
      <style jsx>{`
        .section {
          background: var(--color-bg);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        .section-title {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--color-text);
        }
        .section-cards {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .skeleton-card {
          background: var(--color-bg-secondary);
          border-radius: var(--radius);
          padding: 1rem;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .skeleton-line {
          height: 0.75rem;
          background: var(--color-border);
          border-radius: 0.25rem;
          margin-bottom: 0.5rem;
        }
        .skeleton-line:last-child {
          margin-bottom: 0;
        }
        .skeleton-line-short {
          width: 40%;
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
