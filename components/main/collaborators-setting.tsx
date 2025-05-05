import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect, useRef, useState } from "react";
import EmailSelector, {
  EmailOption,
  EmailSelectorRef,
} from "../ui/multi-selector";
import CollaboratorUserItem from "./collaborator-user-item";
import { CollaboratorWithMeta } from "@/types/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CollaboratorRole } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "../modals/confirm-modal";

export const CollaboratorsSetting = ({
  documentId,
}: {
  documentId: string;
}) => {
  const emailSelectorRef = useRef<EmailSelectorRef>(null);
  const [collaborators, setCollaborators] = useState<{
    collaborators: CollaboratorWithMeta[];
    owner: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }>({
    collaborators: [], // Initial empty array
    owner: {
      id: "", // Can be empty or null depending on your logic
      name: null,
      email: null,
      image: null,
    },
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const user = useCurrentUser();

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const promise = fetch(
        `/api/socket/documents/${documentId}/collaborators/${collaboratorId}`,
        {
          method: "DELETE",
        }
      ).then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to remove collaborator");
        }
        setCollaborators((prev) => ({
          ...prev,
          collaborators: prev.collaborators.filter(
            (c) => c.id !== collaboratorId
          ),
        }));
      });

      toast.promise(promise, {
        loading: "Removing collaborator...",
        success: "Collaborator removed!",
        error: "Failed to remove collaborator.",
      });
    } catch (error) {
      console.error("Error removing collaborator:", error);
    }
  };

  const handleInvite = async (emails: EmailOption[]) => {
    const loadingToastId = toast.loading(
      emails.length > 1
        ? `Inviting ${emails.length} collaborators...`
        : `Inviting ${emails[0]?.value || "collaborator"}`
    );

    let successCount = 0;
    const failedInvites: { email: string; error: string }[] = [];

    for (let index = 0; index < emails.length; index++) {
      const email = emails[index];

      try {
        toast.loading(
          `Processing ${index + 1}/${emails.length}: ${email.value}`,
          { id: loadingToastId }
        );

        const response = await fetch("/api/socket/collaborators/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.value,
            documentId,
          }),
        });

        const data: CollaboratorWithMeta = await response.json();
        if (!response.ok) {
          throw new Error("Invite failed");
        }

        setCollaborators((prevState) => ({
          ...prevState,
          collaborators: [
            ...prevState.collaborators.filter((c) => c.id !== data.id),
            data,
          ],
        }));

        successCount++;
      } catch (error: any) {
        failedInvites.push({
          email: email.value,
          error: error.message || "Failed to send invitation",
        });
        console.error(error);
      }
    }

    // Dismiss loading toast
    toast.dismiss(loadingToastId);

    // Show summary toast
    if (successCount > 0 || failedInvites.length > 0) {
      if (failedInvites.length === 0) {
        toast.success(
          emails.length > 1
            ? `${successCount} collaborators invited successfully!`
            : `${emails[0]?.value} invited successfully`
        );
      } else {
        toast[successCount > 0 ? "warning" : "error"](
          `${successCount} succeeded, ${failedInvites.length} failed`,
          {
            description:
              failedInvites.length > 0
                ? `Failed: ${failedInvites.map((f) => f.email).join(", ")}`
                : undefined,
            duration: 5000,
          }
        );
      }
    }
  };

  // Function to handle role change
  const handleRoleChange = async (
    collaboratorId: string,
    newRole: CollaboratorRole
  ) => {
    try {
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
        setCollaborators((prevState) => ({
          ...prevState,
          collaborators: prevState.collaborators.map((collab) =>
            collab.id === collaboratorId ? { ...collab, role: newRole } : collab
          ),
        }));
      });

      toast.promise(promise, {
        loading: "Updating role...",
        success: "Role updated!",
        error: "Failed to update role.",
      });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const response = await fetch(
          `/api/socket/documents/${documentId}/collaborators`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch collaborators");
        }

        const data = await response.json();
        console.log("DATA: ", JSON.stringify(data));
        setCollaborators(data);
      } catch (error) {
        setIsLoading(false);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollaborators();
  }, [documentId]);

  // Check if current user is the owner
  const isOwner = user?.id === collaborators.owner.id;

  return (
    <div className="">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-full">
          <EmailSelector
            ref={emailSelectorRef}
            onInvite={handleInvite}
            placeholder="Enter email addresses..."
            className="mb-4"
          />

          <p className="text-sm text-muted-foreground mt-2">
            Type an email address and press Enter to add it to the list.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <CollaboratorUserItem
            name={collaborators.owner.name as string}
            email={collaborators.owner.email as string}
            label={
              user?.id === collaborators.owner.id ? "(Owner) (You)" : "(Owner)"
            }
          />
          <span
            className={cn(
              "text-gray-700 dark:text-gray-400 text-sm bg-primary/5 px-2 rounded-lg",
              isOwner ? "w-[8.5rem] py-[6px]" : "w-24 py-1"
            )}
          >
            Full Access
          </span>
        </div>

        {collaborators.collaborators.length > 0 && <Separator />}

        {collaborators?.collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between"
          >
            <CollaboratorUserItem
              name={collaborator.user.name as string}
              email={collaborator.user.email as string}
              label={
                collaborator.isVerified
                  ? user?.id === collaborator.user.id
                    ? "(Verified) (You)"
                    : "(Verified)"
                  : "(Invited)"
              }
            />

            {isOwner ? (
              <div onPointerDown={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Select
                    value={collaborator.role}
                    onValueChange={(value) =>
                      handleRoleChange(
                        collaborator.id,
                        value as CollaboratorRole
                      )
                    }
                    disabled={!isOwner}
                  >
                    <SelectTrigger className="w-24 h-8 text-sm text-gray-700 focus:ring-0 focus:ring-offset-0 focus:border-gray-600 dark:border-gray-600 dark:text-gray-400">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                      <SelectItem value={CollaboratorRole.VIEWER}>
                        Viewer
                      </SelectItem>
                      <SelectItem value={CollaboratorRole.EDITOR}>
                        Editor
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <ConfirmModal
                    onConfirm={() => handleRemoveCollaborator(collaborator.id)}
                    title="Remove Collaborator Access?"
                    description={
                      <>
                        This action will immediately revoke access for:
                        <br />
                        <span className="text-orange-500 dark:text-orange-400 font-medium">
                          {collaborator.user.name || "User"} (
                          {collaborator.user.email})
                        </span>
                        <ul className="list-disc pl-6 mt-1">
                          <li>All document permissions will be removed</li>
                          <li className="text-orange-500 dark:text-orange-400">
                            Immediate loss of editing/viewing capabilities
                          </li>
                          <li>
                            Collaborator will disappear from all shared
                            instances
                          </li>
                          <li>Can be re-added later if needed</li>
                        </ul>
                      </>
                    }
                  >
                    <div
                      role="button"
                      className="text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-600 p-2 rounded-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </div>
                  </ConfirmModal>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 dark:text-gray-400 w-24 bg-primary/5 px-2 py-1 rounded-lg">
                {collaborator.role === CollaboratorRole.EDITOR
                  ? "Editor"
                  : "Viewer"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
