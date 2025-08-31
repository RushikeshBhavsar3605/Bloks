"use client";

import { useState } from "react";
import { Camera, Save, Github, Twitter, Linkedin } from "lucide-react";

export const ProfileTab = () => {
  const [firstName, setFirstName] = useState("Rushikesh");
  const [lastName, setLastName] = useState("Joseph");
  const [email, setEmail] = useState("rushikesh@example.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [bio, setBio] = useState(
    "Product manager passionate about building tools that help teams collaborate better."
  );
  const [location, setLocation] = useState("San Francisco, CA");

  return (
    <div className="space-y-8">
      {/* Profile Picture */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Picture
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              RJ
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B0B0F] transition-colors">
              <Camera className="w-4 h-4 text-gray-600 dark:text-white" />
            </button>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Upload Photo
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h3>
        <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Social Links
          </h3>
          <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                  <Github className="w-5 h-5 text-gray-600 dark:text-white" />
                </div>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  className="flex-1 px-4 py-3 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                  <Twitter className="w-5 h-5 text-gray-600 dark:text-white" />
                </div>
                <input
                  type="url"
                  placeholder="https://twitter.com/username"
                  className="flex-1 px-4 py-3 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                  <Linkedin className="w-5 h-5 text-gray-600 dark:text-white" />
                </div>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  className="flex-1 px-4 py-3 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      </div>
    </div>
  );
};
