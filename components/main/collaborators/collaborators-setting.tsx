import { CollaboratorWithMeta } from "@/types/shared";
import { CollaboratorRole } from "@prisma/client";
import { CollaboratorsList } from "./collaborators-list";
import { useCollaborators } from "@/hooks/use-collaborators";
import { useCurrentUser } from "@/hooks/use-current-user";
import EmailSelector, {
  EmailOption,
  EmailSelectorRef,
} from "@/components/ui/multi-selector";
import { useRef } from "react";
import { toast } from "sonner";

export const CollaboratorsSetting = ({
  documentId,
}: {
  documentId: string;
}) => {
  const emailSelectorRef = useRef<EmailSelectorRef>(null);
  const { owner, isLoading, error, collaborators, setCollaborators } =
    useCollaborators(documentId);
  const user = useCurrentUser();
  const isOwner = user?.id === owner?.id;

  // Function to handle invite collaborators
  const handleInvite = async (emails: EmailOption[]) => {
    // Initial loading toast
    const loadingToastId = toast.loading(
      emails.length > 1
        ? `Inviting ${emails.length} collaborators...`
        : `Inviting ${emails[0]?.value || "collaborator"}`
    );

    let successCount = 0;
    const failedInvites: { email: string; error: string }[] = [];
    const successfulInvites: { email: string }[] = [];

    // Process each email one by one
    for (let index = 0; index < emails.length; index++) {
      const email = emails[index];

      try {
        // Update toast progress
        toast.loading(
          `Processing ${index + 1}/${emails.length}: ${email.value}`,
          { id: loadingToastId }
        );

        // Send invite request
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

        // Parse response
        const data: {
          invited: boolean;
          newCollaborator: CollaboratorWithMeta;
        } = await response.json();
        if (!response.ok) throw new Error("Invite failed");

        // If added as collaborator, update state
        if (data.newCollaborator) {
          setCollaborators((prevState) => [
            ...prevState.filter((c) => c.id !== data.newCollaborator.id),
            data.newCollaborator,
          ]);

          successfulInvites.push({ email: email.value });
          successCount++;
        } else {
          toast.success(`${email.value} invited to join Jotion & collaborate`);
        }
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

    // Final success/failure summary toast
    if (successCount > 0 || failedInvites.length > 0) {
      if (failedInvites.length === 0)
        toast.success(
          successfulInvites.length > 1
            ? `${successCount} collaborators invited successfully!`
            : `${successfulInvites[0]?.email} invited successfully`
        );
      else
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

  if (isLoading) return <div>Loading Collaborators...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!owner) return <div>No owner data available.</div>;

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

      <CollaboratorsList
        collaborators={collaborators}
        owner={owner}
        isOwner={isOwner}
        handleRoleChange={handleRoleChange}
        handleRemoveCollaborator={handleRemoveCollaborator}
        currentUserId={user?.id}
      />
    </div>
  );
};
