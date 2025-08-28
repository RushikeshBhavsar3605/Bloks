import { CollaboratorWithMeta } from "@/types/shared";
import { CollaboratorRole } from "@prisma/client";
import { ChevronDown, Trash2, Crown, Eye, Edit } from "lucide-react";

interface CollaboratorItemProps {
  collaborators: CollaboratorWithMeta[];
  currentUserId?: string;
  isOwner: boolean;
  handleRoleChange: (collaboratorId: string, newRole: CollaboratorRole) => void;
  handleRemoveCollaborator: (collaboratorId: string) => void;
}

const getPermissionText = (
  role: CollaboratorRole,
  isOwner: boolean = false
) => {
  if (isOwner) return "Full Access";
  switch (role) {
    case "VIEWER":
      return "Can View";
    case "EDITOR":
      return "Can Edit";
    default:
      return "Can View";
  }
};

const getPermissionIcon = (
  role: CollaboratorRole,
  isOwner: boolean = false
) => {
  if (isOwner) return Crown;
  switch (role) {
    case "EDITOR":
      return Edit;
    case "VIEWER":
      return Eye;
    default:
      return Eye;
  }
};

const getRoleFromPermission = (permission: string): CollaboratorRole => {
  switch (permission) {
    case "Can Edit":
      return "EDITOR";
    case "Can View":
      return "VIEWER";
    default:
      return "VIEWER";
  }
};

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

export const CollaboratorItem = ({
  collaborators,
  currentUserId,
  isOwner,
  handleRoleChange,
  handleRemoveCollaborator,
}: CollaboratorItemProps) => {
  return (
    <div className="space-y-3">
      {collaborators.map((collaborator) => {
        const isOwnerUser = collaborator.id.startsWith("owner-");
        const isCurrentUser =
          collaborator.user.id === currentUserId && !isOwnerUser;
        const PermissionIcon = getPermissionIcon(
          collaborator.role,
          isOwnerUser
        );
        const isCollaboratorVerified = collaborator.isVerified;

        return (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-[#2A2A2E] rounded-lg hover:bg-gray-50 dark:hover:bg-[#1E1E20] transition-colors"
          >
            <div className="flex items-center gap-3">
              {collaborator.user.image ? (
                <img
                  src={collaborator.user.image}
                  alt={collaborator.user.name || "User"}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-8 h-8 ${getAvatarColor(
                    collaborator.id
                  )} rounded-full flex items-center justify-center text-sm font-medium text-white`}
                >
                  {getAvatarInitials(collaborator.user.name || "User")}
                </div>
              )}
              <div className="flex flex-col p-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-white font-medium text-sm">
                    {collaborator.user.name || "Unknown User"}
                  </span>
                  {isOwnerUser && (
                    <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs rounded font-medium">
                      Owner
                    </span>
                  )}
                  {isCurrentUser && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded font-medium">
                      You
                    </span>
                  )}
                  {!isCollaboratorVerified && (
                    <span className="px-2 py-0.5 bg-gray-500 dark:bg-gray-600 text-white text-xs rounded font-medium">
                      Pending
                    </span>
                  )}
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {collaborator.user.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isOwnerUser ? (
                isCurrentUser || !isOwner ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#2A2A2E] rounded-lg w-[124px]">
                    <PermissionIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span className="text-gray-900 dark:text-white text-sm">
                      {getPermissionText(collaborator.role, isOwnerUser)}
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={getPermissionText(collaborator.role, isOwnerUser)}
                      onChange={(e) =>
                        handleRoleChange(
                          collaborator.id,
                          getRoleFromPermission(e.target.value)
                        )
                      }
                      className="appearance-none bg-gray-100 dark:bg-[#2A2A2E] text-gray-900 dark:text-white text-sm px-3 py-1.5 pr-8 rounded-lg border border-gray-300 dark:border-[#323236] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Can View">Can View</option>
                      <option value="Can Edit">Can Edit</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#2A2A2E] rounded-lg">
                  <PermissionIcon className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                  <span className="text-gray-900 dark:text-white text-sm">
                    {getPermissionText(collaborator.role, isOwnerUser)}
                  </span>
                </div>
              )}

              {!isOwnerUser && !isCurrentUser && isOwner && (
                <button
                  onClick={() => handleRemoveCollaborator(collaborator.id)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2A2A2E] rounded text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
