import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect, useRef, useState } from "react";
import EmailSelector, {
  EmailOption,
  EmailSelectorRef,
} from "../ui/multi-selector";
import CollaboratorUserItem from "./collaborator-user-item";
import { CollaboratorWithMeta } from "@/types/shared";

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

  const handleInvite = (emails: EmailOption[]) => {
    console.log(
      "Inviting emails:",
      emails.map((email) => email.value)
    );
    emails.map(async (email) => {
      try {
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

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to add collaborator");
        }

        const data: CollaboratorWithMeta = await response.json();
        setCollaborators((prevState) => ({
          ...prevState,
          collaborators: [...prevState.collaborators, data],
        }));
      } catch (error: any) {
        setIsLoading(false);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    });
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
        <CollaboratorUserItem
          name={collaborators.owner.name as string}
          email={collaborators.owner.email as string}
          label={
            user?.id === collaborators.owner.id ? "(Owner) (You)" : "(Owner)"
          }
          role="OWNER"
        />

        {collaborators?.collaborators.map((collaborator) => (
          <div key={collaborator.id}>
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
              role={collaborator.role}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
