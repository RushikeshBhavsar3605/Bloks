"use client";

import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronsLeft,
  CreditCard,
  Home,
  Library,
  PlusCircle,
  Search,
  Settings,
  Trash,
} from "lucide-react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ElementRef, useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import UserItem from "./user-item";
import { DocumentTree } from "./document-list/document-tree";
import { UpgradeAlertModal } from "@/components/modals/upgrade-alert-modal";
import { useUpgradeAlert } from "@/hooks/use-upgrade-alert";
import { createDocumentWithUpgradeCheck } from "@/lib/document-creation-utils";
import { useSearch } from "@/hooks/use-search";
import { Navbar } from "./navbar";
import { PageHeader } from "./page-header";

// Create a ref that can be shared
export const sharedNavbarRef = { current: null as ElementRef<"div"> | null };

interface NavigationProps {
  openSearchModal: () => void;
  openTrashModal: () => void;
}

export const Navigation = ({
  openSearchModal,
  openTrashModal,
}: NavigationProps) => {
  const search = useSearch();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const {
    isOpen: isUpgradeAlertOpen,
    openUpgradeAlert,
    closeUpgradeAlert,
  } = useUpgradeAlert();

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  // Sync navbarRef with sharedNavbarRef
  useEffect(() => {
    sharedNavbarRef.current = navbarRef.current;
  }, []);

  // Menu items with route-based activation
  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/documents",
      onClick: () => router.push("/documents"),
    },
    {
      id: "library",
      label: "My Library",
      icon: Library,
      path: "/library",
      onClick: () => router.push("/library"),
    },
    {
      id: "search",
      label: "Search",
      icon: Search,
      path: "/search",
      onClick: () => openSearchModal(),
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCard,
      path: "/billing",
      onClick: () => router.push("/billing"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "?modal=settings",
      onClick: () => router.push("?modal=settings"),
    },
    {
      id: "new-page",
      label: "New page",
      icon: PlusCircle,
      path: "/new-page",
      onClick: () => onCreate(),
    },
  ];

  const isActiveRoute = (path: string) => {
    // Special case for home - should be active only on /documents page
    if (path === "/documents") {
      return pathname === "/documents";
    }
    // Special case for modal-based routes
    if (path.startsWith("?")) {
      const modalParam = path.replace("?modal=", "");
      return searchParams?.get("modal") === modalParam;
    }
    return pathname === path;
  };

  const onCreate = () => {
    createDocumentWithUpgradeCheck({
      title: "Untitled",
      onSuccess: (document) => {
        router.push(`/documents/${document.id}`);
      },
      onUpgradeRequired: openUpgradeAlert,
    });
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;

    let newWidth = event.clientX;

    if (newWidth < 280) newWidth = 280;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = useCallback(() => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "280px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 280px)"
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "280px");
      setTimeout(() => setIsResetting(false), 300);
    }
  }, [isMobile]);

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile, resetWidth]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-gray-50 dark:bg-[#161618] overflow-y-auto relative flex w-[280px] flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-gray-600 dark:text-gray-400 rounded-sm hover:bg-gray-200 dark:hover:bg-[#1E1E20] absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>

        {/* Header */}
        <UserItem />

        {/* Menu */}
        <div className="flex-1 pt-3 overflow-y-auto custom-scrollbar">
          <div className="px-4">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-3 px-2">
              Menu
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                      isActive
                        ? "bg-gray-100 dark:bg-[#2A2A2E] text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E20]"
                    )}
                    onClick={item.onClick}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Documents */}
          <div className="px-4 mt-8">
            <DocumentTree />
          </div>

          <div className="px-4 mt-8">
            <div className="space-y-1">
              {/* Trash */}
              <button
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E20] transition-all"
                onClick={openTrashModal}
              >
                <Trash className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Trash</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade Section */}
        <div className="p-4 mt-auto">
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Upgrade to Pro
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Unlock AI features like transcription, AI summary, and more.
            </p>
            <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Upgrade
            </button>
          </div>
        </div>

        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>

      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-[280px] w-[calc(100%-280px)]",
          isResetting && "transitio ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
        {!!params?.documentId ? (
          <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
        ) : (
          pathname !== "/billing" && (
            <PageHeader
              searchPlaceholder="Search pages, projects, and more..."
              onNewPageClick={onCreate}
              isCollapsed={isCollapsed}
              onResetWidth={resetWidth}
            />
          )
        )}
      </div>
      <UpgradeAlertModal
        isOpen={isUpgradeAlertOpen}
        onClose={closeUpgradeAlert}
      />
    </>
  );
};
