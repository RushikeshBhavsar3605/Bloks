"use client";

import { useState } from "react";

export const PrivacyTab = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="space-y-8">
      {/* Two-Factor Authentication */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
        <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-gray-900 dark:text-white font-medium">Enable Two-Factor Authentication</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Add an extra layer of security to your account</div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0B0B0F] ${
                twoFactorEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-[#2A2A2E]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          
          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-600/30 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Scan this QR code with your authenticator app or enter the setup key manually.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Show QR Code
                </button>
                <button className="px-4 py-2 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
                  Show Setup Key
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 dark:text-white font-medium">Profile Visibility</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Make your profile visible to other users</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0B0B0F]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 dark:text-white font-medium">Activity Status</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Show when you're online and active</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-[#2A2A2E] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0B0B0F]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 dark:text-white font-medium">Analytics</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Help improve our service by sharing usage data</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0B0B0F]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Download Your Data</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Get a copy of all your data including documents, comments, and account information.
            </p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Request Download
            </button>
          </div>
          
          <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Delete All Data</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Permanently delete all your data. This action cannot be undone.
            </p>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
              Delete Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};