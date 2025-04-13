"use client";

import { useSaveStatus } from "@/hooks/use-save-status";
import { Badge } from "./ui/badge";

export const SaveIndicator = () => {
  const { status } = useSaveStatus();
  if (status === "Saving") {
    return <Badge variant="saving">Saving</Badge>;
  }

  return <Badge variant="saved">Saved</Badge>;
};
