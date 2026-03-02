"use client";

export interface FeedCardActionsProps {
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onRepost?: () => void;
  onShare?: () => void;
}

function IconHeart({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconChat({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconRepost({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function IconShare({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export function FeedCardActions({
  likeCount,
  commentCount,
  isLiked = false,
  onLike,
  onComment,
  onRepost,
  onShare,
}: FeedCardActionsProps) {
  return (
    <div
      className="flex items-center border-t border-black/8 dark:border-white/10"
      role="group"
      aria-label="Azioni post"
    >
      <button
        type="button"
        onClick={onLike}
        className="flex flex-1 items-center justify-center gap-1.5 py-3.5 min-h-[44px] text-fg-muted hover:text-fg hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-colors"
        aria-label={isLiked ? "Rimuovi mi piace" : "Mi piace"}
      >
        <IconHeart
          filled={isLiked}
          className={`h-5 w-5 shrink-0 ${isLiked ? "text-red-500 dark:text-red-400" : ""}`}
        />
        <span className="text-xs font-medium tabular-nums">{likeCount}</span>
      </button>
      <button
        type="button"
        onClick={onComment}
        className="flex flex-1 items-center justify-center gap-1.5 py-3.5 min-h-[44px] text-fg-muted hover:text-fg hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-colors"
        aria-label="Commenti"
      >
        <IconChat className="h-5 w-5 shrink-0" />
        <span className="text-xs font-medium tabular-nums">{commentCount}</span>
      </button>
      <button
        type="button"
        onClick={onRepost}
        className="flex flex-1 items-center justify-center gap-1.5 py-3.5 min-h-[44px] text-fg-muted hover:text-fg hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-colors"
        aria-label="Ripubblica"
      >
        <IconRepost className="h-5 w-5 shrink-0" />
        <span className="hidden text-xs font-medium sm:inline">Ripubblica</span>
      </button>
      <button
        type="button"
        onClick={onShare}
        className="flex flex-1 items-center justify-center gap-1.5 py-3.5 min-h-[44px] text-fg-muted hover:text-fg hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-colors"
        aria-label="Condividi"
      >
        <IconShare className="h-5 w-5 shrink-0" />
        <span className="hidden text-xs font-medium sm:inline">Condividi</span>
      </button>
    </div>
  );
}
