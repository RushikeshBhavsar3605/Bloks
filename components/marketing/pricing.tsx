import { plans, planType } from "@/data/pricing";
import { Check } from "lucide-react";
import { Button } from "../ui/button";

export const Pricing = ({ onSignUp }: { onSignUp(): void }) => {
  const pricingPlans: any = plans;

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that&apos;s right for you. Upgrade or downgrade at
            any time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan: planType, index: number) => (
            <div
              key={index}
              className={`relative bg-card border rounded-xl p-8 shadow-sm ${
                plan.popular
                  ? "border-primary ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-2">
                  {plan.name === "Free" ? "Personal" : plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">
                    {plan.price.monthly ? `₹${plan.price.monthly}` : "Free"}
                  </span>
                  {plan.price.monthly !== 0 && (
                    <span className="text-muted-foreground">
                      {plan.name === "pro" ? "/month" : "/month per user"}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={onSignUp}
                className={`w-full ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-transparent border border-border hover:bg-muted"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.name === "Free" ? "Get Started" : "Upgrade"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
