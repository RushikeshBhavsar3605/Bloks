"use client";

import { cn } from "@/lib/utils";
import { User, Shield, Palette, Lock, ChevronsLeft } from "lucide-react";

interface SettingsSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobile: boolean;
  isCollapsed: boolean;
  collapse: () => void;
}

export const SettingsSidebar = ({
  activeTab,
  onTabChange,
  isMobile,
  isCollapsed,
  collapse,
}: SettingsSidebarProps) => {
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy & Security", icon: Lock },
  ];

  return (
    <div className="p-6">
      <div
        onClick={collapse}
        role="button"
        className={cn(
          "h-6 w-6 text-gray-600 dark:text-gray-400 rounded-sm hover:bg-gray-100 dark:hover:bg-[#1E1E20] absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
          isMobile && "opacity-100",
          isCollapsed && "hidden"
        )}
      >
        <ChevronsLeft className="h-6 w-6" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h2>
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-gray-100 dark:bg-[#2A2A2E] text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E20]"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
