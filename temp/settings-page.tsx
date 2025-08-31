"use client"

import { useState } from "react"
import {
  User,
  Bell,
  Shield,
  Palette,
  Smartphone,
  Key,
  Download,
  Upload,
  Eye,
  EyeOff,
  AlertTriangle,
  Moon,
  Sun,
  Monitor,
  Camera,
  Calendar,
  Link,
  Github,
  Twitter,
  Linkedin,
  Save,
  RefreshCw,
  Settings,
} from "lucide-react"

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [theme, setTheme] = useState("dark")
  const [language, setLanguage] = useState("en")
  const [timezone, setTimezone] = useState("UTC-8")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Key },
    { id: "integrations", label: "Integrations", icon: Link },
    { id: "advanced", label: "Advanced", icon: Settings },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-8">
            {/* Profile Picture */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                    RJ
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#2A2A2E] hover:bg-[#323236] rounded-full flex items-center justify-center border-2 border-[#0B0B0F] transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Upload Photo
                  </button>
                  <button className="px-4 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    defaultValue="Rushikesh"
                    className="w-full px-4 py-3 bg-[#161618] border border-[#1E1E20] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    defaultValue="Joseph"
                    className="w-full px-4 py-3 bg-[#161618] border border-[#1E1E20] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="rushikesh@example.com"
                    className="w-full px-4 py-3 bg-[#161618] border border-[#1E1E20] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-[#161618] border border-[#1E1E20] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    defaultValue="San Francisco, CA"
                    className="w-full px-4 py-3 bg-[#161618] border border-[#1E1E20] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    defaultValue="Product manager passionate about building tools that help teams collaborate better."
                    className="w-full px-4 py-3 bg-[#161618] border border-[#1E1E20] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                    <Github className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    className="flex-1 px-4 py-3 bg-[#161618] border border-[#1E1E20] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://twitter.com/username"
                    className="flex-1 px-4 py-3 bg-[#161618] border border-[#1E1E20] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    className="flex-1 px-4 py-3 bg-[#161618] border border-[#1E1E20] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        )

      case "account":
        return (
          <div className="space-y-8">
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
              <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Account ID</label>
                    <div className="flex items-center gap-3">
                      <code className="px-3 py-2 bg-[#2A2A2E] text-gray-300 text-sm rounded font-mono">
                        usr_2J8k9L3mN4pQ5r
                      </code>
                      <button className="p-2 hover:bg-[#2A2A2E] rounded text-gray-400 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>October 15, 2023</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
              <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 bg-[#2A2A2E] border border-[#323236] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                        placeholder="Enter current password"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-[#2A2A2E] border border-[#323236] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-[#2A2A2E] border border-[#323236] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <h3 className="text-lg font-semibold text-white mb-4">Danger Zone</h3>
              <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2">Delete Account</h4>
                    <p className="text-gray-300 text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "appearance":
        return (
          <div className="space-y-8">
            {/* Theme */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((themeOption) => {
                  const Icon = themeOption.icon
                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => setTheme(themeOption.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === themeOption.id
                          ? "border-blue-500 bg-blue-600/10"
                          : "border-[#1E1E20] bg-[#161618] hover:border-[#2A2A2E]"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            theme === themeOption.id ? "bg-blue-600" : "bg-[#2A2A2E]"
                          }`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white font-medium">{themeOption.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Language & Region */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Language & Region</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-[#161618] border border-[#1E1E20] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 bg-[#161618] border border-[#1E1E20] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <h3 className="text-lg font-semibold text-white mb-4">Display Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Compact Mode</div>
                    <div className="text-gray-400 text-sm">Reduce spacing and padding for more content</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2A2A2E] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Show Line Numbers</div>
                    <div className="text-gray-400 text-sm">Display line numbers in code blocks</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Auto-save</div>
                    <div className="text-gray-400 text-sm">Automatically save changes as you type</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case "notifications":
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
        )

      case "privacy":
        return (
          <div className="space-y-8">
            {/* Two-Factor Authentication */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
              <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white font-medium">Two-Factor Authentication</div>
                    <div className="text-gray-400 text-sm">Add an extra layer of security to your account</div>
                  </div>
                  <button
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F] ${
                      twoFactorEnabled ? "bg-blue-600" : "bg-[#2A2A2E]"
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
                  <div className="pt-4 border-t border-[#1E1E20]">
                    <p className="text-gray-300 text-sm mb-4">
                      Two-factor authentication is enabled. Use your authenticator app to generate codes.
                    </p>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors">
                        View Recovery Codes
                      </button>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Disable 2FA
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Sessions */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
              <div className="space-y-4">
                <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Current Session</div>
                        <div className="text-gray-400 text-sm">Chrome on macOS • San Francisco, CA</div>
                        <div className="text-gray-500 text-xs">Last active: Now</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded font-medium">Active</span>
                  </div>
                </div>
                <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Mobile App</div>
                        <div className="text-gray-400 text-sm">iPhone • San Francisco, CA</div>
                        <div className="text-gray-500 text-xs">Last active: 2 hours ago</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium transition-colors">
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Profile Visibility</div>
                    <div className="text-gray-400 text-sm">Make your profile visible to other users</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Activity Status</div>
                    <div className="text-gray-400 text-sm">Show when you're online to other users</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2A2A2E] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Analytics</div>
                    <div className="text-gray-400 text-sm">Help improve Jotion by sharing usage data</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case "integrations":
        return (
          <div className="space-y-8">
            {/* Connected Apps */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Connected Apps</h3>
              <div className="space-y-4">
                <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                        <Github className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">GitHub</div>
                        <div className="text-gray-400 text-sm">Sync repositories and issues</div>
                        <div className="text-green-400 text-xs">Connected</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Disconnect
                    </button>
                  </div>
                </div>
                <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Google Calendar</div>
                        <div className="text-gray-400 text-sm">Sync events and meetings</div>
                        <div className="text-gray-500 text-xs">Not connected</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* API Keys */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">API Keys</h3>
              <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white font-medium">Personal Access Token</div>
                    <div className="text-gray-400 text-sm">Use this token to access the Jotion API</div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Generate Token
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <code className="flex-1 px-3 py-2 bg-[#2A2A2E] text-gray-300 text-sm rounded font-mono">
                      jtn_1234567890abcdef...
                    </code>
                    <button className="p-2 hover:bg-[#2A2A2E] rounded text-gray-400 hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-[#2A2A2E] rounded text-gray-400 hover:text-white transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "advanced":
        return (
          <div className="space-y-8">
            {/* Data Export */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Data Export</h3>
              <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white font-medium">Export Your Data</div>
                    <div className="text-gray-400 text-sm">Download all your pages, comments, and files</div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Request Export
                  </button>
                </div>
                <div className="text-gray-400 text-sm">
                  Export requests are processed within 24 hours. You'll receive an email when ready.
                </div>
              </div>
            </div>

            {/* Data Import */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Data Import</h3>
              <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white font-medium">Import from Other Services</div>
                    <div className="text-gray-400 text-sm">Import your data from Notion, Obsidian, or other apps</div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Import Data
                  </button>
                </div>
                <div className="text-gray-400 text-sm">
                  Supported formats: Notion exports, Markdown files, HTML files
                </div>
              </div>
            </div>

            {/* Developer Settings */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Developer Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Developer Mode</div>
                    <div className="text-gray-400 text-sm">Enable advanced features and debugging tools</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2A2A2E] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Beta Features</div>
                    <div className="text-gray-400 text-sm">Get early access to new features</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B0B0F]">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex-1 flex bg-[#0B0B0F] overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-[280px] bg-[#161618] border-r border-[#1E1E20] overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-[#2A2A2E] text-white"
                      : "text-gray-400 hover:text-white hover:bg-[#1E1E20]"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
              <p className="text-gray-400">
                {activeTab === "profile" && "Manage your personal information and profile settings"}
                {activeTab === "account" && "Update your account security and login preferences"}
                {activeTab === "appearance" && "Customize the look and feel of your workspace"}
                {activeTab === "notifications" && "Control how and when you receive notifications"}
                {activeTab === "privacy" && "Manage your privacy and security settings"}
                {activeTab === "integrations" && "Connect with external services and manage API access"}
                {activeTab === "advanced" && "Advanced settings for power users and developers"}
              </p>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
