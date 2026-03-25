# InstaBhai App

## Current State
App has Stories, Posts, and Messaging features. Backend supports creating posts (image/video), stories, and all social features. However:
1. Login navigation is broken - after Internet Identity login completes, user is not redirected to /feed
2. There is no Reels section - only Posts exist
3. Stories row shows, but upload may fail due to auth issues

## Requested Changes (Diff)

### Add
- Reels page at /reels - vertical scroll, full-screen short video content (filtered from video posts)
- Reels nav item in Navigation
- Create Reel modal (video-only upload)
- Backend support for reel type posts via `isReel` boolean flag

### Modify
- Fix login navigation bug in Navigation.tsx: after login, useEffect watches loginStatus='success' and navigates to /feed
- Remove the broken `navigate` call inside `handleAuth` after `login()`
- Feed shows explore posts (all posts) when user has no following yet, to prevent empty feed frustration
- Navigation adds Reels link

### Remove
- Nothing removed

## Implementation Plan
1. Fix login navigation in Navigation.tsx using useEffect on loginStatus
2. Add Reels page with vertical infinite scroll of video posts
3. Add Create Reel modal (video only)
4. Add Reels nav item
5. Update FeedPage to show public posts when feed is empty (fallback to explore)
