import { Outlet } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import Navigation from "./Navigation";

export default function Layout() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "instabhai-app",
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              Built with{" "}
              <Heart className="w-4 h-4 fill-primary text-primary animate-pulse" />{" "}
              using{" "}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:text-primary/80 transition-colors underline decoration-primary/30 hover:decoration-primary/60"
              >
                caffeine.ai
              </a>
            </p>
            <p className="text-xs text-muted-foreground/70">
              © {currentYear} InstaBhai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
