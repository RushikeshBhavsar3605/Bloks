"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash,
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { CollaboratorRole, Document } from "@prisma/client";

interface ItemProps {
  id?: string;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
  label: string;
  onClick?: () => void;
  icon: LucideIcon;
  role?: CollaboratorRole | "OWNER" | null;
}

export const Item = ({
  id,
  documentIcon,
  active,
  expanded,
  isSearch,
  level = 0,
  onExpand,
  label,
  onClick,
  icon: Icon,
  role,
}: ItemProps) => {
  const user = useCurrentUser();
  const router = useRouter();

  const onArchive = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;

    const promise = fetch(`/api/socket/documents/${id}/archive`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    toast.promise(promise, {
      loading: "Moving to trash...",
      success: "Note moved to trash!",
      error: "Failed to archive note.",
    });
  };

  const handleExpand = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    onExpand?.();
  };

  const onCreate = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;

    const promise = fetch("/api/socket/documents", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Untitled", parentDocumentId: id }),
    })
      .then((res) => res.json())
      .then((document: Document) => {
        if ("error" in document) return;
        if (!expanded) {
          onExpand?.();
        }
        router.push(`/documents/${document.id}`);
      });

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note.",
    });
  };

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div
      onClick={onClick}
      role="button"
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}
      className={cn(
        "group min-h-[32px] text-sm py-1.5 pr-3 w-full flex items-center rounded-lg transition-all",
        "text-gray-600 dark:text-gray-400",
        "hover:bg-gray-100 dark:hover:bg-[#1E1E20]",
        "hover:text-gray-900 dark:hover:text-white",
        active && "bg-gray-100 dark:bg-[#2A2A2E] text-gray-900 dark:text-white"
      )}
    >
      {!!id && (
        <div
          role="button"
          className="h-full rounded-sm hover:bg-gray-200 dark:hover:bg-[#323236] mr-1 p-1 transition-colors"
          onClick={handleExpand}
        >
          <ChevronIcon className="h-4 w-4 shrink-0 text-gray-500 dark:text-gray-400" />
        </div>
      )}

      {documentIcon ? (
        <div className="shrink-0 mr-3 h-4 w-4">{documentIcon}</div>
      ) : (
        <Icon className="shrink-0 h-4 w-4 mr-3" />
      )}

      <span className="truncate">{label}</span>

      {isSearch && (
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 dark:bg-[#2A2A2E] border-gray-300 dark:border-gray-600 px-1.5 font-mono text-[10px] font-medium text-gray-600 dark:text-gray-400 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}

      {!!id && (
        <div className="ml-auto flex items-center gap-x-2">
          {(role === "OWNER" || role === "EDITOR") && (
            <DropdownMenu>
              <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
                <div
                  role="button"
                  className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-gray-200 dark:hover:bg-[#323236] p-1 transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-60"
                align="start"
                side="right"
                forceMount
              >
                <DropdownMenuItem onClick={onArchive}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="text-xs text-muted-foreground p-2">
                  Last edited by: {user?.name}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {role === "OWNER" && (
            <div
              role="button"
              onClick={onCreate}
              className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-gray-200 dark:hover:bg-[#323236] p-1 transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{
        paddingLeft: level ? `${level * 12 + 25}px` : "12px",
      }}
      className="flex gap-x-2 py-[3px]"
    >
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
};
