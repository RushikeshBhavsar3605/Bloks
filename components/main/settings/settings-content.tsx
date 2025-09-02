"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsTabContent } from "./settings-tab-content";

export const SettingsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams?.get("tab") || "profile";

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="flex h-full bg-white dark:bg-[#0B0B0F] overflow-hidden">
      <SettingsSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <SettingsTabContent activeTab={activeTab} />
      </div>
    </div>
  );
};