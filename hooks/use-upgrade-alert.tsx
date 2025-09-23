"use client";

import { useState } from "react";

export const useUpgradeAlert = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openUpgradeAlert = () => setIsOpen(true);
  const closeUpgradeAlert = () => setIsOpen(false);

  return {
    isOpen,
    openUpgradeAlert,
    closeUpgradeAlert,
  };
};