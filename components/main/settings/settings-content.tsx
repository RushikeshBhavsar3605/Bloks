"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsTabContent } from "./settings-tab-content";
import { ElementRef, useCallback, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";

export const SettingsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams?.get("tab") || "profile";
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);

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

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
    if (isMobile) collapse();
  };

  return (
    <div className="flex h-full bg-white dark:bg-[#0B0B0F] overflow-hidden">
      <aside
        ref={sidebarRef}
        className={cn(
          "w-[280px] bg-gray-50 dark:bg-[#161618] border-r border-gray-200 dark:border-[#1E1E20] overflow-y-auto custom-scrollbar",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
        <SettingsSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isMobile={isMobile}
          isCollapsed={isCollapsed}
          collapse={collapse}
        />
      </aside>

      <div
        ref={navbarRef}
        className={cn(
          "flex-1 overflow-y-auto custom-scrollbar",
          isResetting && "transitio ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div className="p-8">
          <SettingsTabContent
            activeTab={activeTab}
            isCollapsed={isCollapsed}
            onResetWidth={resetWidth}
          />
        </div>
      </div>
    </div>
  );
};
