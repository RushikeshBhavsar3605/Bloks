"use client";

import { Navigation } from "@/components/main/navigation";
import { SearchCommand } from "@/components/search-command";
import { CollaboratorInviteListener } from "@/components/socket/collaborator-invite-listener";
import { Spinner } from "@/components/spinner";
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
    <div className="h-full flex dark:bg-[#1F1F1F]">
      <Navigation />
      <main className="flex-1 h-full overflow-y-auto">
        <SearchCommand />
        <CollaboratorInviteListener />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
