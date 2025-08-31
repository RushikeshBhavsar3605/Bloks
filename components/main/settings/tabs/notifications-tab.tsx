"use client";

import { useState } from "react";

export const NotificationsTab = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Comments and Mentions</div>
              <div className="text-gray-400 text-sm">Get notified when someone comments or mentions you</div>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F] ${
                emailNotifications ? "bg-blue-600" : "bg-[#2A2A2E]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Page Updates</div>
              <div className="text-gray-400 text-sm">Get notified when pages you're following are updated</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Weekly Summary</div>
              <div className="text-gray-400 text-sm">Receive a weekly summary of your activity</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2A2A2E] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Push Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Desktop Notifications</div>
              <div className="text-gray-400 text-sm">Show desktop notifications for important updates</div>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F] ${
                pushNotifications ? "bg-blue-600" : "bg-[#2A2A2E]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  pushNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Mobile Notifications</div>
              <div className="text-gray-400 text-sm">Receive notifications on your mobile device</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Schedule */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Notification Schedule</h3>
        <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quiet Hours Start</label>
              <input
                type="time"
                defaultValue="22:00"
                className="w-full px-4 py-3 bg-[#2A2A2E] border border-[#323236] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quiet Hours End</label>
              <input
                type="time"
                defaultValue="08:00"
                className="w-full px-4 py-3 bg-[#2A2A2E] border border-[#323236] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};