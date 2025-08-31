"use client";

import { useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export const AppearanceTab = () => {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC-8");

  return (
    <div className="space-y-8">
      {/* Theme */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.id;
            return (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-600/10"
                    : "border-gray-200 dark:border-[#1E1E20] bg-white dark:bg-[#161618] hover:border-gray-300 dark:hover:border-[#2A2A2E]"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-blue-600" : "bg-gray-100 dark:bg-[#2A2A2E]"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-gray-600 dark:text-white"}`} />
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">{themeOption.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Language & Region */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Language & Region</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="UTC-8">Pacific Time (UTC-8)</option>
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC+0">Greenwich Mean Time (UTC+0)</option>
              <option value="UTC+1">Central European Time (UTC+1)</option>
              <option value="UTC+9">Japan Standard Time (UTC+9)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Display Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 dark:text-white font-medium">Compact Mode</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Reduce spacing and padding for more content</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-[#2A2A2E] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0B0B0F]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 dark:text-white font-medium">Show Line Numbers</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Display line numbers in code blocks</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0B0B0F]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 dark:text-white font-medium">Auto-save</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Automatically save changes as you type</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0B0B0F]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};