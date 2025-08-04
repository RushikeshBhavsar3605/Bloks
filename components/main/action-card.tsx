"use client";

import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  onClick: () => void;
  variant?: "documents" | "library";
}

export const ActionCard = ({ title, description, icon: Icon, iconColor, onClick, variant = "documents" }: ActionCardProps) => {
  const isLibrary = variant === "library";

  return (
    <button
      onClick={onClick}
      className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-[#1A1A1C] transition-colors text-left group"
    >
      {/* Documents page layout - icon and text side by side */}
      {!isLibrary && (
        <>
          <div className={`w-12 h-12 ${iconColor} rounded-xl flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </>
      )}

      {/* Library page layout - icon and text in horizontal layout */}
      {isLibrary && (
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
              {title}
            </h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
      )}
    </button>
  );
};