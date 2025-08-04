"use client";

import { LucideIcon, MoreHorizontal } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  value: string;
  label: string;
  change?: string;
  count?: number;
  emoji?: string;
  name?: string;
  onClick?: () => void;
  variant?: "stats" | "folder";
}

export const StatsCard = ({
  icon: Icon,
  iconColor,
  value,
  label,
  change,
  count,
  emoji,
  name,
  onClick,
  variant = "stats",
}: StatsCardProps) => {
  const isFolder = variant === "folder";

  return (
    <div
      onClick={onClick}
      className={`bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl ${
        isFolder ? "p-5" : "p-6"
      } ${
        onClick ? "hover:bg-gray-100 dark:hover:bg-[#1A1A1C] transition-colors cursor-pointer group" : ""
      }`}
    >
      {/* Stats variant */}
      {!isFolder && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 dark:bg-[#2A2A2E] rounded-lg flex items-center justify-center">
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            {change && (
              <span
                className={`text-sm font-medium ${
                  change.startsWith("+") ? "text-green-400" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {change}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
        </>
      )}

      {/* Folder variant */}
      {isFolder && (
        <>
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">{emoji}</span>
            {onClick && (
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#2A2A2E] rounded">
                <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 leading-tight">{name}</h3>
          <p className="text-xs text-gray-500">{count} pages</p>
        </>
      )}
    </div>
  );
};