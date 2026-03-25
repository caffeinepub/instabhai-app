import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import ProfileSetupModal from "../components/ProfileSetupModal";
import UserSearchResults from "../components/UserSearchResults";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetExplorePosts,
  useSearchUsers,
} from "../hooks/useQueries";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const { data: searchResults = [] } = useSearchUsers(debouncedSearch);
  const { data: explorePosts = [], isLoading: postsLoading } =
    useGetExplorePosts();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Search Results or Explore Content */}
        {searchTerm ? (
          <UserSearchResults
            searchResults={searchResults}
            searchTerm={searchTerm}
          />
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Explore Posts</h2>
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : explorePosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts to explore yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {explorePosts.map((post) => (
                  <PostCard
                    key={post.id.toString()}
                    post={post}
                    layout="grid"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ProfileSetupModal open={showProfileSetup} onOpenChange={() => {}} />
    </>
  );
}
