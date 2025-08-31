"use client";

import { useEffect, useState } from "react";
import { SettingsModal } from "../modals/settings-modal";
import { SettingsModal as NewSettingsModal } from "../main/settings/settings-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <SettingsModal />
      <NewSettingsModal />
    </>
  );
};
