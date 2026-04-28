"use client";

import { useEffect } from "react";

export function NewsArticleViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    fetch(`/api/news/${articleId}/view`, { method: "POST" }).catch(() => {});
  }, [articleId]);
  return null;
}
