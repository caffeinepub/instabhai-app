import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollowUser,
  useGetFollowing,
  useGetUserProfile,
  useUnfollowUser,
} from "../hooks/useQueries";

interface FollowListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: Principal[];
  title: string;
}

export default function FollowListModal({
  open,
  onOpenChange,
  users,
  title,
}: FollowListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {users.map((user) => (
              <UserListItem
                key={user.toString()}
                userPrincipal={user}
                onClose={() => onOpenChange(false)}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function UserListItem({
  userPrincipal,
  onClose,
}: { userPrincipal: Principal; onClose: () => void }) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetUserProfile(userPrincipal);
  const { data: following = [] } = useGetFollowing(
    identity?.getPrincipal() || "",
  );
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isOwnProfile =
    identity?.getPrincipal().toString() === userPrincipal.toString();
  const isFollowing = following.some(
    (p) => p.toString() === userPrincipal.toString(),
  );

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(userPrincipal);
      } else {
        await followUser.mutateAsync(userPrincipal);
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleProfileClick = () => {
    navigate({
      to: "/profile/$principal",
      params: { principal: userPrincipal.toString() },
    });
    onClose();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar className="w-12 h-12 cursor-pointer" onClick={handleProfileClick}>
        <AvatarImage src={profile?.profilePicture?.getDirectURL()} />
        <AvatarFallback>
          {profile?.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <button
        type="button"
        className="flex-1 text-left"
        onClick={handleProfileClick}
      >
        <p className="font-semibold">{profile?.username || "Unknown"}</p>
        <p className="text-sm text-muted-foreground">{profile?.displayName}</p>
      </button>
      {!isOwnProfile && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
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
