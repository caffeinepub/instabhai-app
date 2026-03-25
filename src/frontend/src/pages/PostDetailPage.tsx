import { useNavigate, useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import CommentSection from "../components/CommentSection";
import PostCard from "../components/PostCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetPost } from "../hooks/useQueries";

export default function PostDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const { identity, isInitializing } = useInternetIdentity();
  const postId = (params as any)?.postId;
  const { data: post, isLoading } = useGetPost(
    postId ? BigInt(postId) : BigInt(0),
  );

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="space-y-6">
        <PostCard post={post} layout="feed" />
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
