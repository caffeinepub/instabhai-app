import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import CreateStoryModal from "../components/CreateStoryModal";
import PostCard from "../components/PostCard";
import ProfileSetupModal from "../components/ProfileSetupModal";
import StoriesRow from "../components/StoriesRow";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetExplorePosts,
  useGetFeed,
} from "../hooks/useQueries";

export default function FeedPage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const { data: feed = [], isLoading: feedLoading } = useGetFeed();
  const { data: explorePosts = [], isLoading: exploreLoading } =
    useGetExplorePosts();
  const [showCreateStory, setShowCreateStory] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Use explore posts as fallback when feed is empty
  const displayPosts = feed.length > 0 ? feed : explorePosts;
  const isEmptyFeed =
    !feedLoading && !exploreLoading && displayPosts.length === 0;

  if (isInitializing || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Stories Row */}
        <div className="mb-6 -mx-4">
          <StoriesRow onCreateStory={() => setShowCreateStory(true)} />
        </div>

        {/* Feed label when showing explore posts */}
        {!feedLoading && feed.length === 0 && explorePosts.length > 0 && (
          <div className="mb-4 text-center">
            <p className="text-sm text-muted-foreground">
              Follow people to personalize your feed. Showing popular posts for
              now.
            </p>
          </div>
        )}

        {/* Feed */}
        {feedLoading || exploreLoading ? (
          <div
            className="flex items-center justify-center py-12"
            data-ocid="feed.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : isEmptyFeed ? (
          <div className="text-center py-12" data-ocid="feed.empty_state">
            <p className="text-muted-foreground text-lg mb-4">No posts yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to share something!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayPosts.map((post, i) => (
              <div key={post.id.toString()} data-ocid={`feed.item.${i + 1}`}>
                <PostCard post={post} layout="feed" />
              </div>
            ))}
          </div>
        )}
      </div>

      <ProfileSetupModal open={showProfileSetup} onOpenChange={() => {}} />
      <CreateStoryModal
        open={showCreateStory}
        onOpenChange={setShowCreateStory}
      />
    </>
  );
}
