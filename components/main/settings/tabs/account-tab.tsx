"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

export const AccountTab = () => {
  const user = useCurrentUser();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Account Information
        </h3>
        <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account ID
              </label>
              <div className="flex items-center gap-3">
                <code className="px-3 py-2 bg-gray-100 dark:bg-[#2A2A2E] text-gray-700 dark:text-gray-300 text-sm rounded font-mono">
                  {user?.id}
                </code>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Member Since
              </label>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>October 15, 2023</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
