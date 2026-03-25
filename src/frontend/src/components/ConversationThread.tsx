import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Principal } from "@icp-sdk/core/principal";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetConversation,
  useGetUserProfile,
  useSendMessage,
} from "../hooks/useQueries";

interface ConversationThreadProps {
  otherUser: Principal;
}

export default function ConversationThread({
  otherUser,
}: ConversationThreadProps) {
  const [content, setContent] = useState("");
  const { identity } = useInternetIdentity();
  const { data: messages = [], isLoading } = useGetConversation(otherUser);
  const { data: otherUserProfile } = useGetUserProfile(otherUser);
  const sendMessage = useSendMessage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message count change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await sendMessage.mutateAsync({
        receiver: otherUser,
        content: content.trim(),
      });
      setContent("");
    } catch (error: any) {
      console.error("Send message error:", error);
      toast.error(error.message || "Failed to send message");
    }
  };

  return (
    <div className="border rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={otherUserProfile?.profilePicture?.getDirectURL()} />
          <AvatarFallback>
            {otherUserProfile?.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">
            {otherUserProfile?.username || "Unknown"}
          </p>
          <p className="text-sm text-muted-foreground">
            {otherUserProfile?.displayName}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn =
                identity?.getPrincipal().toString() ===
                message.sender.toString();
              const timestamp = new Date(Number(message.timestamp) / 1_000_000);

              return (
                <div
                  key={message.id.toString()}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] ${isOwn ? "bg-primary text-primary-foreground" : "bg-accent"} rounded-lg p-3`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {formatDistanceToNow(timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={sendMessage.isPending}
        />
        <Button
          type="submit"
          disabled={!content.trim() || sendMessage.isPending}
          className="bg-gradient-to-r from-primary via-chart-1 to-chart-5"
        >
          {sendMessage.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
