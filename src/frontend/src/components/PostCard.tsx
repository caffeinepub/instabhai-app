import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle } from "lucide-react";
import type { Post } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetPostComments,
  useGetPostLikes,
  useGetUserProfile,
  useLikePost,
  useUnlikePost,
} from "../hooks/useQueries";

interface PostCardProps {
  post: Post;
  layout?: "feed" | "grid";
}

export default function PostCard({ post, layout = "feed" }: PostCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: authorProfile } = useGetUserProfile(post.author);
  const { data: likes = [] } = useGetPostLikes(post.id);
  const { data: comments = [] } = useGetPostComments(post.id);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const isLiked = identity
    ? likes.some((p) => p.toString() === identity.getPrincipal().toString())
    : false;
  const likeCount = likes.length;
  const commentCount = comments.length;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!identity) return;

    try {
      if (isLiked) {
        await unlikePost.mutateAsync(post.id);
      } else {
        await likePost.mutateAsync(post.id);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handlePostClick = () => {
    navigate({ to: "/post/$postId", params: { postId: post.id.toString() } });
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: "/profile/$principal",
      params: { principal: post.author.toString() },
    });
  };

  const timestamp = new Date(Number(post.timestamp) / 1_000_000);

  if (layout === "grid") {
    return (
      <button
        type="button"
        onClick={handlePostClick}
        className="relative aspect-square group overflow-hidden rounded-lg w-full"
      >
        {post.media.getDirectURL().match(/\.(mp4|webm|ogg)$/i) ? (
          // biome-ignore lint/a11y/useMediaCaption: grid thumbnail preview
          <video
            src={post.media.getDirectURL()}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={post.media.getDirectURL()}
            alt={post.caption}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 fill-white" />
            <span className="font-bold">{likeCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 fill-white" />
            <span className="font-bold">{commentCount}</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <Card className="overflow-hidden border-2 hover:border-primary/30 transition-all">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <Avatar
            className="w-10 h-10 cursor-pointer"
            onClick={handleProfileClick}
          >
            <AvatarImage src={authorProfile?.profilePicture?.getDirectURL()} />
            <AvatarFallback>
              {authorProfile?.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <button
              type="button"
              className="font-semibold hover:underline"
              onClick={handleProfileClick}
            >
              {authorProfile?.username || "Unknown"}
            </button>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Media */}
        <button type="button" className="w-full" onClick={handlePostClick}>
          {post.media.getDirectURL().match(/\.(mp4|webm|ogg)$/i) ? (
            // biome-ignore lint/a11y/useMediaCaption: feed media preview
            <video
              src={post.media.getDirectURL()}
              controls
              className="w-full max-h-[600px] object-contain bg-black"
            />
          ) : (
            <img
              src={post.media.getDirectURL()}
              alt={post.caption}
              className="w-full max-h-[600px] object-contain bg-black"
            />
          )}
        </button>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={isLiked ? "text-red-500 hover:text-red-600" : ""}
            >
              <Heart className={`w-6 h-6 ${isLiked ? "fill-red-500" : ""}`} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handlePostClick}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </div>

          {likeCount > 0 && (
            <p className="font-semibold text-sm">
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </p>
          )}

          {post.caption && (
            <p className="text-sm">
              <button
                type="button"
                className="font-semibold hover:underline"
                onClick={handleProfileClick}
              >
                {authorProfile?.username}
              </button>{" "}
              {post.caption}
            </p>
          )}

          {commentCount > 0 && (
            <button
              type="button"
              onClick={handlePostClick}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View all {commentCount} comments
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
