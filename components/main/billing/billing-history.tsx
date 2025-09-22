import { Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BillingHistory {
  billingHistory: {
    id: string;
    date: string;
    description: string;
    amount: string;
    status: string;
    downloadUrl: string;
  }[];
}

export const BillingHistory = ({ billingHistory }: BillingHistory) => {
  return (
    <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 dark:bg-[#1A1A1C]">
          <tr>
            <th className="text-left p-4 text-gray-900 dark:text-white font-semibold">
              Date
            </th>
            <th className="text-left p-4 text-gray-900 dark:text-white font-semibold">
              Description
            </th>
            <th className="text-left p-4 text-gray-900 dark:text-white font-semibold">
              Amount
            </th>
            <th className="text-left p-4 text-gray-900 dark:text-white font-semibold">
              Status
            </th>
            <th className="text-left p-4 text-gray-900 dark:text-white font-semibold">
              Invoice
            </th>
          </tr>
        </thead>
        <tbody>
          {billingHistory.map((invoice, index) => (
            <tr
              key={invoice.id}
              className={
                index > 0
                  ? "border-t border-gray-200 dark:border-[#1E1E20]"
                  : ""
              }
            >
              <td className="p-4 text-gray-700 dark:text-gray-300">
                {invoice.date}
              </td>
              <td className="p-4 text-gray-700 dark:text-gray-300">
                {invoice.description}
              </td>
              <td className="p-4 text-gray-900 dark:text-white font-medium">
                {invoice.amount}
              </td>
              <td className="p-4">
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded font-medium">
                  {invoice.status.toUpperCase()}
                </span>
              </td>
              <td className="p-4">
                <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm transition-colors">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

BillingHistory.Skeleton = function BillingHistorySkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-[#161618] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 dark:bg-[#1A1A1C]">
          <tr>
            <th className="text-left p-4">
              <Skeleton className="h-4 w-12" />
            </th>
            <th className="text-left p-4">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="text-left p-4">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="text-left p-4">
              <Skeleton className="h-4 w-14" />
            </th>
            <th className="text-left p-4">
              <Skeleton className="h-4 w-16" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, index) => (
            <tr
              key={index}
              className={
                index > 0
                  ? "border-t border-gray-200 dark:border-[#1E1E20]"
                  : ""
              }
            >
              <td className="p-4">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="p-4">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="p-4">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="p-4">
                <Skeleton className="h-5 w-12 rounded" />
              </td>
              <td className="p-4">
                <Skeleton className="h-4 w-20" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
