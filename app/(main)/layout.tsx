"use client";

import { Navigation } from "@/components/main/navigation";
// Removed SearchCommand - now using integrated search in PageHeader
import { Spinner } from "@/components/spinner";
import { CollaboratorInviteToast } from "@/lib/toasts/collaborator-invite-toast";
import { CollaboratorRemoveToast } from "@/lib/toasts/collaborator-remove-toast";
import { CollaboratorUpdateToast } from "@/lib/toasts/collaborator-update-toast";
import { ModalProvider } from "@/components/providers/modal-provider";
import { useSession } from "next-auth/react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex dark:bg-[#0B0B0F]">
      <Navigation />
      <main className="flex-1 h-full overflow-y-auto">
        {/* Search functionality now integrated in PageHeader */}
        <CollaboratorInviteToast />
        <CollaboratorRemoveToast />
        <CollaboratorUpdateToast />
        <ModalProvider />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
