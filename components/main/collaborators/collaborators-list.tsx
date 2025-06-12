import { CollaboratorWithMeta } from "@/types/shared";
import CollaboratorUserItem from "./collaborator-user-item";
import { CollaboratorRole } from "@prisma/client";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface CollaboratorsListProps {
  collaborators: CollaboratorWithMeta[];
  owner: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  isOwner: boolean;
  handleRoleChange: (collaboratorId: string, newRole: CollaboratorRole) => void;
  handleRemoveCollaborator: (collaboratorId: string) => void;
  currentUserId?: string;
}

export const CollaboratorsList = ({
  collaborators,
  owner,
  isOwner,
  handleRoleChange,
  handleRemoveCollaborator,
  currentUserId,
}: CollaboratorsListProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <CollaboratorUserItem
          name={owner.name as string}
          email={owner.email as string}
          label={currentUserId === owner.id ? "(Owner) (You)" : "(Owner)"}
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

      {collaborators.length > 0 && <Separator />}

      {collaborators.map((collaborator) => (
        <div
          key={collaborator.id}
          className="flex items-center justify-between"
        >
          <CollaboratorUserItem
            name={collaborator.user.name as string}
            email={collaborator.user.email as string}
            label={
              collaborator.isVerified
                ? currentUserId === collaborator.user.id
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
                    handleRoleChange(collaborator.id, value as CollaboratorRole)
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
                          Collaborator will disappear from all shared instances
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
  );
};
