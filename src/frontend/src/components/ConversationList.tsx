import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Principal } from "@icp-sdk/core/principal";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchUsers } from "../hooks/useQueries";

interface ConversationListProps {
  selectedUser: Principal | null;
  onSelectUser: (user: Principal) => void;
}

export default function ConversationList({
  onSelectUser,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: searchResults = [] } = useSearchUsers(debouncedSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="border rounded-lg flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {searchTerm ? (
          <div className="p-2">
            {searchResults.map((user) => (
              <button
                type="button"
                key={user.principal.toString()}
                onClick={() => {
                  onSelectUser(user.principal);
                  setSearchTerm("");
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.profilePicture?.getDirectURL()} />
                  <AvatarFallback>
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.displayName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <p>Search for users to start a conversation</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
