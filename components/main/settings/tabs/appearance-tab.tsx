"use client";

import { useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export const AppearanceTab = () => {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC-8");

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Theme
        </h3>
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
                      isSelected
                        ? "bg-blue-600"
                        : "bg-gray-100 dark:bg-[#2A2A2E]"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isSelected
                          ? "text-white"
                          : "text-gray-600 dark:text-white"
                      }`}
                    />
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {themeOption.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
