import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Film,
  Heart,
  Loader2,
  MessageCircle,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type Post } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreatePost,
  useGetExplorePosts,
  useGetPostComments,
  useGetPostLikes,
  useGetUserProfile,
  useLikePost,
  useUnlikePost,
} from "../hooks/useQueries";

function ReelItem({ post, isActive }: { post: Post; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideo, setIsVideo] = useState(true);
  const { identity } = useInternetIdentity();
  const { data: authorProfile } = useGetUserProfile(post.author);
  const { data: likes = [] } = useGetPostLikes(post.id);
  const { data: comments = [] } = useGetPostComments(post.id);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const navigate = useNavigate();

  const isLiked = identity
    ? likes.some((p) => p.toString() === identity.getPrincipal().toString())
    : false;

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!identity) {
      toast.error("Please login to like");
      return;
    }
    try {
      if (isLiked) await unlikePost.mutateAsync(post.id);
      else await likePost.mutateAsync(post.id);
    } catch {}
  };

  const mediaUrl = post.media.getDirectURL();

  return (
    <div className="relative w-full h-screen flex-shrink-0 bg-black overflow-hidden">
      {isVideo ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
          onError={() => setIsVideo(false)}
        />
      ) : (
        <img
          src={mediaUrl}
          alt={post.caption || "Reel"}
          className="w-full h-full object-contain"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Right side actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
          data-ocid="reels.like.button"
        >
          <div
            className={`p-3 rounded-full ${isLiked ? "bg-red-500/20" : "bg-white/10"} backdrop-blur-sm`}
          >
            <Heart
              className={`w-7 h-7 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </div>
          <span className="text-white text-xs font-semibold">
            {likes.length}
          </span>
        </motion.button>

        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/post/$postId",
              params: { postId: post.id.toString() },
            })
          }
          className="flex flex-col items-center gap-1"
          data-ocid="reels.comment.button"
        >
          <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold">
            {comments.length}
          </span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-4 right-20">
        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/profile/$principal",
              params: { principal: post.author.toString() },
            })
          }
          className="flex items-center gap-2 mb-2"
          data-ocid="reels.profile.link"
        >
          <Avatar className="w-9 h-9 border-2 border-white">
            <AvatarImage src={authorProfile?.profilePicture?.getDirectURL()} />
            <AvatarFallback className="text-xs">
              {authorProfile?.username?.slice(0, 2).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-white font-bold text-sm drop-shadow">
            {authorProfile?.username || "Unknown"}
          </span>
        </button>
        {post.caption && (
          <p className="text-white text-sm leading-snug line-clamp-2 drop-shadow">
            {post.caption}
          </p>
        )}
      </div>
    </div>
  );
}

function CreateReelModal({
  open,
  onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createPost = useCreatePost();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }
    setMediaFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) {
      toast.error("Please select a video");
      return;
    }
    try {
      const bytes = new Uint8Array(await mediaFile.arrayBuffer());
      const blob =
        ExternalBlob.fromBytes(bytes).withUploadProgress(setUploadProgress);
      await createPost.mutateAsync({ media: blob, caption: caption.trim() });
      toast.success("Reel posted!");
      setCaption("");
      setMediaFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to post reel");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-5 h-5" /> Create Reel
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Video</Label>
            {previewUrl ? (
              <div className="relative">
                {/* biome-ignore lint/a11y/useMediaCaption: User-uploaded preview */}
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded-lg max-h-72"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setMediaFile(null);
                    setPreviewUrl(null);
                  }}
                  data-ocid="reels.remove_video.button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Label
                htmlFor="reelFile"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50"
                data-ocid="reels.dropzone"
              >
                <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload video
                </span>
                <input
                  id="reelFile"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reelCaption">Caption</Label>
            <Textarea
              id="reelCaption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={2}
              data-ocid="reels.textarea"
            />
          </div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <Label>Uploading... {uploadProgress}%</Label>
              <Progress value={uploadProgress} />
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary via-chart-1 to-chart-5"
            disabled={!mediaFile || createPost.isPending}
            data-ocid="reels.submit_button"
          >
            {createPost.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Reel"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ReelsPage() {
  const { data: posts = [], isLoading } = useGetExplorePosts();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { identity } = useInternetIdentity();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (let i = 0; i < itemRefs.current.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        { threshold: 0.6 },
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => {
      for (const o of observers) o.disconnect();
    };
  }, []);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-black"
        data-ocid="reels.loading_state"
      >
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-black gap-6"
        data-ocid="reels.empty_state"
      >
        <Film className="w-16 h-16 text-white/30" />
        <p className="text-white/60 text-lg">No reels yet</p>
        {identity && (
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-white text-black hover:bg-white/90"
            data-ocid="reels.create.primary_button"
          >
            <Plus className="w-4 h-4 mr-2" /> Create First Reel
          </Button>
        )}
        <CreateReelModal open={showCreate} onOpenChange={setShowCreate} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {posts.map((post, i) => (
          <div
            key={post.id.toString()}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="snap-start"
            data-ocid={`reels.item.${i + 1}`}
          >
            <ReelItem post={post} isActive={activeIndex === i} />
          </div>
        ))}
      </div>

      {identity && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-20 right-4 z-50"
        >
          <Button
            onClick={() => setShowCreate(true)}
            size="icon"
            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-chart-5 shadow-xl"
            data-ocid="reels.create.primary_button"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      <CreateReelModal open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
