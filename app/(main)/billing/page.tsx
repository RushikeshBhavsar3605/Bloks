"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Download,
  Calendar,
  Check,
  Shield,
  Crown,
  ArrowRight,
  AlertCircle,
  Users,
  User,
} from "lucide-react";
import { customerPortalLink, plans } from "@/data/pricing";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getUserSubscription } from "@/actions/users/get-user-subscription";

const BillingPage = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "team">();

  useEffect(() => {
    if (!user?.id) return;

    const fetchSubscription = async () => {
      const plan = await getUserSubscription(user.id as string);
      setCurrentPlan(plan);
      console.log("Plan: ", plan);
    };

    fetchSubscription();
  }, [user?.id]);

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
    router.push(`${redirectUrl}?prefilled_email=${user?.email}`);
  };

  const billingHistory = [
    {
      id: "inv-001",
      date: "Jan 15, 2024",
      description: "Pro Plan - Monthly",
      amount: "₹499.00",
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "inv-002",
      date: "Dec 15, 2023",
      description: "Pro Plan - Monthly",
      amount: "₹499.00",
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "inv-003",
      date: "Nov 15, 2023",
      description: "Pro Plan - Monthly",
      amount: "₹499.00",
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "inv-004",
      date: "Oct 15, 2023",
      description: "Pro Plan - Monthly",
      amount: "₹499.00",
      status: "paid",
      downloadUrl: "#",
    },
  ];

  const usageStats = [
    { label: "Pages Created", current: 47, limit: "Unlimited", percentage: 0 },
    { label: "Workspaces", current: 3, limit: 5, percentage: 60 },
    { label: "Team Members", current: 4, limit: 10, percentage: 40 },
    {
      label: "Storage Used",
      current: "2.3 GB",
      limit: "100 GB",
      percentage: 2.3,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#0B0B0F] overflow-y-auto custom-scrollbar">
      <div className="h-[66px]" />

      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2 tracking-wider">
            <span>ACCOUNT</span>
          </div>
          <h1 className="text-[32px] font-bold text-white leading-tight">
            Billing & Usage
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your subscription and view usage statistics
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="mb-8">
          <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    currentPlan === "free"
                      ? "bg-gray-600"
                      : currentPlan === "pro"
                      ? "bg-blue-600"
                      : "bg-purple-600"
                  }`}
                >
                  {currentPlan === "free" ? (
                    <User className="w-6 h-6 text-white" />
                  ) : currentPlan === "pro" ? (
                    <Crown className="w-6 h-6 text-white" />
                  ) : (
                    <Users className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {currentPlan === "free"
                      ? "Free Plan"
                      : currentPlan === "pro"
                      ? "Pro Plan"
                      : "Team Plan"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Your current subscription
                  </p>
                </div>
              </div>
              <div className="text-right">
                {currentPlan === "free" ? (
                  <div className="text-2xl font-bold text-white">Free</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-white">
                      ₹
                      {currentPlan === "pro"
                        ? billingCycle === "monthly"
                          ? "499"
                          : "4,999"
                        : billingCycle === "monthly"
                        ? "999"
                        : "9,999"}
                    </div>
                    <div className="text-gray-400 text-sm">
                      per {billingCycle === "monthly" ? "month" : "year"}
                    </div>
                  </>
                )}
              </div>
            </div>
            {currentPlan !== "free" ? (
              <div className="flex items-center justify-between pt-4 border-t border-[#1E1E20]">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Next billing: February 15, 2024</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      router.push(
                        `${customerPortalLink}?prefilled_email=${user?.email}`
                      )
                    }
                    className="px-4 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Manage Plan
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-[#1E1E20]">
                <p className="text-sm text-gray-400">
                  Upgrade to unlock more features and advanced capabilities.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Usage Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {usageStats.map((stat, index) => (
              <div
                key={index}
                className="bg-[#161618] border border-[#1E1E20] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white text-sm">
                    {stat.label}
                  </h4>
                  <div className="text-xs text-gray-500">
                    {stat.current} / {stat.limit}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-2xl font-bold text-white">
                    {stat.current}
                  </div>
                </div>
                {stat.percentage > 0 && (
                  <div className="w-full bg-[#2A2A2E] rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Available Plans
            </h2>
            <div className="flex items-center bg-[#2A2A2E] rounded-lg p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingCycle === "monthly"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingCycle === "yearly"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
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
              <div
                key={plan.id}
                className={`relative bg-[#161618] border rounded-xl p-6 transition-all ${
                  plan.popular
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-[#1E1E20] hover:border-[#2A2A2E]"
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
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">
                      ₹{plan.price[billingCycle].toLocaleString("en-IN")}
                    </span>
                    <span className="text-gray-400 text-sm">
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                  {billingCycle === "yearly" && plan.price.yearly > 0 && (
                    <div className="text-sm text-green-400 mt-1">
                      Save ₹
                      {(
                        plan.price.monthly * 12 -
                        plan.price.yearly
                      ).toLocaleString("en-IN")}{" "}
                      per year
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Features included:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-300"
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
                      : "bg-[#2A2A2E] hover:bg-[#323236] text-white"
                  }`}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id
                    ? "Current Plan"
                    : (() => {
                        // Define plan hierarchy: free < pro < team
                        const planHierarchy = { free: 0, pro: 1, team: 2 };
                        const currentPlanLevel =
                          planHierarchy[
                            currentPlan as keyof typeof planHierarchy
                          ] ?? 0;
                        const targetPlanLevel =
                          planHierarchy[plan.id as keyof typeof planHierarchy];

                        return targetPlanLevel > currentPlanLevel
                          ? `Upgrade to ${plan.name}`
                          : `Downgrade to ${plan.name}`;
                      })()}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Payment Method
          </h2>
          <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <div className="text-white font-medium">
                    •••• •••• •••• 4242
                  </div>
                  <div className="text-gray-400 text-sm">Expires 12/2027</div>
                </div>
                <div className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">
                  VISA
                </div>
              </div>
              <button className="px-4 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors">
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Billing History
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Download All
            </button>
          </div>
          <div className="bg-[#161618] border border-[#1E1E20] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#1A1A1C]">
                <tr>
                  <th className="text-left p-4 text-white font-semibold">
                    Date
                  </th>
                  <th className="text-left p-4 text-white font-semibold">
                    Description
                  </th>
                  <th className="text-left p-4 text-white font-semibold">
                    Amount
                  </th>
                  <th className="text-left p-4 text-white font-semibold">
                    Status
                  </th>
                  <th className="text-left p-4 text-white font-semibold">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((invoice, index) => (
                  <tr
                    key={invoice.id}
                    className={index > 0 ? "border-t border-[#1E1E20]" : ""}
                  >
                    <td className="p-4 text-gray-300">{invoice.date}</td>
                    <td className="p-4 text-gray-300">{invoice.description}</td>
                    <td className="p-4 text-white font-medium">
                      {invoice.amount}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded font-medium">
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enterprise Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Need something more?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Enterprise plans with advanced security, compliance, and
                    dedicated support.
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all">
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">
                Need help with billing?
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Our support team is here to help with any billing questions or
                issues you might have.
              </p>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Contact Support
                </button>
                <button className="px-4 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors">
                  View FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
