"use client";

import { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  Mail,
  ChevronDown,
  Trash2,
  Crown,
  Eye,
  Edit,
  Settings,
  Link,
  UserPlus,
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentIcon: string;
}

export function ShareModal({
  isOpen,
  onClose,
  documentTitle,
  documentIcon,
}: ShareModalProps) {
  const [shareLink, setShareLink] = useState(
    "https://jotion.app/doc/q1-2024-product-roadmap-abc123"
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [shareMode, setShareMode] = useState<"private" | "anyone">("private");
  const [defaultPermission, setDefaultPermission] = useState<
    "viewer" | "editor"
  >("viewer");

  const [collaborators, setCollaborators] = useState([
    {
      id: "1",
      name: "Rushikesh Joseph",
      email: "rushikesh@example.com",
      avatar: "RJ",
      avatarColor: "bg-blue-600",
      role: "owner",
      permission: "Full Access",
    },
    {
      id: "2",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      avatar: "SC",
      avatarColor: "bg-green-600",
      role: "editor",
      permission: "Can Edit",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      avatar: "MJ",
      avatarColor: "bg-purple-600",
      role: "viewer",
      permission: "Can View",
    },
  ]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleInviteByEmail = () => {
    if (emailInput.trim()) {
      const newCollaborator = {
        id: Date.now().toString(),
        name: emailInput.split("@")[0],
        email: emailInput,
        avatar: emailInput.charAt(0).toUpperCase(),
        avatarColor: "bg-gray-600",
        role: "viewer" as const,
        permission: "Can View",
      };
      setCollaborators([...collaborators, newCollaborator]);
      setEmailInput("");
    }
  };

  const handleRemoveCollaborator = (id: string) => {
    setCollaborators(collaborators.filter((c) => c.id !== id));
  };

  const handlePermissionChange = (id: string, newPermission: string) => {
    setCollaborators(
      collaborators.map((c) =>
        c.id === id
          ? {
              ...c,
              role: newPermission === "Can Edit" ? "editor" : "viewer",
              permission: newPermission,
            }
          : c
      )
    );
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "Full Access":
        return Crown;
      case "Can Edit":
        return Edit;
      case "Can View":
        return Eye;
      default:
        return Eye;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161618] border border-[#1E1E20] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1E1E20]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2A2A2E] rounded-lg flex items-center justify-center">
              <Share2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Share Document
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{documentIcon}</span>
                <span>{documentTitle}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A2A2E] rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto custom-scrollbar">
          {/* Invite People Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Invite people</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleInviteByEmail()}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1A1A1C] border border-[#2A2A2E] rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleInviteByEmail}
                disabled={!emailInput.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
            </div>
          </div>

          {/* Collaborators List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                People with access
              </h3>
              <span className="text-sm text-gray-400">
                {collaborators.length} people
              </span>
            </div>

            <div className="space-y-3">
              {collaborators.map((collaborator) => {
                const PermissionIcon = getPermissionIcon(
                  collaborator.permission
                );
                return (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#2A2A2E] rounded-lg hover:bg-[#1E1E20] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 ${collaborator.avatarColor} rounded-full flex items-center justify-center text-sm font-medium text-white`}
                      >
                        {collaborator.avatar}
                      </div>
                      <div className="flex flex-col p-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">
                            {collaborator.name}
                          </span>
                          {collaborator.role === "owner" && (
                            <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs rounded font-medium">
                              Owner
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400 text-sm">
                          {collaborator.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {collaborator.role !== "owner" ? (
                        <div className="relative">
                          <select
                            value={collaborator.permission}
                            onChange={(e) =>
                              handlePermissionChange(
                                collaborator.id,
                                e.target.value
                              )
                            }
                            className="appearance-none bg-[#2A2A2E] text-white text-sm px-3 py-1.5 pr-8 rounded-lg border border-[#323236] focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Can View">Can View</option>
                            <option value="Can Edit">Can Edit</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2A2A2E] rounded-lg">
                          <PermissionIcon className="w-4 h-4 text-yellow-400" />
                          <span className="text-white text-sm">
                            {collaborator.permission}
                          </span>
                        </div>
                      )}

                      {collaborator.role !== "owner" && (
                        <button
                          onClick={() =>
                            handleRemoveCollaborator(collaborator.id)
                          }
                          className="p-1.5 hover:bg-[#2A2A2E] rounded text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="pt-4 border-t border-[#1E1E20]">
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
              Advanced settings
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-2.5 border-t border-[#1E1E20] bg-[#1A1A1C]">
          <div className="text-sm text-gray-400">
            Changes are saved automatically
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
