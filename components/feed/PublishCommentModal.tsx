"use client";

import { useState, useEffect, useCallback } from "react";

export interface PublishCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void | Promise<void>;
  title?: string;
  submitLabel?: string;
  loading?: boolean;
}

export function PublishCommentModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Pubblica con commento",
  submitLabel = "Pubblica",
  loading = false,
}: PublishCommentModalProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    if (!isSubmitting && !loading) onClose();
  }, [isSubmitting, loading, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setContent("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      // Parent handles closing on success (e.g. after redirect)
    } catch {
      // Parent may throw on API error; keep modal open for retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  const busy = isSubmitting || loading;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-comment-modal-title"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-admin-bg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="publish-comment-modal-title"
            className="text-lg font-bold text-fg"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="text-2xl leading-none text-fg-muted hover:text-fg disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded"
            aria-label="Chiudi"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Aggiungi un commento (opzionale)"
            className="min-h-[100px] w-full rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-black/20 px-4 py-3 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg resize-none"
            disabled={busy}
            aria-label="Commento"
          />
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={busy}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-fg-muted hover:text-fg border border-black/15 dark:border-white/15 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50"
            >
              {busy ? "..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
