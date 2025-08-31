"use client";

import { useState } from "react";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsTabContent } from "./settings-tab-content";

export const SettingsContent = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex h-full bg-white dark:bg-[#0B0B0F] overflow-hidden">
      <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <SettingsTabContent activeTab={activeTab} />
      </div>
    </div>
  );
};