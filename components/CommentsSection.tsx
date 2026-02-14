"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface CommentReaction {
  id: string;
  type: "THUMBS_UP" | "FIRE" | "HEART";
  user: {
    id: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  parentId: string | null;
  replies: Comment[];
  reactions: CommentReaction[];
  _count: {
    reactions: number;
    replies: number;
  };
}

interface CommentsSectionProps {
  eventId: string;
}

const REACTION_TYPES = {
  THUMBS_UP: { emoji: "👍", label: "Mi piace" },
  FIRE: { emoji: "🔥", label: "Fuoco" },
  HEART: { emoji: "❤️", label: "Cuore" },
} as const;

export default function CommentsSection({ eventId }: CommentsSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?eventId=${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          content: newComment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore nell'invio del commento");
      }

      setNewComment("");
      fetchComments();
    } catch (error: any) {
      console.error("Error submitting comment:", error);
      alert(error.message || "Errore nell'invio del commento");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!session || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          content: replyContent,
          parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore nell'invio della risposta");
      }

      setReplyContent("");
      setReplyingTo(null);
      fetchComments();
    } catch (error: any) {
      console.error("Error submitting reply:", error);
      alert(error.message || "Errore nell'invio della risposta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleReaction = async (
    commentId: string,
    type: "THUMBS_UP" | "FIRE" | "HEART"
  ) => {
    if (!session) {
      alert("Devi essere autenticato per reagire");
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Errore nella reazione");
      }

      fetchComments();
    } catch (error: any) {
      console.error("Error toggling reaction:", error);
      alert(error.message || "Errore nella reazione");
    }
  };

  const formatDate = (dateString: string) => {
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
  };

  const getUserReaction = (comment: Comment) => {
    if (!session) return null;
    return comment.reactions.find((r) => r.user.id === session.user?.id);
  };

  const getReactionCount = (comment: Comment, type: string) => {
    return comment.reactions.filter((r) => r.type === type).length;
  };

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: Comment;
    isReply?: boolean;
  }) => {
    const userReaction = getUserReaction(comment);
    const isReplying = replyingTo === comment.id;

    return (
      <div className={isReply ? "ml-4 md:ml-8 mt-3" : ""}>
        <div className="glass rounded-2xl p-4 border border-border dark:border-white/10">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-surface/50 border border-border dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {comment.user.image ? (
                <img src={comment.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-fg-muted">{(comment.user.name || comment.user.id[0]).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="font-semibold text-fg">{comment.user.name || "Utente"}</span>
                <span className="text-xs text-fg-muted">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-fg-muted text-sm whitespace-pre-wrap break-words">{comment.content}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {Object.entries(REACTION_TYPES).map(([type, { emoji, label }]) => {
              const count = getReactionCount(comment, type);
              const isActive = userReaction?.type === type;
              return (
                <button
                  key={type}
                  onClick={() => handleToggleReaction(comment.id, type as "THUMBS_UP" | "FIRE" | "HEART")}
                  className={`flex items-center gap-1 min-h-[36px] px-2.5 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? "bg-primary/20 text-primary" : "bg-surface/50 text-fg-muted hover:bg-surface/70 border border-border dark:border-white/10"
                  }`}
                  title={label}
                >
                  <span>{emoji}</span>
                  {count > 0 && <span>{count}</span>}
                </button>
              );
            })}
            {session && !isReply && (
              <button
                onClick={() => {
                  setReplyingTo(isReplying ? null : comment.id);
                  setReplyContent("");
                }}
                className="min-h-[36px] px-2.5 py-1.5 text-sm font-medium text-fg-muted hover:text-fg rounded-xl hover:bg-surface/50 transition-colors"
              >
                Rispondi
              </button>
            )}
          </div>

          {isReplying && session && (
            <div className="mt-3 ml-0">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Risposta..."
                className="w-full min-h-[80px] px-4 py-3 border border-border dark:border-white/10 rounded-2xl bg-surface/50 focus:ring-2 focus:ring-primary focus:border-primary resize-none text-base text-fg placeholder:text-fg-muted"
                rows={2}
                maxLength={2000}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim() || submitting}
                  className="min-h-[44px] px-4 py-2 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary-hover disabled:opacity-50"
                >
                  {submitting ? "..." : "Rispondi"}
                </button>
                <button
                  onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                  className="min-h-[44px] px-4 py-2 text-fg-muted font-medium text-sm rounded-2xl hover:bg-surface/50"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl border border-border dark:border-white/10 p-5 md:p-6">
        <h2 className="text-lg font-bold text-fg mb-4">Commenti</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="mt-2 text-fg-muted text-sm">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl border border-border dark:border-white/10 p-5 md:p-6">
      <h2 className="text-lg font-bold text-fg mb-4">
        Commenti ({comments.length})
      </h2>

      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-surface/50 border border-border dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {session.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-fg-muted">
                  {(session.user?.name || session.user?.email?.[0] || "U").toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Scrivi un commento..."
                className="w-full min-h-[100px] px-4 py-3 border border-border dark:border-white/10 rounded-2xl bg-surface/50 text-fg placeholder:text-fg-muted focus:ring-2 focus:ring-primary focus:border-primary resize-none text-base"
                rows={3}
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-2 gap-2">
                <span className="text-xs text-fg-muted">{newComment.length}/2000</span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="min-h-[44px] px-5 py-2 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "..." : "Commenta"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-sm text-amber-700 dark:text-amber-400">
          <Link href="/auth/login" className="font-semibold underline">Accedi</Link> per commentare
        </div>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-8 text-fg-muted text-sm">
          Nessun commento. Inizia tu la discussione.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
