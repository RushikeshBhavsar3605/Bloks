"use client";

import { useState, useEffect } from "react";
import { X, Mail, FileText, Clock, ExternalLink } from "lucide-react";
import { CollaboratorRole } from "@prisma/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getCoeditorUserRelation } from "@/actions/collaborators/get-co-editor-relation";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUserId: string;
  onDocumentSelect?: (docId: string) => void;
}

interface UserWithDocuments {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  connectedDocuments: {
    id: string;
    title: string;
    icon: string | null;
    role: CollaboratorRole | "OWNER";
    lastModified: Date | null;
  }[];
}

function getRelativeTimeMessage(lastEditedAt: Date | null): string {
  if (!lastEditedAt) return "";

  const currDate = new Date();
  const diffMs = currDate.getTime() - lastEditedAt.getTime();

  const diffHr = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeeks = Math.floor(diffDay / 7);
  const diffYears = Math.floor(diffDay / 365);

  if (diffHr < 1) return "Few minutes ago";
  if (diffHr < 24) return `${diffHr}hours ago`;
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffWeeks < 52) return `${diffWeeks} weeks ago`;

  return `${diffYears} years ago`;
}

const getAvatarColor = (userId: string): string => {
  // Generate consistent color based on userId
  const colors = [
    "bg-blue-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-red-600",
    "bg-yellow-600",
    "bg-indigo-600",
    "bg-pink-600",
    "bg-teal-600",
  ];
  const index = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const getRoleIcon = (role: CollaboratorRole | "OWNER") => {
  switch (role) {
    case "OWNER":
      return "👑";
    case "EDITOR":
      return "✏️";
    case "VIEWER":
      return "👁️";
    default:
      return "👁️";
  }
};

const getRoleColor = (role: CollaboratorRole | "OWNER") => {
  switch (role) {
    case "OWNER":
      return "text-yellow-400";
    case "EDITOR":
      return "text-blue-400";
    case "VIEWER":
      return "text-gray-400";
    default:
      return "text-gray-400";
  }
};

const getAvatarInitials = (name: string | null): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function UserProfileModal({
  isOpen,
  onClose,
  profileUserId,
  onDocumentSelect,
}: UserProfileModalProps) {
  const user = useCurrentUser();
  const [profileUser, setProfileUser] = useState<UserWithDocuments | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Fetch user data when modal opens
  useEffect(() => {
    if (isOpen && profileUserId) {
      fetchUserProfile();
    }
  }, [isOpen, profileUserId]);

  const fetchUserProfile = async () => {
    if (!user || !user.id) return null;
    setLoading(true);
    try {
      // For now, we'll create mock data based on the userId
      // In a real implementation, you'd fetch this from your API
      const userProfile = await getCoeditorUserRelation({
        userId: user?.id,
        profileUserId,
      });
      setProfileUser(userProfile);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (docId: string) => {
    onDocumentSelect?.(docId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : profileUser ? (
            <>
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-16 h-16 ${getAvatarColor(
                    profileUser.id
                  )} rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0`}
                >
                  {getAvatarInitials(profileUser.name)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {profileUser.name || "Unknown User"}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail className="w-4 h-4" />
                    <span>{profileUser.email || "No email"}</span>
                  </div>
                </div>
              </div>

              {/* Connected Documents */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Connected Documents ({profileUser.connectedDocuments.length})
                </h4>
                {profileUser.connectedDocuments.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-3">
                    {profileUser.connectedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => handleDocumentClick(doc.id)}
                        className="flex items-center gap-3 p-3 bg-[#1A1A1C] border border-[#2A2A2E] rounded-lg hover:bg-[#1E1E20] transition-colors cursor-pointer group"
                      >
                        <span className="text-lg">{doc.icon || "📄"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                              {doc.title}
                            </h5>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <span className={getRoleColor(doc.role)}>
                                {getRoleIcon(doc.role)}
                              </span>
                              <span className="capitalize">
                                {doc.role.toLowerCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                Modified{" "}
                                {getRelativeTimeMessage(doc.lastModified)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No connected documents</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>User not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
