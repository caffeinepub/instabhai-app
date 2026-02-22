import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Home, Sparkles, Menu } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Navigation() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Explore', icon: Sparkles, path: '/' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-lg supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 group"
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
                key={item.path}
                variant="ghost"
                onClick={() => navigate({ to: item.path })}
                className="gap-2 font-semibold hover:bg-accent/50 hover:text-accent-foreground"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => {
                      navigate({ to: item.path });
                      setIsOpen(false);
                    }}
                    className="justify-start gap-2 font-semibold text-lg"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
