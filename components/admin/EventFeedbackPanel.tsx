"use client";

import { useState, useEffect, useCallback } from "react";

interface FeedbackEntry {
  id: string;
  rating: string;
  reason: string | null;
  category: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

const CATEGORIES = [
  { value: "OVERALL", label: "Complessivo" },
  { value: "TITLE", label: "Titolo" },
  { value: "DESCRIPTION", label: "Descrizione" },
  { value: "MARKET_TYPE", label: "Tipo mercato" },
  { value: "RESOLUTION_CRITERIA", label: "Criteri risoluzione" },
  { value: "CREATIVITY", label: "Creatività" },
] as const;

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
);

export default function EventFeedbackPanel({
  eventId,
  onFeedbackSubmitted,
  defaultExpanded = false,
}: {
  eventId: string;
  onFeedbackSubmitted?: () => void;
  defaultExpanded?: boolean;
}) {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState<"POSITIVE" | "NEGATIVE" | null>(null);
  const [category, setCategory] = useState("OVERALL");
  const [reason, setReason] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(!defaultExpanded);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/feedback`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks ?? []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          category,
          reason: reason.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore");
      }
      setSuccessMsg("Feedback salvato");
      setRating(null);
      setReason("");
      setCategory("OVERALL");
      await fetchFeedbacks();
      if (onFeedbackSubmitted) {
        setTimeout(() => onFeedbackSubmitted(), 800);
      } else {
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Errore");
    } finally {
      setSubmitting(false);
    }
  };

  const positiveCount = feedbacks.filter((f) => f.rating === "POSITIVE").length;
  const negativeCount = feedbacks.filter((f) => f.rating === "NEGATIVE").length;
  const total = feedbacks.length;

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(80,245,252,0.04) 0%, rgba(56,228,238,0.02) 50%, rgba(10,42,106,0.06) 100%)",
        border: "1px solid rgba(80,245,252,0.12)",
      }}
    >
      {/* Subtle glow accent on top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(80,245,252,0.3) 50%, transparent 100%)" }}
      />

      {/* Collapse header */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="group w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(80,245,252,0.15) 0%, rgba(56,228,238,0.08) 100%)",
              border: "1px solid rgba(80,245,252,0.2)",
            }}
          >
            <svg className="w-4 h-4" style={{ color: "rgb(80,245,252)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-fg text-sm tracking-tight">AI Feedback</span>
            {total > 0 && (
              <div className="flex items-center gap-2 mt-0.5">
                {positiveCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "rgb(60,212,160)" }}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {positiveCount}
                  </span>
                )}
                {negativeCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: "rgb(248,113,113)" }}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {negativeCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-fg-muted transition-transform duration-200 group-hover:text-fg ${collapsed ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {!collapsed && (
        <div
          className="px-5 pb-5 space-y-5"
          style={{ borderTop: "1px solid rgba(80,245,252,0.08)" }}
        >
          {/* Rating buttons */}
          <div className="pt-5">
            <p className="text-xs font-medium text-fg-muted mb-3 uppercase tracking-widest">
              Valuta questo evento
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRating(rating === "POSITIVE" ? null : "POSITIVE")}
                className="group/btn relative flex flex-col items-center gap-2 px-4 py-4 rounded-xl transition-all duration-200"
                style={{
                  background: rating === "POSITIVE"
                    ? "linear-gradient(135deg, rgba(60,212,160,0.15) 0%, rgba(60,212,160,0.06) 100%)"
                    : "rgba(255,255,255,0.02)",
                  border: rating === "POSITIVE"
                    ? "1.5px solid rgba(60,212,160,0.5)"
                    : "1.5px solid rgba(255,255,255,0.08)",
                  boxShadow: rating === "POSITIVE"
                    ? "0 0 20px -4px rgba(60,212,160,0.2), inset 0 1px 0 rgba(60,212,160,0.1)"
                    : "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover/btn:scale-110"
                  style={{
                    background: rating === "POSITIVE"
                      ? "rgba(60,212,160,0.2)"
                      : "rgba(255,255,255,0.05)",
                    border: rating === "POSITIVE"
                      ? "1px solid rgba(60,212,160,0.3)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    style={{ color: rating === "POSITIVE" ? "rgb(60,212,160)" : "rgb(169,180,208)" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                  </svg>
                </div>
                <span
                  className="text-sm font-semibold tracking-tight"
                  style={{ color: rating === "POSITIVE" ? "rgb(60,212,160)" : "rgb(169,180,208)" }}
                >
                  Buono
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRating(rating === "NEGATIVE" ? null : "NEGATIVE")}
                className="group/btn relative flex flex-col items-center gap-2 px-4 py-4 rounded-xl transition-all duration-200"
                style={{
                  background: rating === "NEGATIVE"
                    ? "linear-gradient(135deg, rgba(248,113,113,0.15) 0%, rgba(248,113,113,0.06) 100%)"
                    : "rgba(255,255,255,0.02)",
                  border: rating === "NEGATIVE"
                    ? "1.5px solid rgba(248,113,113,0.5)"
                    : "1.5px solid rgba(255,255,255,0.08)",
                  boxShadow: rating === "NEGATIVE"
                    ? "0 0 20px -4px rgba(248,113,113,0.2), inset 0 1px 0 rgba(248,113,113,0.1)"
                    : "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover/btn:scale-110"
                  style={{
                    background: rating === "NEGATIVE"
                      ? "rgba(248,113,113,0.2)"
                      : "rgba(255,255,255,0.05)",
                    border: rating === "NEGATIVE"
                      ? "1px solid rgba(248,113,113,0.3)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    style={{ color: rating === "NEGATIVE" ? "rgb(248,113,113)" : "rgb(169,180,208)" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H8.904M14.25 9h-.75a.75.75 0 01-.75-.75v-.009c0-.467-.285-.884-.718-1.06a5.961 5.961 0 00-.507-.19l-.122-.037A4.462 4.462 0 009.36 6.5C8.3 6.5 7.23 6.9 6.633 7.852L5.904 9H5.25a.75.75 0 00-.75.75v.008c0 .467.285.884.718 1.06.204.083.41.152.618.207l.146.04a4.5 4.5 0 011.648.858c.393.342.847.529 1.298.479l.16-.018M14.25 9l-2.25 6" />
                  </svg>
                </div>
                <span
                  className="text-sm font-semibold tracking-tight"
                  style={{ color: rating === "NEGATIVE" ? "rgb(248,113,113)" : "rgb(169,180,208)" }}
                >
                  Da migliorare
                </span>
              </button>
            </div>
          </div>

          {/* Detail fields — animated entrance */}
          {rating && (
            <div className="space-y-4 animate-[fadeSlideIn_200ms_ease-out]">
              {/* Category chips */}
              <div>
                <p className="text-xs font-medium text-fg-muted mb-2.5 uppercase tracking-widest">
                  Aspetto
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                      style={{
                        background: category === c.value
                          ? "rgba(80,245,252,0.12)"
                          : "rgba(255,255,255,0.04)",
                        border: category === c.value
                          ? "1px solid rgba(80,245,252,0.35)"
                          : "1px solid rgba(255,255,255,0.08)",
                        color: category === c.value
                          ? "rgb(80,245,252)"
                          : "rgb(169,180,208)",
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason textarea */}
              <div>
                <p className="text-xs font-medium text-fg-muted mb-2 uppercase tracking-widest">
                  {rating === "NEGATIVE" ? "Cosa miglioreresti?" : "Note (opzionale)"}
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder={
                    rating === "NEGATIVE"
                      ? "Es: Titolo troppo generico, mercato banale, poco creativo..."
                      : "Es: Ottima creatività, titolo accattivante..."
                  }
                  className="w-full px-4 py-3 rounded-xl text-sm text-fg placeholder:text-fg-subtle resize-none focus:outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(80,245,252,0.35)";
                    e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.1), 0 0 0 3px rgba(80,245,252,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.1)";
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-xl font-semibold text-sm tracking-tight transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, rgba(80,245,252,0.9) 0%, rgba(56,228,238,0.85) 100%)",
                  color: "rgb(2,35,42)",
                  boxShadow: "0 0 24px -4px rgba(80,245,252,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                {submitting ? "Salvataggio..." : "Invia feedback"}
              </button>
            </div>
          )}

          {/* Status messages */}
          {successMsg && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(60,212,160,0.1)",
                border: "1px solid rgba(60,212,160,0.2)",
                color: "rgb(60,212,160)",
              }}
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.2)",
                color: "rgb(248,113,113)",
              }}
            >
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* Feedback history */}
          {loading ? (
            <div className="flex justify-center py-4">
              <div
                className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                style={{ borderColor: "rgba(80,245,252,0.5)", borderTopColor: "transparent" }}
              />
            </div>
          ) : feedbacks.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                <p className="text-[11px] font-medium text-fg-muted uppercase tracking-widest">
                  Storico
                </p>
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>
              {feedbacks.map((fb) => {
                const isPositive = fb.rating === "POSITIVE";
                const accent = isPositive ? "60,212,160" : "248,113,113";
                return (
                  <div
                    key={fb.id}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl transition-colors"
                    style={{
                      background: `rgba(${accent},0.04)`,
                      border: `1px solid rgba(${accent},0.1)`,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: `rgba(${accent},0.12)`,
                        border: `1px solid rgba(${accent},0.2)`,
                      }}
                    >
                      {isPositive ? (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: `rgb(${accent})` }}>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: `rgb(${accent})` }}>
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-fg-muted">
                        <span
                          className="font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            background: `rgba(${accent},0.1)`,
                            color: `rgb(${accent})`,
                          }}
                        >
                          {CATEGORY_LABEL[fb.category] ?? fb.category}
                        </span>
                        <span style={{ color: "rgba(169,180,208,0.5)" }}>
                          {new Date(fb.createdAt).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {fb.reason && (
                        <p className="text-sm text-fg/80 mt-1.5 leading-relaxed">{fb.reason}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
