import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { UserProfile } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollowUser,
  useGetFollowing,
  useUnfollowUser,
} from "../hooks/useQueries";

interface UserSearchResultsProps {
  searchResults: UserProfile[];
  searchTerm: string;
}

export default function UserSearchResults({
  searchResults,
  searchTerm,
}: UserSearchResultsProps) {
  if (searchResults.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No users found for "{searchTerm}"
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Search Results</h2>
      <div className="space-y-4">
        {searchResults.map((user) => (
          <UserResultItem key={user.principal.toString()} user={user} />
        ))}
      </div>
    </div>
  );
}

function UserResultItem({ user }: { user: UserProfile }) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: following = [] } = useGetFollowing(
    identity?.getPrincipal() || "",
  );
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isOwnProfile =
    identity?.getPrincipal().toString() === user.principal.toString();
  const isFollowing = following.some(
    (p) => p.toString() === user.principal.toString(),
  );

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(user.principal);
      } else {
        await followUser.mutateAsync(user.principal);
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleProfileClick = () => {
    navigate({
      to: "/profile/$principal",
      params: { principal: user.principal.toString() },
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <Avatar className="w-16 h-16 cursor-pointer" onClick={handleProfileClick}>
        <AvatarImage src={user.profilePicture?.getDirectURL()} />
        <AvatarFallback className="text-xl">
          {user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <button
        type="button"
        className="flex-1 text-left"
        onClick={handleProfileClick}
      >
        <p className="font-bold text-lg">{user.username}</p>
        <p className="text-sm text-muted-foreground">{user.displayName}</p>
        {user.bio && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {user.bio}
          </p>
        )}
      </button>
      {!isOwnProfile && (
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
  );
}
