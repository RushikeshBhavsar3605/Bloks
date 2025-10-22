"use client";

import { useEffect, useState } from "react";
import { customerPortalLink, plans } from "@/data/pricing";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getUserSubscription } from "@/actions/users/get-user-subscription";
import { CurrentPlanCard } from "@/components/main/billing/current-plan-card";
import { UsageStatCard } from "@/components/main/billing/usage-stat-card";
import { PricingCard } from "@/components/main/billing/pricing-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsageStats } from "@/actions/users/get-usage-stats";

const limitData = {
  free: {
    personal: 25,
    public: 5,
    coeditor: 3,
  },
  pro: {
    personal: 25,
    public: 5,
    coeditor: 3,
  },
  team: {
    personal: -1,
    public: -1,
    coeditor: -1,
  },
};

const createUsageStat = (
  label: string,
  current: number,
  limit: number,
  isUnlimited = false
) => {
  const isUnlimitedPlan = limit === -1 || isUnlimited;
  const limitText = isUnlimitedPlan ? "Unlimited" : limit;
  const percentage = isUnlimitedPlan
    ? 0
    : current < limit
    ? (current / limit) * 100
    : 100;

  return {
    label,
    current,
    limit: limitText,
    percentage,
  };
};

const BillingPage = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "team">();
  const [usageStats, setUsageStats] = useState<
    {
      label: string;
      current: number;
      limit: string | number;
      percentage: number;
    }[]
  >();

  useEffect(() => {
    if (!user?.id) return;

    const fetchSubscription = async () => {
      const plan = await getUserSubscription(user.id as string);
      setCurrentPlan(plan);
    };

    fetchSubscription();
  }, [user?.id]);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!currentPlan) {
        return null;
      }

      const usage = await getUsageStats();

      const data = [
        createUsageStat(
          "Pages Created",
          usage.personalDocument,
          limitData[currentPlan].personal
        ),
        createUsageStat(
          "Public Pages",
          usage.publicDocument,
          limitData[currentPlan].public
        ),
        createUsageStat(
          "Team Members",
          usage.coeditorsCount,
          limitData[currentPlan].coeditor
        ),
        createUsageStat(
          "Collaborated Pages",
          usage.collaboratingDocument,
          -1,
          true
        ),
      ];
      setUsageStats(data);
    };

    fetchUsage();
  });

  // Helper function to get plan index from plan ID
  const getPlanIndex = (planId: "free" | "pro" | "team"): number => {
    const planIndexMap = {
      free: 0,
      pro: 1,
      team: 2,
    };

    return planIndexMap[planId];
  };

  // Function to handle plan upgrades/downgrades
  const handlePlanChange = (planId: "free" | "pro" | "team") => {
    // Early return for invalid cases
    if (currentPlan === planId) {
      return;
    }

    let redirectUrl;
    if (currentPlan === "free") {
      const planIndex = getPlanIndex(planId);
      const planLink = plans[planIndex].link[billingCycle];

      redirectUrl = planLink;
    } else {
      redirectUrl = customerPortalLink;
    }

    // Navigate to the appropriate URL
    const url = `${redirectUrl}?prefilled_email=${user?.email}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (currentPlan === undefined || usageStats === undefined || !user?.email) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0B0F] overflow-y-auto custom-scrollbar">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2 tracking-wider">
              <span>ACCOUNT</span>
            </div>
            <h1 className="text-[32px] font-bold text-gray-900 dark:text-white leading-tight">
              Billing & Usage
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your subscription and view usage statistics
            </p>
          </div>

          {/* Current Plan Card Skeleton */}
          <CurrentPlanCard.Skeleton />

          {/* Usage Statistics Skeleton */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Usage Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <UsageStatCard.Skeleton key={index} />
              ))}
            </div>
          </div>

          {/* Plan Comparison Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Available Plans
              </h2>
              <div className="flex items-center bg-gray-50 dark:bg-[#161618] rounded-lg w-40 p-1">
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <PricingCard.Skeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0B0F] overflow-y-auto custom-scrollbar">
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2 tracking-wider">
            <span>ACCOUNT</span>
          </div>
          <h1 className="text-[32px] font-bold text-gray-900 dark:text-white leading-tight">
            Billing & Usage
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your subscription and view usage statistics
          </p>
        </div>

        {/* Current Plan Card */}
        <CurrentPlanCard
          currentPlan={currentPlan}
          billingCycle={billingCycle}
          userEmail={user.email}
        />

        {/* Usage Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Usage Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {usageStats.map((stat, index) => (
              <UsageStatCard
                key={index}
                label={stat.label}
                current={stat.current}
                limit={stat.limit}
                percentage={stat.percentage}
              />
            ))}
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Available Plans
            </h2>
            <div className="flex items-center bg-gray-100 dark:bg-[#2A2A2E] rounded-lg p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingCycle === "monthly"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingCycle === "yearly"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Yearly
                <span className="ml-1 px-1.5 py-0.5 bg-green-600 text-white text-xs rounded">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                currentPlan={currentPlan}
                billingCycle={billingCycle}
                handlePlanChange={handlePlanChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
