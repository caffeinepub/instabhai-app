import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useCreateStory } from "../hooks/useQueries";

interface CreateStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateStoryModal({
  open,
  onOpenChange,
}: CreateStoryModalProps) {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const createStory = useCreateStory();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mediaFile) {
      toast.error("Please select an image or video");
      return;
    }

    try {
      const arrayBuffer = await mediaFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const mediaBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
        (percentage) => {
          setUploadProgress(percentage);
        },
      );

      await createStory.mutateAsync(mediaBlob);

      toast.success("Story created successfully!");
      setMediaFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Create story error:", error);
      toast.error(error.message || "Failed to create story");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Story</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Media</Label>
            {previewUrl ? (
              <div className="relative">
                {mediaFile?.type.startsWith("video/") ? (
                  // biome-ignore lint/a11y/useMediaCaption: user upload preview
                  <video
                    src={previewUrl}
                    controls
                    className="w-full rounded-lg max-h-96"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveMedia}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Label
                htmlFor="storyMediaFile"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50"
              >
                <Upload className="w-12 h-12 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload image or video
                </span>
                <input
                  id="storyMediaFile"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
            )}
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <Label>Uploading...</Label>
              <Progress value={uploadProgress} />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary via-chart-1 to-chart-5"
            disabled={
              !mediaFile ||
              createStory.isPending ||
              (uploadProgress > 0 && uploadProgress < 100)
            }
          >
            {createStory.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Story...
              </>
            ) : (
              "Share Story"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
