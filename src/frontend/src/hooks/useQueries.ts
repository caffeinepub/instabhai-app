import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Comment,
  Message,
  Notification,
  Post,
  Story,
  UserProfile,
} from "../backend";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

/**
 * Hook to check backend health status
 */
export function useHealthCheck() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["healthCheck"],
    queryFn: async () => {
      if (!actor) return "Disconnected";
      return actor.healthCheck();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

// Profile Management
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(principal: Principal | string) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const p =
        typeof principal === "string"
          ? Principal.fromText(principal)
          : principal;
      return actor.getUserProfile(p);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// Follow/Unfollow
export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToFollow: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.followUser(userToFollow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToUnfollow: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unfollowUser(userToUnfollow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useGetFollowers(user: Principal | string) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["followers", user.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const p = typeof user === "string" ? Principal.fromText(user) : user;
      return actor.getFollowers(p);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetFollowing(user: Principal | string) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["following", user.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const p = typeof user === "string" ? Principal.fromText(user) : user;
      return actor.getFollowing(p);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

// Post Management
export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      media,
      caption,
    }: { media: ExternalBlob; caption: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createPost(media, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["explorePosts"] });
    },
  });
}

export function useGetPost(postId: bigint | string) {
  const { actor, isFetching } = useActor();

  return useQuery<Post | null>({
    queryKey: ["post", postId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const id = typeof postId === "string" ? BigInt(postId) : postId;
      return actor.getPost(id);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useGetUserPosts(user: Principal | string) {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ["userPosts", user.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const p = typeof user === "string" ? Principal.fromText(user) : user;
      return actor.getUserPosts(p);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetFeed() {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ["feed"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getFeed();
    },
    enabled: !!actor && !isFetching,
    refetchOnWindowFocus: true,
  });
}

// Like Management
export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postLikes"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unlikePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postLikes"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
}

export function useGetPostLikes(postId: bigint | string) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["postLikes", postId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const id = typeof postId === "string" ? BigInt(postId) : postId;
      return actor.getPostLikes(id);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

// Comment Management
export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: { postId: bigint; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addComment(postId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postComments"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postComments"] });
    },
  });
}

export function useGetPostComments(postId: bigint | string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ["postComments", postId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const id = typeof postId === "string" ? BigInt(postId) : postId;
      return actor.getPostComments(id);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

// Story Management
export function useCreateStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (media: ExternalBlob) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createStory(media);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeStories"] });
    },
  });
}

export function useGetActiveStories() {
  const { actor, isFetching } = useActor();

  return useQuery<Story[]>({
    queryKey: ["activeStories"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getActiveStories();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

export function useMarkStoryViewed() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markStoryViewed(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeStories"] });
    },
  });
}

// Direct Messaging
export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      receiver,
      content,
    }: { receiver: Principal; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.sendMessage(receiver, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    },
  });
}

export function useGetConversation(otherUser: Principal | string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ["conversation", otherUser?.toString()],
    queryFn: async () => {
      if (!actor || !otherUser) throw new Error("Actor or user not available");
      const p =
        typeof otherUser === "string"
          ? Principal.fromText(otherUser)
          : otherUser;
      return actor.getConversation(p);
    },
    enabled: !!actor && !isFetching && !!otherUser,
    refetchInterval: 5000,
  });
}

// Search and Explore
export function useSearchUsers(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ["searchUsers", searchTerm],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.searchUsers(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function useGetExplorePosts() {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ["explorePosts"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getExplorePosts();
    },
    enabled: !!actor && !isFetching,
  });
}

// Notifications
export function useGetNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markNotificationRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
