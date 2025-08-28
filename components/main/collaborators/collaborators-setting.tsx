import { CollaboratorWithMeta } from "@/types/shared";
import { CollaboratorRole } from "@prisma/client";
import { useCollaborators } from "@/hooks/use-collaborators";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";
import { useSocket } from "@/components/providers/socket-provider";
import { getCollaborator } from "@/actions/collaborators/get-collaborator";
import { Mail, Settings, UserPlus } from "lucide-react";
import { CollaboratorItem } from "./collaborator-item";
import { DocumentDeleteSection } from "./document-delete-section";

export const CollaboratorsSetting = ({
  documentId,
  documentOwnerId,
  documentTitle,
  documentIcon,
  documentCreatedAt,
}: {
  documentId: string;
  documentOwnerId: string;
  documentTitle?: string;
  documentIcon?: string | null;
  documentCreatedAt: Date;
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const user = useCurrentUser();
  const { owner, isLoading, error, collaborators, setCollaborators } =
    useCollaborators(documentId);
  const isOwner = user?.id === owner?.id;
  const { socket } = useSocket();

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

      <div className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
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
          />
        </div>
      </div>
    </div>
  );
};
