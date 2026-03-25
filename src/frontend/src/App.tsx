import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";
import ExplorePage from "./pages/ExplorePage";
import FeedPage from "./pages/FeedPage";
import LandingPage from "./pages/LandingPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import PostDetailPage from "./pages/PostDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ReelsPage from "./pages/ReelsPage";

const queryClient = new QueryClient();

// Create root route with Layout
const rootRoute = createRootRoute({
  component: Layout,
});

// Create routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feed",
  component: FeedPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$principal",
  component: ProfilePage,
});

const myProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post/$postId",
  component: PostDetailPage,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: ExplorePage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: MessagesPage,
});

const messageThreadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages/$principal",
  component: MessagesPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const reelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reels",
  component: ReelsPage,
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  feedRoute,
  profileRoute,
  myProfileRoute,
  postDetailRoute,
  exploreRoute,
  messagesRoute,
  messageThreadRoute,
  notificationsRoute,
  reelsRoute,
]);
const router = createRouter({ routeTree });

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
