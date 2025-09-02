"use client";

import { useState } from "react";
import { Camera, Save } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSession } from "next-auth/react";
import { updateUser } from "@/actions/users/update-user";
import { toast } from "sonner";

const getAvatarInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getAvatarColor = (id: string) => {
  const colors = [
    "bg-blue-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-red-600",
    "bg-yellow-600",
    "bg-indigo-600",
    "bg-pink-600",
    "bg-gray-600",
  ];
  const index =
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

export const ProfileTab = () => {
  const user = useCurrentUser();
  const { update } = useSession();
  const [fName, lName] = user?.name?.split(" ") ?? [];
  const [firstName, setFirstName] = useState(fName);
  const [lastName, setLastName] = useState(lName);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async () => {
    if (!user?.id || !firstName || !lastName) return;

    setIsLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`;
      const response = await updateUser({ id: user.id, name: fullName });

      if (response) {
        // Update the session with the new name
        await update({
          name: fullName,
        });
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if there are changes to save
  const hasChanges = () => {
    const currentFullName = `${firstName} ${lastName}`;
    const originalFullName = user?.name || "";
    return currentFullName !== originalFullName;
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Profile Picture
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-16 h-16 ${getAvatarColor(
                  user?.id as string
                )} rounded-full flex items-center justify-center text-lg font-medium text-white`}
              >
                {getAvatarInitials(user?.name || "User")}
              </div>
            )}
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B0B0F] transition-colors">
              <Camera className="w-3 h-3 text-gray-600 dark:text-white" />
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
              Upload Photo
            </button>
            <button className="px-3 py-1.5 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm font-medium rounded-md transition-colors">
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Basic Information
        </h3>
        <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-md text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 bg-white dark:bg-[#161618] border border-gray-300 dark:border-[#1E1E20] rounded-md text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email as string}
                readOnly
                disabled
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#2A2A2E] border border-gray-200 dark:border-[#323236] rounded-md text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed. Contact support if you need to update
                it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Changes Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-[#1E1E20]">
        <button
          onClick={handleSaveChanges}
          disabled={!hasChanges() || isLoading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
            ${
              hasChanges() && !isLoading
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                : "bg-gray-100 dark:bg-[#2A2A2E] text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};
