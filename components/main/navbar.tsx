"use client";

import {
  Settings,
  Download,
  FileText,
  FileImage,
  ChevronsRight,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Title } from "./title";
import { SocketIndicator } from "../socket-indicator";
import { useSocket } from "../providers/socket-provider";
import { SaveIndicator } from "../save-indicator";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { CollaboratorsSetting } from "./collaborators/collaborators-setting";
import { CollaboratorWithMeta, DocumentWithMeta } from "@/types/shared";
import { toast } from "sonner";
import { Banner } from "./banner";
import { Collaborator, Document } from "@prisma/client";
import { Menu } from "./menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useUpgradeAlert } from "@/hooks/use-upgrade-alert";
import { UpgradeAlertModal } from "../modals/upgrade-alert-modal";
import { getUserSubscription } from "@/actions/users/get-user-subscription";
import {
  downloadDocumentAsMarkdown,
  downloadDocumentAsHTML,
} from "@/actions/documents/download-document";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

const getAvatarInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getAvatarColor = (id: string) => {
  const colors = [
    "bg-blue-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-red-600",
    "bg-yellow-600",
    "bg-indigo-600",
    "bg-pink-600",
    "bg-gray-600",
  ];
  const index =
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const router = useRouter();
  const { socket, joinDocument } = useSocket();
  const params = useParams();
  const [document, setDocument] = useState<
    DocumentWithMeta & { collaborators: CollaboratorWithMeta[] }
  >();
  const user = useCurrentUser();
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "team">("free");
  const {
    isOpen: isUpgradeAlertOpen,
    openUpgradeAlert,
    closeUpgradeAlert,
  } = useUpgradeAlert();

  const fetchDocuments = useCallback(async () => {
    try {
      if (!params?.documentId) {
        return router.push("/documents");
      }

      const response = await fetch(
        `/api/socket/documents/${params?.documentId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as DocumentWithMeta & {
        collaborators: CollaboratorWithMeta[];
      };

      const owner: CollaboratorWithMeta & { isOwner: boolean } = {
        id: `owner-${data.userId}`,
        userId: data.userId,
        documentId: data.id,
        role: "EDITOR",
        createdAt: data.createdAt,
        isVerified: data.createdAt,
        isOwner: true,
        user: {
          id: data.userId,
          name: data.owner.name,
          email: data.owner.email as string,
          image: data.owner.image,
        },
      };

      data.collaborators.push(owner);

      setDocument(data);
    } catch (error) {
      console.error("Failed to fetch document:", error);
      toast.error("Failed to load document");
      router.push("/documents");
    }
  }, [params?.documentId, router]);

  // Fetch user subscription plan
  const fetchUserPlan = useCallback(async () => {
    if (!user?.id) return;

    try {
      const plan = await getUserSubscription(user.id);
      setUserPlan(plan);
    } catch (error) {
      console.error("Failed to fetch user plan:", error);
      setUserPlan("free"); // Default to free on error
    }
  }, [user?.id]);

  // Download handlers
  const handleDownloadClick = () => {
    if (userPlan === "free") {
      openUpgradeAlert();
      return;
    }
    // For pro and team plans, the dropdown will handle the options
  };

  const handleMarkdownDownload = async () => {
    if (!document?.id) {
      toast.error("Document not found");
      return;
    }

    try {
      toast.loading("Preparing download...");

      const result = await downloadDocumentAsMarkdown(document.id);

      if (!result.success) {
        toast.error(result.error || "Failed to download document");
        return;
      }

      // Create blob and download file
      const blob = new Blob([result.data!.content], {
        type: result.data!.mimeType,
      });

      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = result.data!.filename;

      // Trigger download
      window.document.body.appendChild(link);
      link.click();

      // Cleanup
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(); // Dismiss loading toast
      toast.success("Document downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.dismiss(); // Dismiss loading toast
      toast.error("Failed to download document");
    }
  };

  const handleHTMLDownload = async () => {
    if (userPlan !== "team") {
      toast.error("HTML download requires Team plan");
      return;
    }

    if (!document?.id) {
      toast.error("Document not found");
      return;
    }

    try {
      toast.loading("Generating HTML...");

      const result = await downloadDocumentAsHTML(document.id);

      if (!result.success) {
        toast.error(result.error || "Failed to generate HTML");
        return;
      }

      if (!result.data?.content) {
        toast.error("No HTML content received");
        return;
      }

      // Create blob and download file
      const blob = new Blob([result.data.content], {
        type: result.data.mimeType,
      });

      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = result.data.filename;

      // Trigger download
      window.document.body.appendChild(link);
      link.click();

      // Cleanup
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(); // Dismiss loading toast
      toast.success("HTML downloaded successfully!");
    } catch (error) {
      console.error("HTML download error:", error);
      toast.dismiss(); // Dismiss loading toast
      toast.error("Failed to download HTML");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  // Join document socket room
  useEffect(() => {
    if (socket && document?.id && user?.id) {
      console.log("Joining document room from navbar:", document.id, user.name);
      joinDocument(document.id, user.id);
    }
  }, [socket, document?.id, user?.id, joinDocument]);

  useEffect(() => {
    if (!socket || !document?.id) return;

    const handleDocHeaderChange = ({
      documentId,
      userId,
      title,
      icon,
    }: {
      documentId: string;
      userId: string;
      title?: string;
      icon?: string;
    }) => {
      console.log("Real-time title change", JSON.stringify(title));
      setDocument((doc) => {
        if (!doc) return doc;
        return {
          ...doc,
          ...(title !== undefined && { title }),
          ...(icon !== undefined && { icon }),
        };
      });
    };

    const handleArchived = (id: string) => {
      setDocument((prev) => (prev ? { ...prev, isArchived: true } : undefined));
    };

    const handleRestore = (data: {
      restoredDocument: Document & {
        owner: {
          name: string | null;
          image: string | null;
        };
        collaborators: Collaborator[];
      };
      restoredIds: string[];
    }) => {
      const restoredIdsSet = new Set(data.restoredIds);

      if (restoredIdsSet.has(document.id)) {
        setDocument((prev) =>
          prev ? { ...prev, isArchived: false } : undefined
        );
      }
    };

    const handleCollaboratorVerified = (payload: {
      data: CollaboratorWithMeta;
    }) => {
      const verifiedCollaborator = payload.data;

      setDocument((prevState) =>
        prevState
          ? {
              ...prevState,
              collaborators: [
                ...prevState.collaborators.filter(
                  (c) => c.id !== verifiedCollaborator.id
                ),
                verifiedCollaborator,
              ],
            }
          : prevState
      );
    };

    const handleCollaboratorRemove = (data: {
      addedBy: {
        name: string;
        id: string;
      };
      documentId: string;
      documentTitle: string;
      removedUser: {
        name: string;
        id: string;
      };
    }) => {
      setDocument((prevState) =>
        prevState
          ? {
              ...prevState,
              collaborators: [
                ...prevState?.collaborators.filter(
                  (c) => c.userId !== data.removedUser.id
                ),
              ],
            }
          : prevState
      );
    };

    const docHeaderChange = `doc-header-change`;

    socket.on(docHeaderChange, handleDocHeaderChange);
    socket.on(`document:archived:${document.id}`, handleArchived);
    socket.on(
      `document:restore:${document.parentDocumentId || "root"}`,
      handleRestore
    );
    socket.on("collaborator:settings:verified", handleCollaboratorVerified);
    socket.on("collaborator:settings:remove", handleCollaboratorRemove);

    return () => {
      socket.off(docHeaderChange, handleDocHeaderChange);
      socket.off(`document:archived:${document.id}`, handleArchived);
      socket.off(
        `document:restore:${document.parentDocumentId || "root"}`,
        handleRestore
      );
      socket.off("collaborator:settings:verified", handleCollaboratorVerified);
      socket.off("collaborator:settings:remove", handleCollaboratorRemove);
    };
  }, [socket, document]);

  const updatePublishStatus = (isPublished: boolean) => {
    if (!document) {
      return;
    }

    setDocument({ ...document, isPublished });
  };

  if (document === undefined) {
    return (
      <header className="h-[72px] flex items-center justify-between px-4 border-b border-gray-200 dark:border-[#1E1E20] bg-background dark:bg-[#0B0B0F]">
        <div className="flex items-center gap-4">
          {isCollapsed && <Skeleton className="h-7 w-7" />}
          <Skeleton className="h-7 w-7" />
          <Title.Skeleton />
        </div>
        <div className="flex items-center gap-3">
          <Menu.Skeleton />
        </div>
      </header>
    );
  }

  if (document === null) {
    return null;
  }

  return (
    <>
      <header className="h-[66px] flex items-center justify-between px-4 border-b border-gray-200 dark:border-[#1E1E20] bg-background dark:bg-[#0B0B0F]">
        <div className="flex items-center gap-2">
          {isCollapsed && (
            <ChevronsRight
              role="button"
              onClick={onResetWidth}
              className="w-6 h-6 text-muted-foreground text-gray-600 dark:text-gray-400 rounded-sm hover:bg-gray-200 dark:hover:bg-[#1E1E20]"
            />
          )}
          <div className="flex items-center gap-3">
            <span className="text-2xl">{document.icon || "📄"}</span>
            <Title initialData={document} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save and Socket Indicators */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
            <SaveIndicator />
            <SocketIndicator />
          </div>
          <div className="hidden sm:flex w-px h-6 bg-gray-200 dark:bg-[#1E1E20] mx-2" />
          {/* Collaborators */}
          {document.collaborators.length > 1 && (
            <div className="flex items-center -space-x-2">
              {document.collaborators
                ?.slice(0, 3)
                .filter((c) => c.userId !== user?.id)
                .map((collaborator, index) => {
                  return (
                    <div key={collaborator.id}>
                      {collaborator.user.image ? (
                        <img
                          src={collaborator.user.image}
                          alt={collaborator.user.name || "User"}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-7 h-7 ${getAvatarColor(
                            collaborator.id
                          )} rounded-full flex items-center justify-center text-xs font-medium text-white`}
                          title={collaborator.user.name || "Collaborator"}
                        >
                          {getAvatarInitials(collaborator.user.name || "User")}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Download Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span className="hidden sm:block">Download</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={
                  userPlan !== "free" ? handleMarkdownDownload : undefined
                }
                disabled={userPlan === "free"}
                className={`flex items-center gap-2 ${
                  userPlan !== "free"
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }`}
                title={userPlan === "free" ? "Upgrade to unlock" : ""}
              >
                <FileText className="w-4 h-4" />
                Markdown
                {userPlan === "free" && (
                  <span className="ml-auto text-xs text-gray-500">
                    Upgrade to unlock
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={userPlan === "team" ? handleHTMLDownload : undefined}
                disabled={userPlan !== "team"}
                className={`flex items-center gap-2 ${
                  userPlan === "team"
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }`}
                title={userPlan !== "team" ? "Upgrade to unlock" : ""}
              >
                <FileImage className="w-4 h-4" />
                HTML
                {userPlan !== "team" && (
                  <span className="ml-auto text-xs text-gray-500">
                    Upgrade to unlock
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Document Settings Button */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:block">Settings</span>
              </button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-3xl bg-background dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] text-gray-900 dark:text-white">
              <CollaboratorsSetting
                documentId={document.id}
                documentOwnerId={document.userId}
                documentTitle={document.title}
                documentIcon={document.icon}
                documentCreatedAt={document.createdAt}
                documentIsArchived={document.isArchived}
                documentIsPublished={document.isPublished}
                updatePublishStatus={updatePublishStatus}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {document.isArchived && (
        <Banner
          documentId={document.id}
          documentTitle={document.title}
          isOwner={document.isOwner}
        />
      )}

      {/* Upgrade Alert Modal */}
      <UpgradeAlertModal
        isOpen={isUpgradeAlertOpen}
        onClose={closeUpgradeAlert}
      />
    </>
  );
};
