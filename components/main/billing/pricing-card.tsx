import { planType } from "@/data/pricing";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PricingCardProps {
  plan: planType;
  currentPlan: "free" | "pro" | "team";
  billingCycle: "monthly" | "yearly";
  handlePlanChange: (planId: "free" | "pro" | "team") => void;
}

export const PricingCard = ({
  plan,
  currentPlan,
  billingCycle,
  handlePlanChange,
}: PricingCardProps) => {
  return (
    <div
      className={`relative bg-gray-50 dark:bg-[#161618] border rounded-xl p-6 transition-all ${
        plan.popular
          ? "border-blue-500 ring-1 ring-blue-500"
          : "border-gray-200 dark:border-[#1E1E20] hover:border-gray-300 dark:hover:border-[#2A2A2E]"
      } ${currentPlan === plan.id ? "ring-2 ring-green-500" : ""}`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      {currentPlan === plan.id && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            Current Plan
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {plan.description}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            ₹{plan.price[billingCycle].toLocaleString("en-IN")}
          </span>
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            /{billingCycle === "monthly" ? "month" : "year"}
          </span>
        </div>
        {billingCycle === "yearly" && plan.price.yearly > 0 && (
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">
            Save ₹
            {(plan.price.monthly * 12 - plan.price.yearly).toLocaleString(
              "en-IN"
            )}{" "}
            per year
          </div>
        )}
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          Features included:
        </h4>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() =>
          currentPlan !== plan.id &&
          handlePlanChange(plan.id as "free" | "pro" | "team")
        }
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          currentPlan === plan.id
            ? "bg-green-600 text-white cursor-default"
            : plan.popular
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white"
        }`}
        disabled={currentPlan === plan.id}
      >
        {currentPlan === plan.id
          ? "Current Plan"
          : (() => {
              // Define plan hierarchy: free < pro < team
              const planHierarchy = { free: 0, pro: 1, team: 2 };
              const currentPlanLevel =
                planHierarchy[currentPlan as keyof typeof planHierarchy] ?? 0;
              const targetPlanLevel =
                planHierarchy[plan.id as keyof typeof planHierarchy];

              return targetPlanLevel > currentPlanLevel
                ? `Upgrade to ${plan.name}`
                : `Downgrade to ${plan.name}`;
            })()}
      </button>
    </div>
  );
};

PricingCard.Skeleton = function PricingCardSkeleton() {
  return (
    <div className="relative bg-gray-50 dark:bg-[#161618] rounded-xl p-6 transition-all">
      <div className="mb-6">
        <Skeleton className="h-6 w-20 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-baseline gap-1 mb-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 flex-shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="w-full h-12 rounded-lg" />
    </div>
  );
};
