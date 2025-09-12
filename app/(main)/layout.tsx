"use client";

import { Navigation } from "@/components/main/navigation";
// Removed SearchCommand - now using integrated search in PageHeader
import { Spinner } from "@/components/spinner";
import { CollaboratorInviteToast } from "@/lib/toasts/collaborator-invite-toast";
import { CollaboratorRemoveToast } from "@/lib/toasts/collaborator-remove-toast";
import { CollaboratorUpdateToast } from "@/lib/toasts/collaborator-update-toast";
import { ModalProvider } from "@/components/providers/modal-provider";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SearchModal } from "@/components/search/search-modal";
import { toast } from "sonner";
import { TrashModal } from "@/components/modals/trash-modal";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();

  const router = useRouter();
  const searchParams = useSearchParams();
  const isSearchModalOpen = searchParams?.get("modal") === "search";
  const isTrashModalOpen = searchParams?.get("modal") === "trash";

  const openSearchModal = () => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams);
    params.set("modal", "search");
    router.push(`?${params.toString()}`);
  };

  const closeModal = () => {
    router.back();
  };

  const openTrashModal = () => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams);
    params.set("modal", "trash");
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearchModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchParams]);

  const onCreate = () => {
    const promise = fetch("/api/socket/documents", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Untitled" }),
    });

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note.",
    });
  };

  if (status === "loading") {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex dark:bg-[#0B0B0F]">
      <Navigation
        openSearchModal={openSearchModal}
        openTrashModal={openTrashModal}
      />
      <main className="flex-1 h-full overflow-y-auto">
        {/* Search functionality now integrated in PageHeader */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={closeModal}
          onNavigate={() => {}}
          onDocumentSelect={(docId: string) => {
            if (docId === "new") {
              onCreate();
            } else {
              router.push(`/documents/${docId}`);
            }
          }}
        />
        <TrashModal isOpen={isTrashModalOpen} onClose={closeModal} />
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
