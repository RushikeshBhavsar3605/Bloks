import { CollaboratorWithMeta } from "@/types/shared";
import { CollaboratorRole } from "@prisma/client";
import { CollaboratorsList } from "./collaborators-list";
import { useCollaborators } from "@/hooks/use-collaborators";
import { useCurrentUser } from "@/hooks/use-current-user";
import EmailSelector, {
  EmailOption,
  EmailSelectorRef,
} from "@/components/ui/multi-selector";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";
import { useSocket } from "@/components/providers/socket-provider";
import { getCollaborator } from "@/actions/collaborators/get-collaborator";

export const CollaboratorsSetting = ({
  documentId,
}: {
  documentId: string;
}) => {
  const emailSelectorRef = useRef<EmailSelectorRef>(null);
  const user = useCurrentUser();
  const { owner, isLoading, error, collaborators, setCollaborators } =
    useCollaborators(documentId);
  const isOwner = user?.id === owner?.id;
  const { socket } = useSocket();

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

  if (isLoading)
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

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
