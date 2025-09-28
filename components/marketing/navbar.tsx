"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = ({
  onSignIn,
  onSignUp,
}: {
  onSignIn(): void;
  onSignUp(): void;
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="text-xl font-bold">Jotion</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#platforms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Platforms
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Reviews
            </a>
            <button
              onClick={onSignIn}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </button>
            <Button
              onClick={onSignUp}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-4">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#platforms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Platforms
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Reviews
              </a>
              <button
                onClick={onSignIn}
                className="text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Sign In
              </button>
              <Button
                onClick={onSignUp}
                className="bg-primary hover:bg-primary/90 w-full"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
