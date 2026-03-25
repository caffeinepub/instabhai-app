import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Comment {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: bigint;
    postId: bigint;
}
export interface Post {
    id: bigint;
    media: ExternalBlob;
    author: Principal;
    timestamp: bigint;
    caption: string;
}
export interface Story {
    id: bigint;
    media: ExternalBlob;
    author: Principal;
    timestamp: bigint;
}
export interface Notification {
    id: bigint;
    notificationType: NotificationType;
    recipient: Principal;
    isRead: boolean;
    timestamp: bigint;
    relatedPostId?: bigint;
    relatedUser: Principal;
}
export interface Message {
    id: bigint;
    content: string;
    sender: Principal;
    timestamp: bigint;
    receiver: Principal;
}
export interface UserProfile {
    bio: string;
    principal: Principal;
    username: string;
    displayName: string;
    profilePicture?: ExternalBlob;
}
export enum NotificationType {
    postLike = "postLike",
    directMessage = "directMessage",
    newFollower = "newFollower",
    postComment = "postComment"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: bigint, content: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(media: ExternalBlob, caption: string): Promise<bigint>;
    createStory(media: ExternalBlob): Promise<bigint>;
    deleteComment(commentId: bigint): Promise<void>;
    followUser(userToFollow: Principal): Promise<void>;
    getActiveStories(): Promise<Array<Story>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(otherUser: Principal): Promise<Array<Message>>;
    getExplorePosts(): Promise<Array<Post>>;
    getFeed(): Promise<Array<Post>>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getFollowing(user: Principal): Promise<Array<Principal>>;
    getNotifications(): Promise<Array<Notification>>;
    getPost(postId: bigint): Promise<Post | null>;
    getPostComments(postId: bigint): Promise<Array<Comment>>;
    getPostLikes(postId: bigint): Promise<Array<Principal>>;
    getUserPosts(user: Principal): Promise<Array<Post>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    healthCheck(): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    markNotificationRead(notificationId: bigint): Promise<void>;
    markStoryViewed(storyId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(searchTerm: string): Promise<Array<UserProfile>>;
    sendMessage(receiver: Principal, content: string): Promise<bigint>;
    unfollowUser(userToUnfollow: Principal): Promise<void>;
    unlikePost(postId: bigint): Promise<void>;
}
