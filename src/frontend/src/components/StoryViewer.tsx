import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Story } from "../backend";
import { useGetUserProfile, useMarkStoryViewed } from "../hooks/useQueries";

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export default function StoryViewer({
  stories,
  currentIndex,
  onIndexChange,
  onClose,
}: StoryViewerProps) {
  const [progress, setProgress] = useState(0);
  const currentStory = stories[currentIndex];
  const { data: authorProfile } = useGetUserProfile(currentStory.author);
  const markViewed = useMarkStoryViewed();

  // biome-ignore lint/correctness/useExhaustiveDependencies: markViewed.mutate is stable
  useEffect(() => {
    if (currentStory) {
      markViewed.mutate(currentStory.id);
    }
  }, [currentStory?.id]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: handleNext defined inline
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      onIndexChange(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[90vh] p-0 bg-black border-none">
        <div className="relative w-full h-full flex flex-col">
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
            {stories.map((story, index) => (
              <Progress
                key={story.id.toString()}
                value={
                  index === currentIndex
                    ? progress
                    : index < currentIndex
                      ? 100
                      : 0
                }
                className="h-1 flex-1"
              />
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage
                  src={authorProfile?.profilePicture?.getDirectURL()}
                />
                <AvatarFallback>
                  {authorProfile?.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-semibold">
                {authorProfile?.username || "Unknown"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Story content */}
          <div className="flex-1 flex items-center justify-center">
            {currentStory.media.getDirectURL().match(/\.(mp4|webm|ogg)$/i) ? (
              // biome-ignore lint/a11y/useMediaCaption: story media viewer
              <video
                src={currentStory.media.getDirectURL()}
                autoPlay
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <img
                src={currentStory.media.getDirectURL()}
                alt="Story"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="pointer-events-auto text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}
            <div className="flex-1" />
            {currentIndex < stories.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="pointer-events-auto text-white hover:bg-white/20"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
