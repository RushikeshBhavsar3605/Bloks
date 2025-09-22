import { Skeleton } from "@/components/ui/skeleton";

interface UsageStatCardProps {
  label: string;
  current: string | number;
  limit: string | number;
  percentage: number;
}

export const UsageStatCard = ({
  label,
  current,
  limit,
  percentage,
}: UsageStatCardProps) => {
  return (
    <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
          {label}
        </h4>
        <div className="text-xs text-gray-500">
          {current} / {limit}
        </div>
      </div>
      <div className="mb-2">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {current}
        </div>
      </div>
      {percentage > 0 && (
        <div className="w-full bg-gray-200 dark:bg-[#2A2A2E] rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

UsageStatCard.Skeleton = function UsageStatCardSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-[#161618] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="mb-2">
        <Skeleton className="h-8 w-12" />
      </div>
      <Skeleton className="w-full h-2 rounded-full" />
    </div>
  );
};
