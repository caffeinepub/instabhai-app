import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface ProfileSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileSetupModal({
  open,
  onOpenChange,
}: ProfileSetupModalProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity || !username.trim() || !displayName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      let profilePictureBlob: ExternalBlob | undefined;

      if (profilePicture) {
        const arrayBuffer = await profilePicture.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        profilePictureBlob = ExternalBlob.fromBytes(
          uint8Array,
        ).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      await saveProfile.mutateAsync({
        principal: identity.getPrincipal(),
        username: username.trim(),
        displayName: displayName.trim(),
        bio: bio.trim(),
        profilePicture: profilePictureBlob,
      });

      toast.success("Profile created successfully!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Profile setup error:", error);
      toast.error(error.message || "Failed to create profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to InstaBhai!</DialogTitle>
          <DialogDescription>
            Set up your profile to get started
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profilePicture">Profile Picture</Label>
            <div className="flex items-center gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <Label
                htmlFor="profilePicture"
                className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-accent"
              >
                <Upload className="w-4 h-4" />
                Choose Image
              </Label>
              <Input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
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
              saveProfile.isPending ||
              (uploadProgress > 0 && uploadProgress < 100)
            }
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Profile"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
