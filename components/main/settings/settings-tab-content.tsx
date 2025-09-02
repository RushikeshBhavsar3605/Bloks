"use client";

import { ProfileTab } from "./tabs/profile-tab";
import { AccountTab } from "./tabs/account-tab";
import { AppearanceTab } from "./tabs/appearance-tab";
import { PrivacyTab } from "./tabs/privacy-tab";

interface SettingsTabContentProps {
  activeTab: string;
}

export const SettingsTabContent = ({ activeTab }: SettingsTabContentProps) => {
  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "account":
        return <AccountTab />;
      case "appearance":
        return <AppearanceTab />;
      case "privacy":
        return <PrivacyTab />;
      default:
        return <ProfileTab />;
    }
  };

  const getTabInfo = () => {
    switch (activeTab) {
      case "profile":
        return {
          title: "Profile",
          description: "Manage your personal information and profile settings",
        };
      case "account":
        return {
          title: "Account",
          description: "Update your account security and login preferences",
        };
      case "appearance":
        return {
          title: "Appearance",
          description: "Customize the look and feel of your workspace",
        };
      case "notifications":
        return {
          title: "Notifications",
          description: "Control how and when you receive notifications",
        };
      case "privacy":
        return {
          title: "Privacy & Security",
          description: "Manage your privacy and security settings",
        };
      case "integrations":
        return {
          title: "Integrations",
          description: "Connect with external services and manage API access",
        };
      case "advanced":
        return {
          title: "Advanced",
          description: "Advanced settings for power users and developers",
        };
      default:
        return { title: "Settings", description: "" };
    }
  };

  const tabInfo = getTabInfo();

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {tabInfo.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tabInfo.description}
          </p>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
};
