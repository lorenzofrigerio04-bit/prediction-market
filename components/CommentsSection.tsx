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
      <div className={`${isReply ? "ml-8 mt-3" : ""}`}>
        <div className="bg-gray-50 rounded-lg p-4">
          {/* Comment Header */}
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
              {comment.user.image ? (
                <img
                  src={comment.user.image}
                  alt={comment.user.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-gray-600">
                  {(comment.user.name || comment.user.id[0]).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">
                  {comment.user.name || "Utente"}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          </div>

          {/* Reactions and Reply Button */}
          <div className="flex items-center gap-4 mt-3">
            {/* Reaction Buttons */}
            {Object.entries(REACTION_TYPES).map(([type, { emoji, label }]) => {
              const count = getReactionCount(comment, type);
              const isActive =
                userReaction?.type === type;
              return (
                <button
                  key={type}
                  onClick={() =>
                    handleToggleReaction(
                      comment.id,
                      type as "THUMBS_UP" | "FIRE" | "HEART"
                    )
                  }
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={label}
                >
                  <span>{emoji}</span>
                  {count > 0 && <span>{count}</span>}
                </button>
              );
            })}

            {/* Reply Button */}
            {session && !isReply && (
              <button
                onClick={() => {
                  setReplyingTo(isReplying ? null : comment.id);
                  setReplyContent("");
                }}
                className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Rispondi
              </button>
            )}
          </div>

          {/* Reply Input */}
          {isReplying && session && (
            <div className="mt-3 ml-11">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Scrivi una risposta..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                maxLength={2000}
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim() || submitting}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  {submitting ? "Invio..." : "Rispondi"}
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                  className="px-4 py-1.5 text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
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
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Commenti</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Caricamento commenti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Commenti ({comments.length})
      </h2>

      {/* New Comment Form */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {(session.user?.name || session.user?.email?.[0] || "U").toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Scrivi un commento..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                maxLength={2000}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/2000 caratteri
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Invio..." : "Commenta"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <Link href="/auth/login" className="font-medium underline">
              Accedi
            </Link>{" "}
            per commentare
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nessun commento ancora. Sii il primo a commentare!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
