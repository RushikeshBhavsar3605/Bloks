import { customerPortalLink } from "@/data/pricing";
import { Calendar, Crown, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrentPlanCardProps {
  currentPlan: "free" | "pro" | "team";
  billingCycle: "monthly" | "yearly";
  userEmail: string;
}
export const CurrentPlanCard = ({
  currentPlan,
  billingCycle,
  userEmail,
}: CurrentPlanCardProps) => {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6">
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
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentPlan === "free"
                  ? "Free Plan"
                  : currentPlan === "pro"
                  ? "Pro Plan"
                  : "Team Plan"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your current subscription
              </p>
            </div>
          </div>
          <div className="text-right">
            {currentPlan === "free" ? (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                Free
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹
                  {currentPlan === "pro"
                    ? billingCycle === "monthly"
                      ? "499"
                      : "4,999"
                    : billingCycle === "monthly"
                    ? "999"
                    : "9,999"}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  per {billingCycle === "monthly" ? "month" : "year"}
                </div>
              </>
            )}
          </div>
        </div>
        {currentPlan !== "free" ? (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#1E1E20]">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Billing</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const url = `${customerPortalLink}?prefilled_email=${userEmail}`;
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
              >
                Manage Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-gray-200 dark:border-[#1E1E20]">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upgrade to unlock more features and advanced capabilities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

CurrentPlanCard.Skeleton = function CurrentPlanCardSkeleton() {
  return (
    <div className="mb-8">
      <div className="bg-gray-50 dark:bg-[#161618] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-[#1E1E20]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
