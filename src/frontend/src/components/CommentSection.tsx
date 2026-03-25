import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddComment,
  useDeleteComment,
  useGetPostComments,
  useGetUserProfile,
} from "../hooks/useQueries";

interface CommentSectionProps {
  postId: bigint;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const { identity } = useInternetIdentity();
  const { data: comments = [], isLoading } = useGetPostComments(postId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await addComment.mutateAsync({ postId, content: content.trim() });
      setContent("");
      toast.success("Comment added");
    } catch (error: any) {
      console.error("Add comment error:", error);
      toast.error(error.message || "Failed to add comment");
    }
  };

  const handleDelete = async (commentId: bigint) => {
    try {
      await deleteComment.mutateAsync(commentId);
      toast.success("Comment deleted");
    } catch (error: any) {
      console.error("Delete comment error:", error);
      toast.error(error.message || "Failed to delete comment");
    }
  };

  const isCommentAuthor = (commentAuthor: any) => {
    if (!identity) return false;
    return commentAuthor.toString() === identity.getPrincipal().toString();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Comments</h3>

      <ScrollArea className="h-[400px] pr-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id.toString()}
                comment={comment}
                isAuthor={isCommentAuthor(comment.author)}
                onDelete={() => handleDelete(comment.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          disabled={addComment.isPending}
        />
        <Button
          type="submit"
          disabled={!content.trim() || addComment.isPending}
          className="bg-gradient-to-r from-primary via-chart-1 to-chart-5"
        >
          {addComment.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Post"
          )}
        </Button>
      </form>
    </div>
  );
}

function CommentItem({
  comment,
  isAuthor,
  onDelete,
}: {
  comment: any;
  isAuthor: boolean;
  onDelete: () => void;
}) {
  const { data: authorProfile } = useGetUserProfile(comment.author);
  const timestamp = new Date(Number(comment.timestamp) / 1_000_000);

  return (
    <div className="flex gap-3">
      <Avatar className="w-8 h-8">
        <AvatarImage src={authorProfile?.profilePicture?.getDirectURL()} />
        <AvatarFallback>
          {authorProfile?.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-accent/50 rounded-lg p-3">
          <p className="font-semibold text-sm">
            {authorProfile?.username || "Unknown"}
          </p>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 px-3">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </p>
          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-auto p-0 text-xs text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
