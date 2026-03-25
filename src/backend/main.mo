import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var lastPostId = 0;
  var lastCommentId = 0;
  var lastStoryId = 0;
  var lastMessageId = 0;
  var lastNotificationId = 0;

  // Types
  public type UserProfile = {
    principal : Principal;
    username : Text;
    displayName : Text;
    bio : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  public type Post = {
    id : Int;
    author : Principal;
    media : Storage.ExternalBlob;
    caption : Text;
    timestamp : Int;
  };

  public type Comment = {
    id : Int;
    postId : Int;
    author : Principal;
    content : Text;
    timestamp : Int;
  };

  public type Story = {
    id : Int;
    author : Principal;
    media : Storage.ExternalBlob;
    timestamp : Int;
  };

  public type Message = {
    id : Int;
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Int;
  };

  public type Notification = {
    id : Int;
    recipient : Principal;
    notificationType : NotificationType;
    relatedUser : Principal;
    relatedPostId : ?Int;
    timestamp : Int;
    isRead : Bool;
  };

  public type NotificationType = {
    #newFollower;
    #postLike;
    #postComment;
    #directMessage;
  };

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let following = Map.empty<Principal, [Principal]>();
  let followers = Map.empty<Principal, [Principal]>();
  let posts = Map.empty<Int, Post>();
  let postLikes = Map.empty<Int, [Principal]>();
  let comments = Map.empty<Int, Comment>();
  let postComments = Map.empty<Int, [Int]>();
  let stories = Map.empty<Int, Story>();
  let storyViews = Map.empty<Int, [Principal]>();
  let messages = Map.empty<Int, Message>();
  let userConversations = Map.empty<Principal, [Int]>();
  let notifications = Map.empty<Int, Notification>();
  let userNotifications = Map.empty<Principal, [Int]>();

  // Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Any authenticated user can view any profile (public profiles)
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Ensure the profile principal matches the caller
    if (profile.principal != caller) {
      Runtime.trap("Unauthorized: Cannot save profile for another user");
    };
    userProfiles.add(caller, profile);
  };

  // Follow/Unfollow
  public shared ({ caller }) func followUser(userToFollow : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    if (caller == userToFollow) {
      Runtime.trap("Cannot follow yourself");
    };

    // Check if target user exists
    switch (userProfiles.get(userToFollow)) {
      case (null) { Runtime.trap("User not found") };
      case (?_) {};
    };

    let currentFollowing = switch (following.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };

    // Check if already following
    if (currentFollowing.find<Principal>(func(p) { p == userToFollow }) != null) {
      Runtime.trap("Already following this user");
    };

    let newFollowing = currentFollowing.concat([userToFollow]);
    following.add(caller, newFollowing);

    let currentFollowers = switch (followers.get(userToFollow)) {
      case (null) { [] };
      case (?list) { list };
    };
    let newFollowers = currentFollowers.concat([caller]);
    followers.add(userToFollow, newFollowers);

    // Create notification
    await createNotification(userToFollow, #newFollower, caller, null);
  };

  public shared ({ caller }) func unfollowUser(userToUnfollow : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    let currentFollowing = switch (following.get(caller)) {
      case (null) { Runtime.trap("Not following this user") };
      case (?list) { list };
    };

    let newFollowing = currentFollowing.filter(func(p) { p != userToUnfollow });
    following.add(caller, newFollowing);

    let currentFollowers = switch (followers.get(userToUnfollow)) {
      case (null) { [] };
      case (?list) { list };
    };
    let newFollowers = currentFollowers.filter(func(p) { p != caller });
    followers.add(userToUnfollow, newFollowers);
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view followers");
    };
    switch (followers.get(user)) {
      case (null) { [] };
      case (?list) { list };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view following");
    };
    switch (following.get(user)) {
      case (null) { [] };
      case (?list) { list };
    };
  };

  // Post Management
  public shared ({ caller }) func createPost(media : Storage.ExternalBlob, caption : Text) : async Int {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    lastPostId += 1;
    let post : Post = {
      id = lastPostId;
      author = caller;
      media = media;
      caption = caption;
      timestamp = Time.now();
    };
    posts.add(lastPostId, post);
    lastPostId;
  };

  public query ({ caller }) func getPost(postId : Int) : async ?Post {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };
    posts.get(postId);
  };

  public query ({ caller }) func getUserPosts(user : Principal) : async [Post] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };
    posts.values().toArray().filter(func(post) { post.author == user });
  };

  public query ({ caller }) func getFeed() : async [Post] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view feed");
    };

    let followingList = switch (following.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };

    posts.values().toArray().filter(func(post) {
      followingList.find<Principal>(func(p) { p == post.author }) != null
    });
  };

  // Like Management
  public shared ({ caller }) func likePost(postId : Int) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    let currentLikes = switch (postLikes.get(postId)) {
      case (null) { [] };
      case (?list) { list };
    };

    if (currentLikes.find<Principal>(func(p) { p == caller }) != null) {
      Runtime.trap("Already liked this post");
    };

    let newLikes = currentLikes.concat([caller]);
    postLikes.add(postId, newLikes);

    // Create notification if not own post
    if (post.author != caller) {
      await createNotification(post.author, #postLike, caller, ?postId);
    };
  };

  public shared ({ caller }) func unlikePost(postId : Int) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?_) {};
    };

    let currentLikes = switch (postLikes.get(postId)) {
      case (null) { Runtime.trap("Post not liked") };
      case (?list) { list };
    };

    let newLikes = currentLikes.filter(func(p) { p != caller });
    postLikes.add(postId, newLikes);
  };

  public query ({ caller }) func getPostLikes(postId : Int) : async [Principal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view likes");
    };
    switch (postLikes.get(postId)) {
      case (null) { [] };
      case (?list) { list };
    };
  };

  // Comment Management
  public shared ({ caller }) func addComment(postId : Int, content : Text) : async Int {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    lastCommentId += 1;
    let comment : Comment = {
      id = lastCommentId;
      postId = postId;
      author = caller;
      content = content;
      timestamp = Time.now();
    };
    comments.add(lastCommentId, comment);

    let currentComments = switch (postComments.get(postId)) {
      case (null) { [] };
      case (?list) { list };
    };
    let newComments = currentComments.concat([lastCommentId]);
    postComments.add(postId, newComments);

    // Create notification if not own post
    if (post.author != caller) {
      await createNotification(post.author, #postComment, caller, ?postId);
    };

    lastCommentId;
  };

  public shared ({ caller }) func deleteComment(commentId : Int) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete comments");
    };

    let comment = switch (comments.get(commentId)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?c) { c };
    };

    // Only comment author or admin can delete
    if (comment.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own comments");
    };

    comments.remove(commentId);

    let currentComments = switch (postComments.get(comment.postId)) {
      case (null) { [] };
      case (?list) { list };
    };
    let newComments = currentComments.filter(func(id) { id != commentId });
    postComments.add(comment.postId, newComments);
  };

  public query ({ caller }) func getPostComments(postId : Int) : async [Comment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view comments");
    };

    let commentIds = switch (postComments.get(postId)) {
      case (null) { [] };
      case (?list) { list };
    };

    commentIds.map<Int, Comment>(
      func(commentId) { switch (comments.get(commentId)) { case (?c) { c }; case (null) { Runtime.trap("Invalid comment id") } } }
    );
  };

  // Story Management
  public shared ({ caller }) func createStory(media : Storage.ExternalBlob) : async Int {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create stories");
    };

    lastStoryId += 1;
    let story : Story = {
      id = lastStoryId;
      author = caller;
      media = media;
      timestamp = Time.now();
    };
    stories.add(lastStoryId, story);
    lastStoryId;
  };

  public query ({ caller }) func getActiveStories() : async [Story] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view stories");
    };

    let followingList = switch (following.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };

    let now = Time.now();
    let twentyFourHours = 24 * 60 * 60 * 1_000_000_000;

    stories.values().toArray().filter(
      func(story) {
        now - story.timestamp < twentyFourHours and
        (
          story.author == caller or
          followingList.find<Principal>(func(p) { p == story.author }) != null
        )
      }
    );
  };

  public shared ({ caller }) func markStoryViewed(storyId : Int) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view stories");
    };

    switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story not found") };
      case (?_) {};
    };

    let currentViews = switch (storyViews.get(storyId)) {
      case (null) { [] };
      case (?list) { list };
    };

    if (currentViews.find<Principal>(func(p) { p == caller }) == null) {
      let newViews = currentViews.concat([caller]);
      storyViews.add(storyId, newViews);
    };
  };

  // Direct Messaging
  public shared ({ caller }) func sendMessage(receiver : Principal, content : Text) : async Int {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (caller == receiver) {
      Runtime.trap("Cannot send message to yourself");
    };

    // Check if receiver exists
    switch (userProfiles.get(receiver)) {
      case (null) { Runtime.trap("Receiver not found") };
      case (?_) {};
    };

    lastMessageId += 1;
    let message : Message = {
      id = lastMessageId;
      sender = caller;
      receiver = receiver;
      content = content;
      timestamp = Time.now();
    };
    messages.add(lastMessageId, message);

    // Update conversations for both users
    let senderConversations = switch (userConversations.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };
    let newSenderConversations = senderConversations.concat([lastMessageId]);
    userConversations.add(caller, newSenderConversations);

    let receiverConversations = switch (userConversations.get(receiver)) {
      case (null) { [] };
      case (?list) { list };
    };
    let newReceiverConversations = receiverConversations.concat([lastMessageId]);
    userConversations.add(receiver, newReceiverConversations);

    // Create notification
    await createNotification(receiver, #directMessage, caller, null);

    lastMessageId;
  };

  public query ({ caller }) func getConversation(otherUser : Principal) : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    messages.values().toArray().filter(
      func(message) {
        (message.sender == caller and message.receiver == otherUser) or
        (message.sender == otherUser and message.receiver == caller)
      }
    );
  };

  // Search and Explore
  public query ({ caller }) func searchUsers(searchTerm : Text) : async [UserProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can search");
    };

    userProfiles.values().toArray().filter(
      func(profile) {
        profile.username.contains(#text searchTerm) or
        profile.displayName.contains(#text searchTerm)
      }
    );
  };

  public query ({ caller }) func getExplorePosts() : async [Post] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can explore");
    };

    posts.values().toArray();
  };

  // Notifications
  func createNotification(recipient : Principal, notificationType : NotificationType, relatedUser : Principal, relatedPostId : ?Int) : async () {
    lastNotificationId += 1;
    let notification : Notification = {
      id = lastNotificationId;
      recipient = recipient;
      notificationType = notificationType;
      relatedUser = relatedUser;
      relatedPostId = relatedPostId;
      timestamp = Time.now();
      isRead = false;
    };
    notifications.add(lastNotificationId, notification);

    let userNotifs = switch (userNotifications.get(recipient)) {
      case (null) { [] };
      case (?list) { list };
    };
    let newUserNotifs = userNotifs.concat([lastNotificationId]);
    userNotifications.add(recipient, newUserNotifs);
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    let notifIds = switch (userNotifications.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };

    notifIds.map<Int, Notification>(
      func(notifId) { switch (notifications.get(notifId)) { case (?n) { n }; case (null) { Runtime.trap("Invalid notification id") } } }
    );
  };

  public shared ({ caller }) func markNotificationRead(notificationId : Int) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can mark notifications");
    };

    let notification = switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?n) { n };
    };

    if (notification.recipient != caller) {
      Runtime.trap("Unauthorized: Can only mark your own notifications");
    };

    let updatedNotification = {
      id = notification.id;
      recipient = notification.recipient;
      notificationType = notification.notificationType;
      relatedUser = notification.relatedUser;
      relatedPostId = notification.relatedPostId;
      timestamp = notification.timestamp;
      isRead = true;
    };
    notifications.add(notificationId, updatedNotification);
  };

  // Health check
  public query ({ caller }) func healthCheck() : async Text {
    "Healthy";
  };
};
