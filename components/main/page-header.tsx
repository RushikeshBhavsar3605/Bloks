"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { Upload, ChevronsRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { SearchInput } from "@/components/search/search-input";

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
  const pathname = usePathname();
  const router = useRouter();

  const handleDocumentSelect = (docId: string) => {
    if (docId === "new") {
      onNewPageClick();
    } else {
      router.push(`/documents/${docId}`);
    }
  };

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  if (pathname?.includes("/starred")) return null;

  return (
    <header className="h-[66px] flex items-center justify-between px-8 border-b border-gray-200 dark:border-[#1E1E20] bg-background dark:bg-[#0B0B0F]">
      <div className="flex items-center flex-1 max-w-md">
        {isCollapsed && (
          <nav className="bg-transparent">
            <ChevronsRight
              role="button"
              onClick={onResetWidth}
              className="h-6 w-6 ml-[-32px] text-muted-foreground text-gray-600 dark:text-gray-400 rounded-sm hover:bg-gray-200 dark:hover:bg-[#1E1E20]"
            />
          </nav>
        )}
        <SearchInput
          placeholder={searchPlaceholder}
          onDocumentSelect={handleDocumentSelect}
          onNavigate={handleNavigate}
          className="flex-1"
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
      </div>
    </header>
  );
};
