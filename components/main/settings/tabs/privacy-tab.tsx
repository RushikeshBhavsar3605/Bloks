"use client";

import { updateUser } from "@/actions/users/update-user";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export const PrivacyTab = () => {
  const user = useCurrentUser();
  const { update } = useSession();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(
    user?.isTwoFactorEnabled ?? false
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleTwoFactor = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const newValue = !twoFactorEnabled;
      const response = await updateUser({
        id: user.id,
        isTwoFactorEnabled: newValue,
      });

      if (response) {
        setTwoFactorEnabled(newValue);
        await update({
          isTwoFactorEnabled: newValue,
        });

        toast.success(
          newValue
            ? "Two-factor authentication enabled successfully!"
            : "Two-factor authentication disabled successfully!"
        );
      } else {
        toast.error(
          "Failed to update two-factor authentication. Please try again."
        );
      }
    } catch (error) {
      toast.error(
        "Failed to update two-factor authentication. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Two-Factor Authentication */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Two-Factor Authentication
        </h3>
        <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-gray-900 dark:text-white font-medium">
                Enable Two-Factor Authentication
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Add an extra layer of security to your account
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTwoFactor();
              }}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0B0B0F] ${
                twoFactorEnabled
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-[#2A2A2E]"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
