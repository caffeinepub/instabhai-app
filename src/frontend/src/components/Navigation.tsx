import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Film,
  Home,
  Menu,
  MessageCircle,
  PlusSquare,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetNotifications,
} from "../hooks/useQueries";
import CreatePostModal from "./CreatePostModal";
import CreateStoryModal from "./CreateStoryModal";

export default function Navigation() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: notifications } = useGetNotifications();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === "logging-in";
  const loginText =
    loginStatus === "logging-in"
      ? "Logging in..."
      : isAuthenticated
        ? "Logout"
        : "Login";

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  useEffect(() => {
    if (loginStatus === "success") {
      navigate({ to: "/feed" });
    }
  }, [loginStatus, navigate]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: "/" });
    } else {
      try {
        login();
      } catch (error: any) {
        console.error("Login error:", error);
      }
    }
  };

  const navItems = isAuthenticated
    ? [
        { label: "Feed", icon: Home, path: "/feed" },
        { label: "Explore", icon: Search, path: "/explore" },
        { label: "Reels", icon: Film, path: "/reels" },
        { label: "Messages", icon: MessageCircle, path: "/messages" },
        {
          label: "Notifications",
          icon: Bell,
          path: "/notifications",
          badge: unreadCount,
        },
      ]
    : [
        { label: "Home", icon: Home, path: "/" },
        { label: "Explore", icon: Sparkles, path: "/" },
      ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-lg supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate({ to: isAuthenticated ? "/feed" : "/" })}
              className="flex items-center gap-2 group"
              data-ocid="nav.link"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-chart-1 to-chart-5 rounded-xl blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="relative bg-gradient-to-br from-primary via-chart-1 to-chart-5 p-2 rounded-xl">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-primary via-chart-1 to-chart-5 bg-clip-text text-transparent">
                InstaBhai
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path + item.label}
                  variant="ghost"
                  onClick={() => navigate({ to: item.path })}
                  className="gap-2 font-semibold hover:bg-accent/50 hover:text-accent-foreground relative"
                  data-ocid={`nav.${item.label.toLowerCase()}.link`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}

              {isAuthenticated && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="gap-2"
                        data-ocid="nav.create.open_modal_button"
                      >
                        <PlusSquare className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setShowCreatePost(true)}
                        data-ocid="nav.create_post.button"
                      >
                        <PlusSquare className="w-4 h-4 mr-2" />
                        Create Post
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowCreateStory(true)}
                        data-ocid="nav.create_story.button"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Story
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate({ to: "/profile" })}
                    className="ml-2"
                    data-ocid="nav.profile.link"
                  >
                    {userProfile?.profilePicture ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={userProfile.profilePicture.getDirectURL()}
                        />
                        <AvatarFallback>
                          {userProfile.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Button>
                </>
              )}

              <Button
                onClick={handleAuth}
                disabled={disabled}
                variant={isAuthenticated ? "outline" : "default"}
                data-ocid="nav.auth.button"
                className={
                  isAuthenticated
                    ? ""
                    : "bg-gradient-to-r from-primary via-chart-1 to-chart-5 hover:opacity-90"
                }
              >
                {loginText}
              </Button>
            </nav>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-2">
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-ocid="nav.create.open_modal_button"
                    >
                      <PlusSquare className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setShowCreatePost(true)}
                      data-ocid="nav.create_post.button"
                    >
                      <PlusSquare className="w-4 h-4 mr-2" />
                      Create Post
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowCreateStory(true)}
                      data-ocid="nav.create_story.button"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Story
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-ocid="nav.menu.open_modal_button"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col gap-4 mt-8">
                    {navItems.map((item) => (
                      <Button
                        key={item.path + item.label}
                        variant="ghost"
                        onClick={() => {
                          navigate({ to: item.path });
                          setIsOpen(false);
                        }}
                        className="justify-start gap-2 font-semibold text-lg relative"
                        data-ocid={`nav.${item.label.toLowerCase()}.link`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                        {item.badge && item.badge > 0 && (
                          <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}

                    {isAuthenticated && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          navigate({ to: "/profile" });
                          setIsOpen(false);
                        }}
                        className="justify-start gap-2 font-semibold text-lg"
                        data-ocid="nav.profile.link"
                      >
                        <User className="w-5 h-5" />
                        Profile
                      </Button>
                    )}

                    <Button
                      onClick={() => {
                        handleAuth();
                        setIsOpen(false);
                      }}
                      disabled={disabled}
                      variant={isAuthenticated ? "outline" : "default"}
                      data-ocid="nav.auth.button"
                      className={
                        isAuthenticated
                          ? "justify-start"
                          : "justify-start bg-gradient-to-r from-primary via-chart-1 to-chart-5"
                      }
                    >
                      {loginText}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <CreatePostModal open={showCreatePost} onOpenChange={setShowCreatePost} />
      <CreateStoryModal
        open={showCreateStory}
        onOpenChange={setShowCreateStory}
      />
    </>
  );
}
