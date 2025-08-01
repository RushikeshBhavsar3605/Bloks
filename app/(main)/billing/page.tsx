"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { CreditCard, Check, Star, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const BillingPage = () => {
  const user = useCurrentUser();
  const router = useRouter();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      current: true,
      features: [
        "Up to 1,000 blocks",
        "Basic collaboration",
        "7 day page history",
        "Mobile app access"
      ]
    },
    {
      name: "Pro",
      price: "$8",
      period: "per month",
      current: false,
      popular: true,
      features: [
        "Unlimited blocks",
        "Advanced collaboration",
        "Unlimited page history",
        "Priority support",
        "Advanced permissions",
        "Custom integrations"
      ]
    },
    {
      name: "Team",
      price: "$15",
      period: "per member/month",
      current: false,
      features: [
        "Everything in Pro",
        "Advanced admin tools",
        "SAML SSO",
        "Advanced security",
        "Dedicated success manager",
        "Custom contracts"
      ]
    }
  ];

  return (
    <div className="h-full p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="h-8 w-8 text-green-500" />
        <h1 className="text-3xl font-bold">Billing & Plans</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Current Plan</h2>
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Free Plan</h3>
              <p className="text-sm text-muted-foreground">Perfect for getting started</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">$0/month</p>
              <p className="text-sm text-muted-foreground">Current plan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative p-6 border rounded-lg ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={plan.current ? "secondary" : plan.popular ? "default" : "outline"}
                disabled={plan.current}
              >
                {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={() => router.push("/documents")}>
          Back to Documents
        </Button>
      </div>
    </div>
  );
};

export default BillingPage;