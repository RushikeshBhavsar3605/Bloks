import { CollaboratorWithMeta } from "@/types/shared";
import { useEffect, useState } from "react";

export const useCollaborators = (documentId: string) => {
  const [collaborators, setCollaborators] = useState<CollaboratorWithMeta[]>(
    []
  );
  const [owner, setOwner] = useState<{
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setCollaborators(data.collaborators);
        setOwner(data.owner);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollaborators();
  }, [documentId]);

  return { owner, isLoading, error, collaborators, setCollaborators };
};
