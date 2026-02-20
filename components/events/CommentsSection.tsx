'use client';

export interface CommentsSectionProps {
  eventId: string;
  comments?: Array<{
    id: string;
    nickname: string;
    content: string;
    timestamp: string;
  }>;
}

export function CommentsSection({ eventId, comments }: CommentsSectionProps) {
  // Placeholder read-only se non ci sono commenti o backend
  const hasComments = comments && comments.length > 0;

  return (
    <div className="comments-section">
      <h2 className="section-title">Commenti</h2>
      
      {hasComments ? (
        <div className="comments-list" role="list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item" role="listitem">
              <div className="comment-header">
                <span className="comment-author">{comment.nickname}</span>
                <span className="comment-time">{comment.timestamp}</span>
              </div>
              <p className="comment-content">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="comments-placeholder">
          <p>I commenti saranno disponibili a breve</p>
        </div>
      )}

      <style jsx>{`
        .comments-section {
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

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .comment-item {
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border-light);
        }

        .comment-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .comment-author {
          font-weight: 600;
          color: var(--color-text);
        }

        .comment-time {
          font-size: 0.875rem;
          color: var(--color-text-light);
        }

        .comment-content {
          color: var(--color-text);
          line-height: 1.6;
          margin: 0;
        }

        .comments-placeholder {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-text-light);
        }

        @media (max-width: 768px) {
          .comments-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
