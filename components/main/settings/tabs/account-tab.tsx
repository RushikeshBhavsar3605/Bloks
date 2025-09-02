"use client";

import { useState } from "react";
import { Calendar, LogOut, AlertTriangle } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const AccountTab = () => {
  const user = useCurrentUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOutUser = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success("You have been signed out successfully!");
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
      setIsSigningOut(false);
    }
  };

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

      {/* Session Management */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Session Management
        </h3>
        <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 dark:text-white font-medium mb-1">
                Sign Out
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Sign out of your account on this device
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={isSigningOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Sign Out Confirmation
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to sign out? You will need to sign in again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSigningOut}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={signOutUser}
                    disabled={isSigningOut}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                  >
                    {isSigningOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Signing Out...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};
