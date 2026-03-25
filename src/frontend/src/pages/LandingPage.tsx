import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Heart,
  Loader2,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useHealthCheck } from "../hooks/useQueries";

export default function LandingPage() {
  const { data: healthStatus, isLoading, isError } = useHealthCheck();

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      {/* Hero Section */}
      <section className="text-center mb-16 md:mb-24">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-chart-1/10 to-chart-5/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">
            Welcome to InstaBhai
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-5 bg-clip-text text-transparent">
            Connect, Share,
          </span>
          <br />
          <span className="text-foreground">Celebrate Together</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          Your vibrant social space to share moments, connect with friends, and
          celebrate life's beautiful journey.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            size="lg"
            className="text-lg px-8 py-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary via-chart-1 to-chart-5 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 rounded-2xl font-bold border-2 hover:bg-accent/50"
          >
            Learn More
          </Button>
        </div>

        {/* Health Status Badge */}
        <div className="flex justify-center">
          {isLoading ? (
            <Badge variant="secondary" className="gap-2 px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </Badge>
          ) : isError ? (
            <Badge variant="destructive" className="gap-2 px-4 py-2">
              Connection Error
            </Badge>
          ) : (
            <Badge className="gap-2 px-4 py-2 bg-gradient-to-r from-primary/90 to-chart-1/90">
              <CheckCircle2 className="w-4 h-4" />
              {healthStatus} - System Online
            </Badge>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16 md:mb-24">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
          Why Choose{" "}
          <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-5 bg-clip-text text-transparent">
            InstaBhai
          </span>
          ?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Share Moments
              </CardTitle>
              <CardDescription className="text-base">
                Capture and share your life's beautiful moments with friends and
                family in a vibrant, engaging way.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-chart-1/50 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-chart-1/20 to-chart-5/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-chart-1" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Build Community
              </CardTitle>
              <CardDescription className="text-base">
                Connect with like-minded people, build meaningful relationships,
                and grow your social circle.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-chart-5/50 transition-all hover:shadow-lg group">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-chart-5/20 to-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-chart-5" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Stay Connected
              </CardTitle>
              <CardDescription className="text-base">
                Real-time updates, instant notifications, and seamless
                communication keep you connected always.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-chart-1/5 to-chart-5/5">
          <CardContent className="pt-12 pb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to Join the{" "}
              <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-5 bg-clip-text text-transparent">
                InstaBhai
              </span>{" "}
              Family?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Start your journey today and experience a new way to connect and
              share with the world.
            </p>
            <Button
              size="lg"
              className="text-lg px-10 py-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary via-chart-1 to-chart-5 hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Join Now
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
