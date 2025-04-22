"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CollaboratorRole } from "@prisma/client";

interface CollaboratorUserItemProps {
  name: string;
  email: string;
  label?: string;
  imageSrc?: string;
  role: CollaboratorRole | "OWNER";
}
const CollaboratorUserItem = ({
  name,
  email,
  label,
  imageSrc,
  role,
}: CollaboratorUserItemProps) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-7 w-7">
          {imageSrc ? (
            <AvatarImage src={imageSrc} />
          ) : (
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="dark:text-white text-sm">{name}</span>
            <span className="text-gray-600 dark:text-gray-400 text-xs">
              ({label})
            </span>
          </div>
          <span className="text-gray-600 dark:text-gray-400 text-xs">
            {email}
          </span>
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-gray-600 dark:text-gray-400 mr-1 text-sm">
          {role === "OWNER" && <>Full access</>}
          {role === "VIEWER" && <>Viewer</>}
          {role === "EDITOR" && <>Editor</>}
        </span>
      </div>
    </div>
  );
};

export default CollaboratorUserItem;
