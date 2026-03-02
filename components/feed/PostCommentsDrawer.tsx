"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface PostCommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface PostCommentItem {
  id: string;
  content: string;
  createdAt: string;
  user: PostCommentUser;
  replies: PostCommentItem[];
  _count?: { replies: number };
}

export interface PostCommentsDrawerProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountUpdate?: (postId: string, count: number) => void;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Adesso";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minuto" : "minuti"} fa`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "ora" : "ore"} fa`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "giorno" : "giorni"} fa`;

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function CommentItem({
  comment,
  isReply = false,
}: {
  comment: PostCommentItem;
  isReply?: boolean;
}) {
  return (
    <div
      className={isReply ? "ml-4 mt-3 pl-3 border-l-2 border-primary/30" : ""}
    >
      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20 p-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-fg-muted/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {comment.user.image ? (
              <img
                src={comment.user.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-fg-muted">
                {(comment.user.name || comment.user.id[0]).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-fg">
                {comment.user.name || "Utente"}
              </span>
              <span className="text-xs text-fg-muted">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-fg-muted whitespace-pre-wrap break-words leading-relaxed">
              {comment.content}
            </p>
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PostCommentsDrawer({
  postId,
  isOpen,
  onClose,
  onCommentCountUpdate,
}: PostCommentsDrawerProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<PostCommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setComments(data.comments ?? []);
    } catch (e) {
      console.error("Fetch post comments:", e);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    } else {
      setComments([]);
      setNewComment("");
    }
  }, [isOpen, postId, fetchComments]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId || !session || !newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore nell'invio");
      setNewComment("");
      await fetchComments();
      if (typeof data.commentCount === "number" && onCommentCountUpdate) {
        onCommentCountUpdate(postId, data.commentCount);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Errore nell'invio del commento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-comments-drawer-title"
    >
      <div
        className="w-full sm:max-w-md max-h-[85vh] sm:max-h-[80vh] rounded-t-2xl sm:rounded-2xl border border-black/15 dark:border-white/15 border-b-0 sm:border-b bg-bg shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10 shrink-0">
          <h2
            id="post-comments-drawer-title"
            className="text-lg font-bold text-fg"
          >
            Commenti
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-fg-muted hover:text-fg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            aria-label="Chiudi"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-fg-muted text-center py-6">
              Nessun commento. Scrivi il primo!
            </p>
          ) : (
            <ul className="space-y-3 list-none p-0 m-0">
              {comments.map((c) => (
                <li key={c.id}>
                  <CommentItem comment={c} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {session && (
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-black/10 dark:border-white/10 shrink-0"
          >
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Aggiungi un commento..."
              className="min-h-[80px] w-full rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-black/20 px-4 py-3 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg resize-none text-sm"
              disabled={submitting}
              maxLength={2000}
              aria-label="Nuovo commento"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="mt-2 w-full py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? "Invio..." : "Invia"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
