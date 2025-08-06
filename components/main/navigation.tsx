"use client";

import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronsLeft,
  CreditCard,
  Home,
  Library,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
  ChevronDown,
} from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ElementRef, useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import UserItem from "./user-item";
import { Item } from "./item";
import { toast } from "sonner";
import { DocumentTree } from "./document-list/document-tree";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { TrashBox } from "./trash-box/trash-box";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { Navbar } from "./navbar";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Navigation = () => {
  const search = useSearch();
  const settings = useSettings();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

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
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
      onClick: () => router.push("/notifications"),
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
      path: "/settings",
      onClick: () => router.push("/settings"),
    },
    {
      id: "search",
      label: "Search",
      icon: Search,
      path: "/search",
      onClick: search.onOpen,
    },
    {
      id: "new-page",
      label: "New page",
      icon: PlusCircle,
      path: "/new-page",
      onClick: () => onCreate(),
    },
    {
      id: "original-settings",
      label: "Original Settings",
      icon: Settings,
      path: "/original-settings",
      onClick: () => settings.onOpen(),
    },
  ];

  const isActiveRoute = (path: string) => {
    // Special case for home - should be active only on /documents page
    if (path === "/documents") {
      return pathname === "/documents";
    }
    return pathname === path;
  };

  const onCreate = () => {
    setError("");
    setSuccess("");

    const promise = fetch("/api/socket/documents", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Untitled" }),
    });

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note.",
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
          "group/sidebar h-full bg-white dark:bg-[#161618] overflow-y-auto relative flex w-[280px] flex-col z-[99999] border-r border-gray-200 dark:border-[#161618]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-gray-600 dark:text-gray-400 rounded-sm hover:bg-gray-100 dark:hover:bg-[#1E1E20] absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>

        {/* Header */}
        <UserItem />

        {/* Menu */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
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
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1E1E20]"
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
              <Popover>
                <PopoverTrigger className="w-full">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1E1E20] transition-all">
                    <Trash className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Trash</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-[300px] max-h-[80vh] overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-xl flex flex-col"
                  side={isMobile ? "bottom" : "right"}
                >
                  <TrashBox />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Workspaces
          <div className="px-4 mt-8">
            <div className="text-xs font-medium text-gray-500 mb-3 px-2">
              Workspaces
            </div>
            <div className="space-y-1">
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#1E1E20] transition-all"
                onClick={() => router.push("/documents")}
              >
                <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">
                    {user?.name?.charAt(0) || "P"}
                  </span>
                </div>
                <span className="truncate">Personal Notes</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#1E1E20] transition-all"
                onClick={() => router.push("/library")}
              >
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">S</span>
                </div>
                <span className="truncate">SAAS Prodiges</span>
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#1E1E20] transition-all"
                onClick={() => router.push("/library")}
              >
                <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">F</span>
                </div>
                <span className="truncate">Fitness Prodiges</span>
              </button>
            </div>
          </div> */}
        </div>

        {/* Upgrade Section */}
        <div className="p-4 mt-auto">
          <div className="bg-gray-50 dark:bg-[#1A1A1C] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
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
          <nav className="bg-transparent px-3 py-2 w-full">
            {isCollapsed && (
              <MenuIcon
                role="button"
                onClick={resetWidth}
                className="h-6 w-6 text-muted-foreground"
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
};
