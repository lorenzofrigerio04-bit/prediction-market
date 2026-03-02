/** Input evento per la logica post-type (Step 5). Re-export da lib/feed/post-type. */
export type { PostTypeEventInput } from "@/lib/feed/post-type";

/** Post restituito da GET /api/feed/posts */
export interface FeedPost {
  id: string;
  type: string;
  content: string | null;
  aiImageUrl: string | null;
  createdAt?: string;
  user: { id: string; name: string | null; image: string | null };
  event: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    closesAt: string;
    probability: number | null;
    resolved: boolean | null;
    outcome: boolean | null;
    totalCredits: number | null;
    predictionsCount?: number;
  };
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser?: boolean;
}
