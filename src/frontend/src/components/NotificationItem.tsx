import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Heart, Mail, MessageCircle, UserPlus } from "lucide-react";
import { useEffect } from "react";
import type { Notification } from "../backend";
import {
  useGetPost,
  useGetUserProfile,
  useMarkNotificationRead,
} from "../hooks/useQueries";

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const { data: relatedUserProfile } = useGetUserProfile(
    notification.relatedUser,
  );
  const { data: relatedPost } = useGetPost(
    notification.relatedPostId || BigInt(0),
  );
  const markRead = useMarkNotificationRead();

  // biome-ignore lint/correctness/useExhaustiveDependencies: markRead.mutate is stable enough
  useEffect(() => {
    if (!notification.isRead) {
      markRead.mutate(notification.id);
    }
  }, [notification.id, notification.isRead]);

  const timestamp = new Date(Number(notification.timestamp) / 1_000_000);

  const getIcon = () => {
    switch (notification.notificationType) {
      case "newFollower":
        return <UserPlus className="w-5 h-5 text-primary" />;
      case "postLike":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "postComment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "directMessage":
        return <Mail className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getText = () => {
    const username = relatedUserProfile?.username || "Someone";
    switch (notification.notificationType) {
      case "newFollower":
        return `${username} started following you`;
      case "postLike":
        return `${username} liked your post`;
      case "postComment":
        return `${username} commented on your post`;
      case "directMessage":
        return `${username} sent you a message`;
      default:
        return "New notification";
    }
  };

  const handleClick = () => {
    switch (notification.notificationType) {
      case "newFollower":
        navigate({
          to: "/profile/$principal",
          params: { principal: notification.relatedUser.toString() },
        });
        break;
      case "postLike":
      case "postComment":
        if (notification.relatedPostId) {
          navigate({
            to: "/post/$postId",
            params: { postId: notification.relatedPostId.toString() },
          });
        }
        break;
      case "directMessage":
        navigate({
          to: "/messages/$principal",
          params: { principal: notification.relatedUser.toString() },
        });
        break;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors text-left ${
        notification.isRead
          ? "hover:bg-accent/50"
          : "bg-accent hover:bg-accent/80"
      }`}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <Avatar className="w-12 h-12">
        <AvatarImage src={relatedUserProfile?.profilePicture?.getDirectURL()} />
        <AvatarFallback>
          {relatedUserProfile?.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm">{getText()}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </p>
      </div>
      {relatedPost &&
        (notification.notificationType === "postLike" ||
          notification.notificationType === "postComment") && (
          <img
            src={relatedPost.media.getDirectURL()}
            alt="Post"
            className="w-12 h-12 rounded object-cover"
          />
        )}
    </button>
  );
}
