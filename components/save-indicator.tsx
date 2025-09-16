"use client";

import { useSaveStatus } from "@/hooks/use-save-status";
import { AlertCircle, Check, Clock } from "lucide-react";

export const SaveIndicator = () => {
  const { status, error } = useSaveStatus();

  if (status === "Saving") {
    return (
      <div className="flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (status === "Error") {
    return (
      <div className="flex items-center gap-1.5">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span>Error</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Check className="w-4 h-4 text-green-400" />
      <span>Saved</span>
    </div>
  );
};
