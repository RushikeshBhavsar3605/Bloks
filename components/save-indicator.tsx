"use client";

import { useSaveStatus } from "@/hooks/use-save-status";
import { Badge } from "./ui/badge";

export const SaveIndicator = () => {
  const { status, error } = useSaveStatus();
  
  if (status === "Saving") {
    return <Badge variant="saving">Saving...</Badge>;
  }
  
  if (status === "Error") {
    return <Badge variant="destructive" title={error}>Save Error</Badge>;
  }

  return <Badge variant="saved">Saved</Badge>;
};
