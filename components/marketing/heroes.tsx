import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect, useRef } from "react";

// Animation constants
const ANIMATION_CONFIG = {
  SPEED: 1, // Pixels per frame
  MIN_SPACING: 80, // Minimum space between elements
  POSITION_CALC_DELAY: 100, // Delay for position calculation
  REPOSITION_THRESHOLD: 100, // Extra space before repositioning
} as const;

export const Heroes = ({ onSignUp }: { onSignUp(): void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLDivElement[]>([]);
  const animationRef = useRef<number>();
  const positionsRef = useRef<number[]>([]);
  const isPausedRef = useRef(false);
  const elementWidthsRef = useRef<number[]>([]);

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

  // Calculate element widths and positions
  const calculatePositions = () => {
    elementWidthsRef.current = [];

    // Calculate actual width of each element
    elementsRef.current.forEach((element, index) => {
      if (element) {
        const rect = element.getBoundingClientRect();
        elementWidthsRef.current[index] =
          rect.width + ANIMATION_CONFIG.MIN_SPACING;
      }
    });

    // Calculate cumulative positions based on actual widths
    let currentPosition = 0;
    positionsRef.current = elementWidthsRef.current.map((width) => {
      const position = currentPosition;
      currentPosition += width;
      return position;
    });
  };

  // Handle element repositioning when it moves off-screen
  const repositionElement = (position: number, index: number): number => {
    const elementWidth = elementWidthsRef.current[index] || 0;

    if (position < -(elementWidth + ANIMATION_CONFIG.REPOSITION_THRESHOLD)) {
      const maxPosition = Math.max(...positionsRef.current);
      const lastElementIndex = positionsRef.current.indexOf(maxPosition);
      const lastElementWidth = elementWidthsRef.current[lastElementIndex] || 0;
      return maxPosition + lastElementWidth;
    }

    return position - ANIMATION_CONFIG.SPEED;
  };

  // Apply transforms to all elements
  const applyTransforms = () => {
    elementsRef.current.forEach((element, index) => {
      if (element) {
        element.style.transform = `translateX(${positionsRef.current[index]}px)`;
      }
    });
  };

  // Main animation loop
  const animate = () => {
    if (!containerRef.current) return;

    if (isPausedRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Update positions
    positionsRef.current = positionsRef.current.map(repositionElement);

    // Apply transforms
    applyTransforms();

    animationRef.current = requestAnimationFrame(animate);
  };

  // Initialize carousel animation
  useEffect(() => {
    if (!containerRef.current) return;

    // Calculate positions after elements are rendered
    setTimeout(calculatePositions, ANIMATION_CONFIG.POSITION_CALC_DELAY);

    // Start animation
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [companies.length]);

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
            Bloks is a connected workspace where better, faster work happens.
            Write, plan, share, and get organized. Everything you need in one
            place.
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
            <div className="relative w-full max-w-6xl overflow-hidden h-8 [mask-image:linear-gradient(to_right,transparent,black_48px,black_calc(100%-48px),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_48px,black_calc(100%-48px),transparent)] [mask-mode:alpha]">
              <div
                ref={containerRef}
                className="relative w-full h-full"
                onMouseEnter={() => (isPausedRef.current = true)}
                onMouseLeave={() => (isPausedRef.current = false)}
              >
                {/* Single array of companies with circular positioning */}
                {companies.map((company, index) => (
                  <div
                    key={company}
                    ref={(el) => {
                      if (el) elementsRef.current[index] = el;
                    }}
                    className="absolute top-0 -translate-y-1/2 text-base sm:text-lg font-semibold opacity-60 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap cursor-default"
                    style={{
                      transform: `translateX(0px) translateY(-50%)`,
                    }}
                  >
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
