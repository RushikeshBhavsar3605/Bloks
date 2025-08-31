"use client";

import { useState } from "react";
import { Calendar, Download, AlertTriangle, Eye, EyeOff } from "lucide-react";

export const AccountTab = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-8">
      {/* Account Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Information
        </h3>
        <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account ID
              </label>
              <div className="flex items-center gap-3">
                <code className="px-3 py-2 bg-gray-100 dark:bg-[#2A2A2E] text-gray-700 dark:text-gray-300 text-sm rounded font-mono">
                  usr_2J8k9L3mN4pQ5r
                </code>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#2A2A2E] rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
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

      {/* Change Password */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h3>
        <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2E] border border-gray-300 dark:border-[#323236] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter current password"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2E] border border-gray-300 dark:border-[#323236] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-white dark:bg-[#2A2A2E] border border-gray-300 dark:border-[#323236] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Danger Zone
        </h3>
        <div className="bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 dark:text-white mb-2">
                Delete Account
              </h4>
              <p className="text-red-700 dark:text-gray-300 text-sm mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
