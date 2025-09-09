"use client";

import { X, Mail, FileText, Clock, ExternalLink } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onDocumentSelect?: (docId: string) => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarColor: string;
  connectedDocuments: {
    id: string;
    title: string;
    type: string;
    icon: string;
    role: "owner" | "editor" | "viewer";
    lastModified: string;
  }[];
}

// Mock user data - in a real app, this would come from your API
const getUserProfile = (userId: string): UserProfile => {
  const users: Record<string, UserProfile> = {
    "sarah-chen": {
      id: "sarah-chen",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      avatar: "SC",
      avatarColor: "bg-green-600",
      connectedDocuments: [
        {
          id: "design-system",
          title: "Design System Guidelines",
          type: "Design Doc",
          icon: "🎨",
          role: "owner",
          lastModified: "5 days ago",
        },
        {
          id: "project-roadmap",
          title: "Q1 2024 Product Roadmap",
          type: "Project Plan",
          icon: "🎯",
          role: "editor",
          lastModified: "2 hours ago",
        },
        {
          id: "user-research",
          title: "User Interview Insights - December",
          type: "Research",
          icon: "🔍",
          role: "owner",
          lastModified: "1 week ago",
        },
        {
          id: "brainstorm",
          title: "Product Ideas Brainstorm",
          type: "Brainstorm",
          icon: "💭",
          role: "editor",
          lastModified: "2 weeks ago",
        },
      ],
    },
    "mike-johnson": {
      id: "mike-johnson",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      avatar: "MJ",
      avatarColor: "bg-purple-600",
      connectedDocuments: [
        {
          id: "api-docs",
          title: "REST API Documentation",
          type: "Documentation",
          icon: "📚",
          role: "owner",
          lastModified: "1 week ago",
        },
        {
          id: "feature-spec",
          title: "User Authentication System Spec",
          type: "Technical Spec",
          icon: "🔐",
          role: "editor",
          lastModified: "3 days ago",
        },
        {
          id: "meeting-notes-jan",
          title: "Weekly Team Sync - January 15",
          type: "Meeting Notes",
          icon: "📋",
          role: "viewer",
          lastModified: "1 day ago",
        },
      ],
    },
  };

  return users[userId] || users["sarah-chen"];
};

export function UserProfileModal({
  isOpen,
  onClose,
  userId,
  onDocumentSelect,
}: UserProfileModalProps) {
  if (!isOpen) return null;

  const user = getUserProfile(userId);

  const getRoleIcon = (role: "owner" | "editor" | "viewer") => {
    switch (role) {
      case "owner":
        return "👑";
      case "editor":
        return "✏️";
      case "viewer":
        return "👁️";
      default:
        return "👁️";
    }
  };

  const getRoleColor = (role: "owner" | "editor" | "viewer") => {
    switch (role) {
      case "owner":
        return "text-yellow-400";
      case "editor":
        return "text-blue-400";
      case "viewer":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const handleDocumentClick = (docId: string) => {
    onDocumentSelect?.(docId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161618] border border-[#1E1E20] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E1E20]">
          <h2 className="text-lg font-semibold text-white">User Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A2A2E] rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-16 h-16 ${user.avatarColor} rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0`}
            >
              {user.avatar}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{user.name}</h3>
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {/* Connected Documents */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Connected Documents ({user.connectedDocuments.length})
            </h4>
            <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-3">
              {user.connectedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc.id)}
                  className="flex items-center gap-3 p-3 bg-[#1A1A1C] border border-[#2A2A2E] rounded-lg hover:bg-[#1E1E20] transition-colors cursor-pointer group"
                >
                  <span className="text-lg">{doc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                        {doc.title}
                      </h5>
                      <span className="text-xs px-2 py-1 bg-[#2A2A2E] text-gray-400 rounded flex-shrink-0">
                        {doc.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className={getRoleColor(doc.role)}>
                          {getRoleIcon(doc.role)}
                        </span>
                        <span className="capitalize">{doc.role}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Modified {doc.lastModified}</span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
