import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const CallToAction = ({ onSignUp }: { onSignUp(): void }) => {
  const [email, setEmail] = useState("");

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
          Ready to transform your workflow?
        </h2>
        <p className="text-xl text-muted-foreground mb-10">
          Join thousands of users who trust Jotion for their most important
          work.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border-border text-foreground placeholder-muted-foreground"
          />
          <Button
            onClick={onSignUp}
            className="bg-primary hover:bg-primary/90 whitespace-nowrap"
          >
            Get Started
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Free forever. No credit card required.
        </p>
      </div>
    </section>
  );
};
