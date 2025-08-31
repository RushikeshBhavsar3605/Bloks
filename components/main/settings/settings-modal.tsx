"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SettingsContent } from "./settings-content";

export const SettingsModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const modal = searchParams?.get("modal");
    setIsOpen(modal === "settings");
  }, [searchParams]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams?.toString());
    params.delete("modal");
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.push(newUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden border-0 shadow-none">
        <SettingsContent />
      </DialogContent>
    </Dialog>
  );
};