"use client";

import type { FeedPost } from "@/types/feed";
import { FeedCardSlide } from "./FeedCardSlide";
import { FeedCardAIImage } from "./FeedCardAIImage";

export interface FeedPostCardProps {
  post: FeedPost;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onRepost?: (eventId: string) => void;
  onFollow?: (eventId: string) => void;
  onShare?: (eventId: string) => void;
}

export function FeedPostCard({
  post,
  onLike,
  onComment,
  onRepost,
  onFollow,
  onShare,
}: FeedPostCardProps) {
  const event = post.event;
  if (!event) return null;

  const handleRepost = onRepost ? () => onRepost(event.id) : undefined;
  const handleLike = onLike ? () => onLike(post.id) : undefined;
  const handleComment = onComment ? () => onComment(post.id) : undefined;
  const handleFollow = onFollow ? () => onFollow(event.id) : undefined;
  const handleShare = onShare ? () => onShare(event.id) : undefined;

  if (post.type === "SLIDE") {
    return (
      <FeedCardSlide
        post={{
          id: post.id,
          user: post.user,
        }}
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          category: event.category,
          probability: event.probability,
          predictionsCount: event.predictionsCount,
        }}
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        isLiked={post.isLikedByCurrentUser}
        onLike={handleLike}
        onComment={handleComment}
        onRepost={handleRepost}
        onFollow={handleFollow}
        onShare={handleShare}
      />
    );
  }

  if (post.type === "AI_IMAGE") {
    return (
      <FeedCardAIImage
        post={{
          id: post.id,
          content: post.content,
          aiImageUrl: post.aiImageUrl,
          createdAt: post.createdAt,
          user: post.user,
        }}
        event={{
          id: event.id,
          title: event.title,
          category: event.category,
          probability: event.probability,
          predictionsCount: event.predictionsCount,
        }}
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        isLiked={post.isLikedByCurrentUser}
        onLike={handleLike}
        onComment={handleComment}
        onRepost={handleRepost}
        onFollow={handleFollow}
        onShare={handleShare}
      />
    );
  }

  return null;
}
