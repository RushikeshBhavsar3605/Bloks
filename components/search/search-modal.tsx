"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAdvancedSearch } from "@/hooks/use-advanced-search";
import { UserProfileModal } from "@/components/modals/user-profile-modal";
import {
  X,
  Search,
  Clock,
  FileText,
  Folder,
  User,
  Space as Workspace,
  ArrowRight,
  Trash2,
  Command,
  Hash,
  Star,
} from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string, id?: string) => void;
  onDocumentSelect?: (docId: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  onNavigate,
  onDocumentSelect,
}: SearchModalProps) {
  const router = useRouter();
  const {
    query,
    setQuery,
    searchResults,
    groupedResults,
    isSearching,
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
  } = useAdvancedSearch();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userModalUserId, setUserModalUserId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen, setQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, searchResults.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleResultClick(searchResults[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return FileText;
      case "folder":
        return Folder;
      case "user":
        return User;
      case "workspace":
        return Workspace;
      default:
        return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "document":
        return "Documents";
      case "folder":
        return "Folders";
      case "user":
        return "People";
      case "workspace":
        return "Workspaces";
      default:
        return "Results";
    }
  };

  const handleResultClick = (result: any) => {
    addToRecentSearches(query);

    if (result.type === "user") {
      // For user results, don't close search modal yet - just open user modal
      setUserModalUserId(result.id);
      setIsUserModalOpen(true);
    } else {
      // For other results, navigate first then close modal
      if (result.type === "document") {
        if (onDocumentSelect) {
          onDocumentSelect(result.id);
        } else {
          router.push(`/documents/${result.id}`);
        }
      } else if (result.type === "folder") {
        if (onNavigate) {
          onNavigate("library");
        } else {
          router.push("/library");
        }
      }
    }
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    inputRef.current?.focus();
  };

  const handleQuickAction = (action: string) => {
    // Close modal first
    onClose();

    // Then perform action
    switch (action) {
      case "starred":
        if (onNavigate) {
          onNavigate("starred");
        } else {
          router.push("/starred");
        }
        break;
      case "new":
        if (onDocumentSelect) {
          onDocumentSelect("new");
        }
        break;
      case "library":
        if (onNavigate) {
          onNavigate("library");
        } else {
          router.push("/library");
        }
        break;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setUserModalUserId(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh]">
        <div className="bg-white dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-[#1E1E20]">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents, folders, people..."
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 text-lg focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-[#2A2A2E] text-gray-600 dark:text-gray-400 text-xs rounded border border-gray-200 dark:border-[#323236]">
                <Command className="w-3 h-3 inline mr-1" />K
              </kbd>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2A2A2E] rounded-lg transition-colors text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[calc(70vh-80px)] overflow-y-auto custom-scrollbar">
            {!query.trim() ? (
              /* Recent Searches & Quick Actions */
              <div className="p-4 space-y-6">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent Searches
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.slice(0, 5).map((recentQuery, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(recentQuery)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#1A1A1C] rounded-lg transition-colors text-left"
                        >
                          <Clock className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {recentQuery}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-500 ml-auto" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Quick Actions
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => handleQuickAction("starred")}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#1A1A1C] rounded-lg transition-colors text-left"
                    >
                      <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        View Starred Documents
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-500 ml-auto" />
                    </button>
                    <button
                      onClick={() => handleQuickAction("new")}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#1A1A1C] rounded-lg transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Create New Document
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-500 ml-auto" />
                    </button>
                    <button
                      onClick={() => handleQuickAction("library")}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#1A1A1C] rounded-lg transition-colors text-left"
                    >
                      <Folder className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Browse All Documents
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-500 ml-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ) : searchResults.length === 0 && !isSearching ? (
              /* No Results */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-[#2A2A2E] rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  We couldn&apos;t find anything matching &quot;{query}&quot;.
                  Try different keywords or check your spelling.
                </p>
              </div>
            ) : (
              /* Search Results */
              <div ref={resultsRef} className="p-4">
                {Object.entries(groupedResults).map(([type, results]) => {
                  const Icon = getTypeIcon(type);
                  const label = getTypeLabel(type);

                  return (
                    <div key={type} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {label}
                        <span className="text-gray-500 dark:text-gray-500">
                          ({results.length})
                        </span>
                      </h3>
                      <div className="space-y-1">
                        {results.map((result) => {
                          const globalIndex = searchResults.indexOf(result);
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <button
                              key={result.id}
                              onClick={() => handleResultClick(result)}
                              className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                                isSelected
                                  ? "bg-blue-100 dark:bg-blue-600/20 border border-blue-300 dark:border-blue-500/30"
                                  : "hover:bg-gray-50 dark:hover:bg-[#1A1A1C]"
                              }`}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {result.icon ? (
                                  <span className="text-lg">{result.icon}</span>
                                ) : result.type === "user" ? (
                                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                    {result.title.charAt(0).toUpperCase()}
                                  </div>
                                ) : (
                                  <Icon className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                    {highlightMatch(result.title, query)}
                                  </h4>
                                  {result.category && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-[#2A2A2E] text-gray-600 dark:text-gray-400 rounded flex-shrink-0">
                                      {result.category}
                                    </span>
                                  )}
                                </div>
                                {result.preview && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {highlightMatch(
                                      result.preview
                                        .replace(/[#*`\n]/g, " ")
                                        .trim(),
                                      query
                                    )}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                  {result.author && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {result.author}
                                    </span>
                                  )}
                                  {result.lastModified && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {result.lastModified}
                                    </span>
                                  )}
                                  {result.workspace && (
                                    <span className="flex items-center gap-1">
                                      <Workspace className="w-3 h-3" />
                                      {result.workspace}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-500 flex-shrink-0 mt-1" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {query.trim() && (
            <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-[#1E1E20] bg-gray-50 dark:bg-[#1A1A1C] text-xs text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-4">
                <span>↑↓ to navigate</span>
                <span>↵ to select</span>
                <span>esc to close</span>
              </div>
              <div>
                {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Modal - rendered outside search modal */}
      <UserProfileModal
        isOpen={isUserModalOpen}
        onClose={closeUserModal}
        profileUserId={userModalUserId || ""}
        onDocumentSelect={onDocumentSelect}
      />
    </>
  );
}
