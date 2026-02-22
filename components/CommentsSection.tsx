"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { IconChat } from "@/components/ui/Icons";

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
  /** When "embedded", no card wrapper; uses border-t and same visual context as parent (e.g. inside event detail box) */
  variant?: "default" | "embedded";
}

const REACTION_TYPES = {
  THUMBS_UP: { emoji: "👍", label: "Mi piace" },
  FIRE: { emoji: "🔥", label: "Fuoco" },
  HEART: { emoji: "❤️", label: "Cuore" },
} as const;

export default function CommentsSection({ eventId, variant = "default" }: CommentsSectionProps) {
  const isEmbedded = variant === "embedded";
  const wrapperClass = isEmbedded
    ? "pt-4 mt-4 border-t border-white/10 comments-embedded"
    : "card-raised p-5 md:p-6 transition-all duration-200";
  const loadingWrapperClass = isEmbedded
    ? "pt-4 mt-4 border-t border-white/10 comments-embedded"
    : "card-raised p-5 md:p-6";
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sortedByNewest = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const lastThreeComments = sortedByNewest.slice(0, 3);
  const displayedComments = isEmbedded && !expandedComments ? lastThreeComments : sortedByNewest;
  const hasMoreComments = isEmbedded && comments.length > 3 && !expandedComments;

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
        <div className={isReply ? "ml-4 md:ml-6 mt-3 pl-3 border-l-2 border-primary/30" : ""}>
        <div className="box-raised p-4 transition-all duration-200 hover-lift">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-surface/60 border border-border dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-transparent dark:ring-white/5">
              {comment.user.image ? (
                <img src={comment.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-ds-caption font-semibold text-fg-muted">{(comment.user.name || comment.user.id[0]).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-ds-body-sm font-semibold text-fg">{comment.user.name || "Utente"}</span>
                <span className="text-ds-caption text-fg-muted">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-ds-body-sm text-fg-muted whitespace-pre-wrap break-words leading-relaxed">{comment.content}</p>
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
                  className={`flex items-center gap-1 min-h-[36px] px-2.5 py-1.5 rounded-xl text-ds-body-sm font-medium transition-all duration-200 ${
                    isActive ? "chip-selected" : "bg-white/5 text-fg-muted hover:bg-white/10 border border-white/10 hover:text-fg"
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
                className="min-h-[36px] px-2.5 py-1.5 text-ds-body-sm font-medium text-fg-muted hover:text-fg rounded-xl hover:bg-surface/50 transition-colors"
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
                className="w-full min-h-[80px] px-4 py-3 border border-border dark:border-white/10 rounded-2xl bg-white/5 input-focus resize-none text-ds-body text-fg placeholder:text-fg-muted transition-all duration-200 focus:ring-2 focus:ring-primary focus:border-primary"
                rows={2}
                maxLength={2000}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim() || submitting}
                  className="min-h-[44px] px-4 py-2 bg-primary text-white rounded-2xl font-semibold text-ds-body-sm hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-card"
                >
                  {submitting ? "..." : "Rispondi"}
                </button>
                <button
                  onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                  className="min-h-[44px] px-4 py-2 text-fg-muted font-medium text-ds-body-sm rounded-2xl hover:bg-surface/50 transition-colors"
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
      <div className={loadingWrapperClass}>
        <div className="flex items-center gap-2 mb-4">
          <IconChat className="w-5 h-5 text-primary" aria-hidden />
          <h2 className="text-ds-h2 font-bold text-fg">Commenti</h2>
        </div>
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-ds-body-sm text-fg-muted">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <IconChat className="w-5 h-5 text-primary shrink-0" aria-hidden />
          <span className="text-ds-body font-semibold text-fg">
            {comments.length} {comments.length === 1 ? "commento" : "commenti"}
          </span>
        </div>
      </div>

      {(session && (!isEmbedded || expandedComments)) ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-surface/60 border border-border dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-transparent dark:ring-white/5">
              {session.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-ds-caption font-semibold text-fg-muted">
                  {(session.user?.name || session.user?.email?.[0] || "U").toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Scrivi un commento..."
                className="w-full min-h-[100px] px-4 py-3 border border-border dark:border-white/10 rounded-2xl bg-white/5 text-ds-body text-fg placeholder:text-fg-muted input-focus focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-all duration-200"
                rows={3}
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-2 gap-2">
                <span className="text-ds-caption text-fg-muted">{newComment.length}/2000</span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="min-h-[44px] px-5 py-2 bg-primary text-white rounded-2xl font-semibold text-ds-body-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-card"
                >
                  {submitting ? "..." : "Commenta"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (!isEmbedded || expandedComments) ? (
        <div className="mb-6 p-4 bg-warning-bg/90 border border-warning/30 rounded-2xl text-ds-body-sm text-warning dark:bg-warning-bg/50 dark:text-warning">
          <Link href="/auth/login" className="font-semibold underline">Accedi</Link> per commentare
        </div>
      ) : null}

      {comments.length === 0 ? (
        <div className="text-center py-8 rounded-2xl border border-dashed border-white/10 bg-white/5">
          <p className="text-ds-body-sm text-fg-muted font-medium">Nessun commento.</p>
          <button
            type="button"
            onClick={() => setExpandedComments(true)}
            className="mt-3 min-h-[44px] px-5 py-2 bg-primary text-white rounded-2xl font-semibold text-ds-body-sm hover:bg-primary-hover transition-colors"
          >
            Dimostra di sapere il perchè!
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {displayedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
          {hasMoreComments && (
            <button
              type="button"
              onClick={() => setExpandedComments(true)}
              className="mt-4 w-full min-h-[48px] py-3 rounded-xl font-semibold text-ds-body-sm text-white bg-primary hover:bg-primary-hover transition-colors border border-white/20"
            >
              Dimostra di sapere il perchè!
            </button>
          )}
        </>
      )}
    </div>
  );
}
