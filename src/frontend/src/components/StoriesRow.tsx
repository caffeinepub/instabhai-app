import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Story } from "../backend";
import { useGetActiveStories, useGetUserProfile } from "../hooks/useQueries";
import StoryViewer from "./StoryViewer";

interface StoriesRowProps {
  onCreateStory: () => void;
}

export default function StoriesRow({ onCreateStory }: StoriesRowProps) {
  const { data: stories = [] } = useGetActiveStories();
  const [selectedStories, setSelectedStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Group stories by author
  const groupedStories = stories.reduce(
    (acc, story) => {
      const authorKey = story.author.toString();
      if (!acc[authorKey]) {
        acc[authorKey] = [];
      }
      acc[authorKey].push(story);
      return acc;
    },
    {} as Record<string, Story[]>,
  );

  const handleStoryClick = (authorStories: Story[]) => {
    setSelectedStories(authorStories);
    setCurrentIndex(0);
  };

  const handleClose = () => {
    setSelectedStories([]);
    setCurrentIndex(0);
  };

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 p-4">
          {/* Add Story Button */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <Button
              onClick={onCreateStory}
              className="w-16 h-16 rounded-full p-0 bg-gradient-to-br from-primary via-chart-1 to-chart-5"
            >
              <Plus className="w-6 h-6" />
            </Button>
            <span className="text-xs font-medium">Your Story</span>
          </div>

          {/* Story Avatars */}
          {Object.entries(groupedStories).map(([authorKey, authorStories]) => (
            <StoryAvatar
              key={authorKey}
              authorPrincipal={authorStories[0].author}
              onClick={() => handleStoryClick(authorStories)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {selectedStories.length > 0 && (
        <StoryViewer
          stories={selectedStories}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          onClose={handleClose}
        />
      )}
    </>
  );
}

function StoryAvatar({
  authorPrincipal,
  onClick,
}: { authorPrincipal: any; onClick: () => void }) {
  const { data: profile } = useGetUserProfile(authorPrincipal);

  return (
    <button
      type="button"
      className="flex flex-col items-center gap-2 flex-shrink-0"
      onClick={onClick}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-chart-1 to-chart-5 rounded-full blur-sm" />
        <div className="relative p-0.5 bg-gradient-to-br from-primary via-chart-1 to-chart-5 rounded-full">
          <Avatar className="w-16 h-16 border-2 border-background">
            <AvatarImage src={profile?.profilePicture?.getDirectURL()} />
            <AvatarFallback>
              {profile?.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <span className="text-xs font-medium max-w-[64px] truncate">
        {profile?.username || "Unknown"}
      </span>
    </button>
  );
}
