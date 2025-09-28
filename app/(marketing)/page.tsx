"use client";

import { Navbar } from "@/components/marketing/navbar";
import { Heroes } from "@/components/marketing/heroes";
import { Stats } from "@/components/marketing/stats";
import { FileStructure } from "@/components/marketing/file-structure";
import { Features } from "@/components/marketing/features";
import { Platform } from "@/components/marketing/platform";
import { Testimonials } from "@/components/marketing/testimonials";
import { Pricing } from "@/components/marketing/pricing";
import { Footer } from "@/components/marketing/footer";
import { CallToAction } from "@/components/marketing/call-to-action";
import { useRouter } from "next/navigation";

const MarketingPage = () => {
  const router = useRouter();

  const onSignIn = () => {
    router.push("/auth/login");
  };

  const onSignUp = () => {
    router.push("/auth/register");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-scroll {
          animation: scroll 25s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Navigation */}
      <Navbar onSignIn={onSignIn} onSignUp={onSignUp} />

      {/* Hero Section - Optimized */}
      <Heroes onSignUp={onSignUp} />

      {/* Stats Section */}
      <Stats />

      {/* File Structure Showcase */}
      <FileStructure />

      {/* Features Section */}
      <Features />

      {/* Platforms Section */}
      <Platform />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Pricing Section */}
      <Pricing onSignUp={onSignUp} />

      {/* CTA Section */}
      <CallToAction onSignUp={onSignUp} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MarketingPage;
