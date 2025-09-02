"use client";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Search, Plus, Upload, MenuIcon } from "lucide-react";

interface PageHeaderProps {
  searchPlaceholder?: string;
  showImportButton?: boolean;
  onNewPageClick: () => void;
  additionalButtons?: React.ReactNode;
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const PageHeader = ({
  searchPlaceholder = "Search pages, projects, and more...",
  showImportButton = false,
  onNewPageClick,
  additionalButtons,
  isCollapsed,
  onResetWidth,
}: PageHeaderProps) => {
  const user = useCurrentUser();

  return (
    <header className="h-[72px] flex items-center justify-between px-8 border-b border-gray-200 dark:border-[#1E1E20]">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        {isCollapsed && (
          <nav className="bg-transparent">
            <MenuIcon
              role="button"
              onClick={onResetWidth}
              className="h-6 w-6 text-muted-foreground"
            />
          </nav>
        )}
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          placeholder={searchPlaceholder}
          className="bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 text-sm focus-visible:ring-0 p-0"
        />
      </div>
      <div className="flex items-center gap-3">
        {showImportButton && (
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
        )}
        {additionalButtons}
        <button
          onClick={onNewPageClick}
          className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
            {user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
