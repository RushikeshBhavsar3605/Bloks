import { CollaboratorWithMeta } from "@/types/shared";
import { CollaboratorRole } from "@prisma/client";
import { useCollaborators } from "@/hooks/use-collaborators";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";
import { useSocket } from "@/components/providers/socket-provider";
import { getCollaborator } from "@/actions/collaborators/get-collaborator";
import { Mail, Settings, UserPlus, Globe, Copy, Check } from "lucide-react";
import { CollaboratorItem } from "./collaborator-item";
import { DocumentDeleteSection } from "./document-delete-section";
import { useOrigin } from "@/hooks/use-origin";
import { publishDocument } from "@/actions/documents/publish-document";
import { unpublishDocument } from "@/actions/documents/unpublish-document";
import { useUpgradeAlert } from "@/hooks/use-upgrade-alert";
import { UpgradeAlertModal } from "@/components/modals/upgrade-alert-modal";

export const CollaboratorsSetting = ({
  documentId,
  documentOwnerId,
  documentTitle,
  documentIcon,
  documentCreatedAt,
  documentIsArchived,
  documentIsPublished,
  updatePublishStatus,
}: {
  documentId: string;
  documentOwnerId: string;
  documentTitle?: string;
  documentIcon?: string | null;
  documentCreatedAt: Date;
  documentIsArchived: boolean;
  documentIsPublished: boolean;
  updatePublishStatus: (isPublished: boolean) => void;
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const user = useCurrentUser();
  const { owner, isLoading, error, collaborators, setCollaborators } =
    useCollaborators(documentId);
  const isOwner = user?.id === owner?.id;
  const { socket } = useSocket();
  const origin = useOrigin();
  const {
    isOpen: isUpgradeAlertOpen,
    openUpgradeAlert,
    closeUpgradeAlert,
  } = useUpgradeAlert();

  // Hydration guard
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleCollaboratorInvite = async (data: {
      invited: boolean;
      userExist: boolean;
      newCollaborator: {
        userName: string;
        email: string;
        documentId: string;
        documentTitle: string;
        addedBy: { name: string; id: string };
      };
    }) => {
      console.log(
        `Invite by ${data.newCollaborator.addedBy.name} user: ${data.newCollaborator.userName}`
      );
      if (!data.invited) return;

      const newCollaborator: CollaboratorWithMeta | null =
        await getCollaborator({
          email: data.newCollaborator.email,
          documentId: data.newCollaborator.documentId,
        });

      if (!newCollaborator) return;

      setCollaborators((prevState) => [
        ...prevState.filter((c) => c.id !== newCollaborator.id),
        newCollaborator,
      ]);
    };

    const handleCollaboratorVerified = (payload: {
      data: CollaboratorWithMeta;
    }) => {
      const verifiedCollaborator = payload.data;
      setCollaborators((prevState) => [
        ...prevState.filter((c) => c.id !== verifiedCollaborator.id),
        verifiedCollaborator,
      ]);
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
      setCollaborators((prevState) => [
        ...prevState.filter((c) => c.user.id !== data.removedUser.id),
      ]);
    };

    const handleCollaboratorRoleChange = (data: {
      documentId: string;
      updatedBy: {
        id: string;
        name: string;
      };
      updatedUser: {
        id: string;
        name: string;
      };
      newRole: CollaboratorRole;
      prevRole: CollaboratorRole;
    }) => {
      setCollaborators((prevState) =>
        prevState.map((c) =>
          c.user.id === data.updatedUser.id ? { ...c, role: data.newRole } : c
        )
      );
    };

    // console.log("🎧 Attaching socket listeners for user:", user?.name);

    socket.on("collaborator:settings:invite", handleCollaboratorInvite);
    socket.on("collaborator:settings:verified", handleCollaboratorVerified);
    socket.on("collaborator:settings:remove", handleCollaboratorRemove);
    socket.on("collaborator:settings:role", handleCollaboratorRoleChange);

    return () => {
      socket.off("collaborator:settings:invite", handleCollaboratorInvite);
      socket.off("collaborator:settings:verified", handleCollaboratorVerified);
      socket.off("collaborator:settings:remove", handleCollaboratorRemove);
      socket.off("collaborator:settings:role", handleCollaboratorRoleChange);
    };
  }, [socket, user?.id, setCollaborators, collaborators]);

  // Function to handle invite collaborator
  const handleInviteByEmail = async () => {
    if (!emailInput.trim()) return;

    // Initial loading toast
    const loadingToastId = toast.loading(`Inviting ${emailInput}...`);

    try {
      // Send invite request
      const response = await fetch("/api/socket/collaborators/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput,
          documentId,
        }),
      });

      // Parse response
      const data: {
        invited: boolean;
        newCollaborator: CollaboratorWithMeta;
      } = await response.json();

      if (!response.ok) throw new Error("Invite failed");

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // If added as collaborator, show success
      if (data.newCollaborator) {
        toast.success(`${emailInput} invited successfully`);
      } else {
        toast.success(`${emailInput} invited to join Jotion & collaborate`);
      }

      // Clear input
      setEmailInput("");
    } catch (error: any) {
      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      toast.error(`Failed to invite ${emailInput}`, {
        description: error.message || "Failed to send invitation",
      });
      console.error(error);
    }
  };

  // Function to handle role change
  const handleRoleChange = async (
    collaboratorId: string,
    newRole: CollaboratorRole
  ) => {
    const promise = fetch(
      `/api/socket/documents/${documentId}/collaborators/${collaboratorId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
        }),
      }
    ).then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update collaborator role");
      }

      // Update the local state after successful API call
      setCollaborators((prevState) =>
        prevState.map((collab) =>
          collab.id === collaboratorId ? { ...collab, role: newRole } : collab
        )
      );
    });

    toast.promise(promise, {
      loading: "Updating role...",
      success: "Role updated!",
      error: "Failed to update role.",
    });
  };

  // Function to handle remove collaborator
  const handleRemoveCollaborator = async (collaboratorId: string) => {
    const promise = fetch(
      `/api/socket/documents/${documentId}/collaborators/${collaboratorId}`,
      {
        method: "DELETE",
      }
    ).then(async (response) => {
      if (!response.ok) {
        throw new Error("Failed to remove collaborator");
      }

      // Update the local state after successful API call
      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
    });

    toast.promise(promise, {
      loading: "Removing collaborator...",
      success: "Collaborator removed!",
      error: "Failed to remove collaborator.",
    });
  };

  // Function to handle publish document
  const handlePublish = async () => {
    setIsSubmitting(true);

    try {
      const result = await publishDocument(documentId);

      if (!result.success) {
        if ('upgradeRequired' in result.data && result.data.upgradeRequired) {
          openUpgradeAlert();
          toast.error("Upgrade required to publish more documents");
        } else {
          toast.error("Failed to publish document");
        }
        return;
      }

      updatePublishStatus(true);
      toast.success("Document published successfully!");
    } catch (error) {
      console.error("Error publishing document:", error);
      toast.error("Failed to publish document");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle unpublish document
  const handleUnpublish = async () => {
    setIsSubmitting(true);

    const updatedDocument = unpublishDocument(documentId);

    toast.promise(updatedDocument, {
      loading: "Unpublishing...",
      success: "Document unpublished successfully!",
      error: "Failed to unpublish document.",
    });

    updatedDocument
      .then(() => {
        updatePublishStatus(false);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Function to copy URL to clipboard
  const handleCopyUrl = () => {
    const url = `${origin}/preview/${documentId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);

    toast.success("URL copied to clipboard!");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  if (error) return <div>Error: {error}</div>;
  if (!owner) return <div>No owner data available.</div>;

  // Combine owner and collaborators for display
  const ownerAsCollaborator: CollaboratorWithMeta = {
    id: `owner-${owner.id}`,
    role: "EDITOR" as CollaboratorRole,
    documentId: documentId,
    userId: owner.id,
    createdAt: documentCreatedAt,
    isVerified: documentCreatedAt,
    user: {
      id: owner.id,
      name: owner.name,
      email: owner.email || "",
      image: owner.image,
    },
  };

  const allCollaborators = [ownerAsCollaborator, ...collaborators];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-[#1E1E20]">
        <div className="w-9 h-9 bg-gray-100 dark:bg-[#2A2A2E] rounded-lg flex items-center justify-center">
          <Settings className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Document Settings
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{documentIcon || "📄"}</span>
            <span>{documentTitle || "Untitled"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto custom-scrollbar">
        {/* Publish/Unpublish Section */}
        {isOwner && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Public sharing
              </h3>
              {documentIsPublished && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                  <Globe className="h-3 w-3" />
                  Live
                </div>
              )}
            </div>

            {documentIsPublished ? (
              <div className="space-y-3">
                {/* Primary sharing controls */}
                <div className="p-4 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-[#2A2A2E] rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Public link
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Anyone with link can view
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 px-3 py-2.5 text-sm bg-gray-50 dark:bg-[#2A2A2E] border border-gray-300 dark:border-[#323236] rounded-lg text-gray-900 dark:text-white truncate focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={`${origin}/preview/${documentId}`}
                        readOnly
                      />
                      <button
                        onClick={handleCopyUrl}
                        disabled={copied}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Secondary destructive action */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1A1A1C] border border-gray-200 dark:border-[#2A2A2E] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <Globe className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Stop public sharing
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Make document private
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleUnpublish}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        Unpublishing...
                      </>
                    ) : (
                      "Unpublish"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#1A1A1C] border border-gray-200 dark:border-[#2A2A2E] rounded-lg">
                <div className="w-10 h-10 bg-gray-100 dark:bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Publish to web
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Share your work with anyone on the internet
                  </p>
                </div>
                <button
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish"
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Invite People Section */}
        {isOwner ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Invite people
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleInviteByEmail()}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1C] border border-gray-300 dark:border-[#2A2A2E] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleInviteByEmail}
                disabled={!emailInput.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#1A1A1C] border border-gray-200 dark:border-[#2A2A2E] rounded-lg">
            <div className="w-8 h-8 bg-gray-100 dark:bg-[#2A2A2E] rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Owner permissions required
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Only the document owner can invite new collaborators
              </p>
            </div>
          </div>
        )}

        {/* Collaborators List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              People with access
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {allCollaborators.length} people
            </span>
          </div>

          <CollaboratorItem
            collaborators={allCollaborators}
            currentUserId={user?.id}
            isOwner={documentOwnerId === user?.id}
            handleRoleChange={handleRoleChange}
            handleRemoveCollaborator={handleRemoveCollaborator}
          />
        </div>

        {/* Advanced Settings */}
        <div className="pt-4 border-t border-gray-200 dark:border-[#1E1E20] space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Advanced settings
          </h3>

          <DocumentDeleteSection
            documentId={documentId}
            documentTitle={documentTitle}
            isOwner={isOwner}
            documentIsArchived={documentIsArchived}
          />
        </div>
      </div>

      {/* Upgrade Alert Modal */}
      <UpgradeAlertModal
        isOpen={isUpgradeAlertOpen}
        onClose={closeUpgradeAlert}
      />
    </div>
  );
};
