"use client";

import { getStarredDocuments } from "@/actions/documents/get-starred-documents";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Document, User } from "@prisma/client";
import {
  Clock,
  FileText,
  Grid3X3,
  List,
  MoreHorizontal,
  Search,
  Star,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TurndownService from "turndown";

// Initialize turndown service
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

// Function to convert HTML to Markdown
function htmlToMarkdown(html: string): string {
  if (!html) return "";
  return turndownService.turndown(html);
}

// Function to highlight matching text
function highlightText(text: string, query: string): JSX.Element {
  if (!query.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-white rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

// Function to get relevant content snippet with highlighting
function getRelevantContentSnippet(content: string, query: string, maxLength: number = 120): string {
  if (!content || !query.trim()) {
    return content.substring(0, maxLength);
  }

  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerContent.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return content.substring(0, maxLength);
  }

  // Calculate start position to center the match
  const startOffset = Math.max(0, matchIndex - Math.floor((maxLength - query.length) / 2));
  const endOffset = Math.min(content.length, startOffset + maxLength);

  let snippet = content.substring(startOffset, endOffset);
  
  // Add ellipsis if we're not at the beginning/end
  if (startOffset > 0) snippet = "..." + snippet;
  if (endOffset < content.length) snippet = snippet + "...";

  return snippet;
}

function getRelativeTimeMessage(lastEditedAt: Date): string {
  const currDate = new Date();
  const diffMs = currDate.getTime() - lastEditedAt.getTime();

  const diffHr = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeeks = Math.floor(diffDay / 7);
  const diffYears = Math.floor(diffDay / 365);

  if (diffHr < 1) return "Few minutes ago";
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffWeeks < 52) return `${diffWeeks} weeks ago`;

  return `${diffYears} years ago`;
}

type customDocumentWithMeta = Document & {
  lastEditedBy: User | null;
};

const StarredPage = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "modified" | "created">(
    "modified"
  );
  const [starredDocuments, setStarredDocuments] = useState<
    customDocumentWithMeta[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const onDocumentSelect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  useEffect(() => {
    const fetchStarredDocuments = async () => {
      const response = await getStarredDocuments(user?.id as string);

      setStarredDocuments(response);
    };

    fetchStarredDocuments();
  }, [user?.id]);

  // Filter documents based on search query
  const filteredDocuments = starredDocuments.filter((doc) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const titleMatch = doc.title.toLowerCase().includes(query);
    const contentMatch = doc.content 
      ? htmlToMarkdown(doc.content).toLowerCase().includes(query)
      : false;
    
    return titleMatch || contentMatch;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title);
      case "created":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "modified":
      default:
        return (
          new Date(b.lastEditedAt || b.createdAt).getTime() -
          new Date(a.lastEditedAt || a.createdAt).getTime()
        );
    }
  });

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0B0F]">
      {/* Header */}
      <header className="h-[66px] flex items-center justify-between px-8 border-b border-gray-200 dark:border-[#1E1E20]">
        <div className="flex items-center px-4 gap-4 flex-1 max-w-md border border-gray-200 dark:border-[#1E1E20] rounded-lg">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search starred documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 focus:border-none focus:shadow-none p-0"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-[#161618] rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-gray-200 dark:bg-[#2A2A2E] text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-gray-200 dark:bg-[#2A2A2E] text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2 tracking-wider">
              <span>FAVORITES</span>
            </div>
            <h1 className="text-[32px] font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400" />
              Starred Documents
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Quick access to your most important documents
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {searchQuery.trim() 
                  ? `${sortedDocuments.length} of ${starredDocuments.length} starred documents`
                  : `${starredDocuments.length} starred documents`
                }
              </span>
              {searchQuery.trim() && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "name" | "modified" | "created")
                  }
                  className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="modified">Last Modified</option>
                  <option value="name">Name</option>
                  <option value="created">Date Created</option>
                </select>
              </div>
            </div>
          </div>

          {/* Documents Grid/List */}
          {sortedDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-[#2A2A2E] rounded-full flex items-center justify-center mb-4">
                {searchQuery.trim() ? (
                  <Search className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Star className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery.trim() ? "No matching documents" : "No starred documents"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                {searchQuery.trim() 
                  ? `No starred documents match "${searchQuery}". Try a different search term or clear the search to see all starred documents.`
                  : "Star your important documents to quickly access them here. Click the star icon on any document to add it to your favorites."
                }
              </p>
              {searchQuery.trim() && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-gray-50 dark:bg-[#161618] rounded-xl overflow-hidden hover:bg-gray-100 dark:hover:bg-[#1A1A1C] transition-colors cursor-pointer group border border-gray-200 dark:border-[#1E1E20]"
                  onClick={() => onDocumentSelect(doc.id)}
                >
                  {/* Document Preview */}
                  <div className="aspect-video bg-gray-100 dark:bg-[#0F0F11] relative overflow-hidden p-4">
                    <div className="text-xs font-mono text-gray-600 dark:text-gray-300 leading-relaxed">
                      {highlightText(
                        getRelevantContentSnippet(htmlToMarkdown(doc.content || ""), searchQuery, 120),
                        searchQuery
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#161618] via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      {doc.icon ? (
                        <span className="text-xl">{doc.icon}</span>
                      ) : (
                        <FileText className="text-gray-600 dark:text-gray-400 w-6 h-6" />
                      )}
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-3 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                      {highlightText(doc.title, searchQuery)}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <UserIcon className="w-3 h-3" />
                      <span>{doc.lastEditedBy?.name}</span>
                      <span>•</span>
                      <span>
                        {getRelativeTimeMessage(
                          doc.lastEditedAt ? doc.lastEditedAt : doc.createdAt
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">Starred</div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#2A2A2E] rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-[#1A1A1C] transition-colors cursor-pointer group"
                  onClick={() => onDocumentSelect(doc.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
                      {doc.icon ? (
                        <span className="text-2xl">{doc.icon}</span>
                      ) : (
                        <FileText className="text-gray-600 dark:text-gray-400 w-7 h-7 mr-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-400 transition-colors">
                          {highlightText(doc.title, searchQuery)}
                        </h3>
                      </div>
                      {searchQuery.trim() && doc.content && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono leading-relaxed">
                          {highlightText(
                            getRelevantContentSnippet(htmlToMarkdown(doc.content), searchQuery, 100),
                            searchQuery
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{doc.lastEditedBy?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Modified{" "}
                            {getRelativeTimeMessage(
                              doc.lastEditedAt
                                ? doc.lastEditedAt
                                : doc.createdAt
                            )}
                          </span>
                        </div>
                        <span>Starred</span>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-200 dark:hover:bg-[#2A2A2E] rounded">
                      <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StarredPage;
