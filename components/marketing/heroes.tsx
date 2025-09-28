import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

export const Heroes = ({ onSignUp }: { onSignUp(): void }) => {
  const [isPaused, setIsPaused] = useState(false);

  // Company data for the carousel
  const companies = [
    "Nike",
    "Pinterest",
    "Amazon",
    "Adobe",
    "Uber",
    "DoorDash",
    "Robinhood",
    "Pixar",
    "Toyota",
    "Snowflake",
    "Figma",
    "Vercel",
    "AngelList",
    "Substack",
    "Sendbird",
    "Duolingo",
    "Sandbox VR",
    "Cocoon",
    "Brightback",
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-muted border border-border rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Revolutionary file organization
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Think beyond folders.
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Every file is a container.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed font-normal">
            Break free from rigid folder structures. With Jotion&apos;s
            revolutionary approach, every document becomes a container—nest
            files infinitely, organize naturally, and let your ideas flow
            without boundaries.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              onClick={onSignUp}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Creating for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Social Proof - Enhanced Carousel */}
          <div className="flex flex-col items-center gap-6">
            <p className="text-sm text-muted-foreground">Trusted by teams at</p>
            <div className="relative w-full max-w-6xl overflow-hidden">
              <style jsx>{`
                @keyframes scroll {
                  0% {
                    transform: translateX(100%);
                  }
                  100% {
                    transform: translateX(-100%);
                  }
                }
                .carousel-container {
                  animation: scroll 30s linear infinite;
                  animation-play-state: ${isPaused ? "paused" : "running"};
                }
              `}</style>

              <div
                className="flex carousel-container"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* Continuous stream of companies for seamless scrolling */}
                {[...companies, ...companies].map((company, index) => (
                  <div
                    key={index}
                    className="text-base sm:text-lg font-semibold opacity-60 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap cursor-default flex-shrink-0 mx-6 sm:mx-8"
                  >
                    {company}
                  </div>
                ))}
              </div>

              {/* Gradient overlays for fade effect */}
              <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
