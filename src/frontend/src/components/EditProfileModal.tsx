import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type UserProfile } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: UserProfile;
}

export default function EditProfileModal({
  open,
  onOpenChange,
  currentProfile,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(currentProfile.displayName);
  const [bio, setBio] = useState(currentProfile.bio);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentProfile.profilePicture?.getDirectURL() || null,
  );

  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    setDisplayName(currentProfile.displayName);
    setBio(currentProfile.bio);
    setPreviewUrl(currentProfile.profilePicture?.getDirectURL() || null);
  }, [currentProfile]);

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

    if (!identity || !displayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    try {
      let profilePictureBlob: ExternalBlob | undefined =
        currentProfile.profilePicture;

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
        username: currentProfile.username,
        displayName: displayName.trim(),
        bio: bio.trim(),
        profilePicture: profilePictureBlob,
      });

      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                Change Image
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
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
