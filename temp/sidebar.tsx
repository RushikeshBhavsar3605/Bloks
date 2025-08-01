"use client";

import { useState } from "react";
import {
  Home,
  Library,
  Bell,
  CreditCard,
  Settings,
  FileText,
  Folder,
  Trash2,
  ChevronDown,
} from "lucide-react";

interface SidebarProps {
  onNavigate?: (page: string) => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("home");

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "library", label: "My Library", icon: Library },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const workspaces = [
    {
      id: "personal",
      name: "Personal Notes",
      avatar: "P",
      color: "bg-blue-500",
    },
    { id: "work", name: "SAAS Prodiges", avatar: "S", color: "bg-green-500" },
    {
      id: "projects",
      name: "Fitness Prodiges",
      avatar: "F",
      color: "bg-purple-500",
    },
  ];

  const documents = [
    { id: "private", name: "Private", icon: FileText },
    { id: "untitled", name: "Untitled", icon: FileText },
  ];

  const folders = [
    { id: "docker", name: "Docker", icon: Folder },
    { id: "add-docker", name: "Add Docker File Con...", icon: FileText },
    { id: "run-docker", name: "Run Docker Container", icon: FileText },
  ];

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  return (
    <div className="w-[280px] bg-[#161618] flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
            <span className="text-black font-bold text-sm">J</span>
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-white text-sm">Jotion</h2>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
        <p className="text-xs text-gray-400 mt-1 ml-10">
          Rushikesh's Workspace
        </p>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-4">
          <div className="text-xs font-medium text-gray-500 mb-3 px-2">
            Menu
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    activeItem === item.id
                      ? "bg-[#2A2A2E] text-white"
                      : "text-gray-400 hover:text-white hover:bg-[#1E1E20]"
                  }`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Private Documents */}
        <div className="px-4 mt-8">
          <div className="text-xs font-medium text-gray-500 mb-3 px-2">
            Private Documents
          </div>
          <div className="space-y-1">
            {documents.map((doc) => {
              const Icon = doc.icon;
              return (
                <button
                  key={doc.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#1E1E20] transition-all"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{doc.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shared */}
        <div className="px-4 mt-8">
          <div className="text-xs font-medium text-gray-500 mb-3 px-2">
            Shared
          </div>
          <div className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#1E1E20] transition-all"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </button>
              );
            })}
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#1E1E20] transition-all mt-2">
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Trash</span>
            </button>
          </div>
        </div>

        {/* Workspaces */}
        <div className="px-4 mt-8">
          <div className="text-xs font-medium text-gray-500 mb-3 px-2">
            Workspaces
          </div>
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#1E1E20] transition-all"
              >
                <div
                  className={`w-5 h-5 ${workspace.color} rounded flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-xs font-medium">
                    {workspace.avatar}
                  </span>
                </div>
                <span className="truncate">{workspace.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Section */}
      <div className="p-4 mt-auto">
        <div className="bg-[#1A1A1C] rounded-xl p-4">
          <h4 className="text-sm font-medium text-white mb-1">
            Upgrade to Pro
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            Unlock AI features like transcription, AI summary, and more.
          </p>
          <button className="w-full bg-white text-black text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
