"use client";

import { useState } from "react";
import { RefreshCw, Download, Upload } from "lucide-react";

export const AdvancedTab = () => {
  const [debugMode, setDebugMode] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [experimentalFeatures, setExperimentalFeatures] = useState(false);

  return (
    <div className="space-y-8">
      {/* Developer Options */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Developer Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Debug Mode</div>
              <div className="text-gray-400 text-sm">Enable debug logging and developer console</div>
            </div>
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F] ${
                debugMode ? "bg-blue-600" : "bg-[#2A2A2E]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  debugMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Analytics</div>
              <div className="text-gray-400 text-sm">Help improve our service by sharing usage data</div>
            </div>
            <button
              onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F] ${
                analyticsEnabled ? "bg-blue-600" : "bg-[#2A2A2E]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  analyticsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Experimental Features</div>
              <div className="text-gray-400 text-sm">Enable beta features and experimental functionality</div>
            </div>
            <button
              onClick={() => setExperimentalFeatures(!experimentalFeatures)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F] ${
                experimentalFeatures ? "bg-blue-600" : "bg-[#2A2A2E]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  experimentalFeatures ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
        <div className="space-y-4">
          <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-white">Clear Cache</h4>
                <p className="text-sm text-gray-400">Clear application cache to improve performance</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
                Clear Cache
              </button>
            </div>
          </div>

          <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
            <h4 className="font-medium text-white mb-2">Reset Application</h4>
            <p className="text-sm text-gray-400 mb-4">
              Reset all settings to default values. This will not delete your documents.
            </p>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
              Reset Settings
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
            <h4 className="font-medium text-white mb-2">Import Data</h4>
            <p className="text-sm text-gray-400 mb-4">
              Import documents and settings from other applications or backup files.
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              Import Data
            </button>
          </div>

          <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
            <h4 className="font-medium text-white mb-2">Export Data</h4>
            <p className="text-sm text-gray-400 mb-4">
              Export all your data in various formats for backup or migration.
            </p>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export as JSON
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export as ZIP
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
        <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span className="text-white">1.2.4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Build:</span>
              <span className="text-white">2024.01.15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Environment:</span>
              <span className="text-white">Production</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Region:</span>
              <span className="text-white">US-West</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Updated:</span>
              <span className="text-white">2 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime:</span>
              <span className="text-white">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};