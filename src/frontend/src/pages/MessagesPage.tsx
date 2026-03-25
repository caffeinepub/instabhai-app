import { Principal } from "@icp-sdk/core/principal";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ConversationList from "../components/ConversationList";
import ConversationThread from "../components/ConversationThread";
import ProfileSetupModal from "../components/ProfileSetupModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetConversation,
  useSearchUsers,
  useSendMessage,
} from "../hooks/useQueries";

export default function MessagesPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const principalParam = (params as any)?.principal;
  const [selectedUser, setSelectedUser] = useState<Principal | null>(
    principalParam ? Principal.fromText(principalParam) : null,
  );

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

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
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid md:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-200px)]">
          <ConversationList
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
          />
          {selectedUser ? (
            <ConversationThread otherUser={selectedUser} />
          ) : (
            <div className="flex items-center justify-center border rounded-lg bg-accent/20">
              <p className="text-muted-foreground">
                Select a conversation to start messaging
              </p>
            </div>
          )}
        </div>
      </div>

      <ProfileSetupModal open={showProfileSetup} onOpenChange={() => {}} />
    </>
  );
}
