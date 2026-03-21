/** Tipi per il feed unificato homepage (Sistema + Lente) */

export interface SistemaEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  yesPct: number;
  predictionsCount?: number;
  aiImageUrl?: string | null;
}

export interface LentePost {
  id: string;
  content: string | null;
  aiImageUrl: string | null;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  event: {
    id: string;
    title: string;
    category: string;
    closesAt: string;
    probability: number | null;
    predictionsCount?: number;
  };
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser?: boolean;
}

export type UnifiedFeedItem =
  | { type: "sistema"; data: SistemaEvent }
  | { type: "lente"; data: LentePost };
