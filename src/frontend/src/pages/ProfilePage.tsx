import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Principal } from "@icp-sdk/core/principal";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Loader2, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import EditProfileModal from "../components/EditProfileModal";
import FollowListModal from "../components/FollowListModal";
import PostCard from "../components/PostCard";
import ProfileSetupModal from "../components/ProfileSetupModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollowUser,
  useGetCallerUserProfile,
  useGetFollowers,
  useGetFollowing,
  useGetUserPosts,
  useGetUserProfile,
  useUnfollowUser,
} from "../hooks/useQueries";

export default function ProfilePage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: currentUserProfile,
    isLoading: currentProfileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  // Determine which profile to show
  const principalParam = (params as any)?.principal;
  const isOwnProfile =
    !principalParam ||
    (identity && principalParam === identity.getPrincipal().toString());
  const targetPrincipal = isOwnProfile
    ? identity?.getPrincipal()
    : principalParam
      ? Principal.fromText(principalParam)
      : null;

  const { data: viewedProfile, isLoading: viewedProfileLoading } =
    useGetUserProfile(targetPrincipal || "");
  const { data: posts = [], isLoading: postsLoading } = useGetUserPosts(
    targetPrincipal || "",
  );
  const { data: followers = [] } = useGetFollowers(targetPrincipal || "");
  const { data: following = [] } = useGetFollowing(targetPrincipal || "");
  const { data: currentUserFollowing = [] } = useGetFollowing(
    identity?.getPrincipal() || "",
  );
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const profile = isOwnProfile ? currentUserProfile : viewedProfile;
  const isLoading = isOwnProfile ? currentProfileLoading : viewedProfileLoading;

  const isFollowing = targetPrincipal
    ? currentUserFollowing.some(
        (p) => p.toString() === targetPrincipal.toString(),
      )
    : false;

  const showProfileSetup = Boolean(
    isAuthenticated &&
      isOwnProfile &&
      !currentProfileLoading &&
      isFetched &&
      currentUserProfile === null,
  );

  const handleFollow = async () => {
    if (!targetPrincipal) return;
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(targetPrincipal);
      } else {
        await followUser.mutateAsync(targetPrincipal);
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 mx-auto md:mx-0">
            <AvatarImage src={profile.profilePicture?.getDirectURL()} />
            <AvatarFallback className="text-4xl">
              {profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  onClick={() => setShowEditProfile(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                  disabled={followUser.isPending || unfollowUser.isPending}
                  className={
                    !isFollowing
                      ? "bg-gradient-to-r from-primary via-chart-1 to-chart-5"
                      : ""
                  }
                >
                  {followUser.isPending || unfollowUser.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    "Unfollow"
                  ) : (
                    "Follow"
                  )}
                </Button>
              )}
            </div>

            <div className="flex gap-8 justify-center md:justify-start">
              <div className="text-center">
                <p className="font-bold text-xl">{posts.length}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFollowers(true)}
                className="text-center hover:opacity-70"
              >
                <p className="font-bold text-xl">{followers.length}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </button>
              <button
                type="button"
                onClick={() => setShowFollowing(true)}
                className="text-center hover:opacity-70"
              >
                <p className="font-bold text-xl">{following.length}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </button>
            </div>

            <div>
              <p className="font-semibold">{profile.displayName}</p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Posts</h2>
          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {posts.map((post) => (
                <PostCard key={post.id.toString()} post={post} layout="grid" />
              ))}
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && currentUserProfile && (
        <EditProfileModal
          open={showEditProfile}
          onOpenChange={setShowEditProfile}
          currentProfile={currentUserProfile}
        />
      )}

      <FollowListModal
        open={showFollowers}
        onOpenChange={setShowFollowers}
        users={followers}
        title="Followers"
      />

      <FollowListModal
        open={showFollowing}
        onOpenChange={setShowFollowing}
        users={following}
        title="Following"
      />

      <ProfileSetupModal open={showProfileSetup} onOpenChange={() => {}} />
    </>
  );
}
