"use client";

import { getStarredDocumentsPaginated } from "@/actions/documents/get-starred-documents-paginated";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Document, User } from "@prisma/client";
import { Search, Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { DocumentCard } from "@/components/main/document-card";
import { toggleStar } from "@/actions/documents/toggle-star";

type customDocumentWithMeta = Document & {
  lastEditedBy: User | null;
};

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

const StarredPage = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const [starredDocuments, setStarredDocuments] = useState<
    customDocumentWithMeta[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const LIMIT = 10;

  const onDocumentSelect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const onStarClick = async (documentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await toggleStar({ userId: user?.id as string, documentId });
      // Remove the document from the starred list
      setStarredDocuments((prev) =>
        prev.filter((doc) => doc.id !== documentId)
      );
      toast.success("Document removed from starred");
    } catch (error) {
      console.error("Error toggling star:", error);
      toast.error("Failed to remove star");
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch initial documents
  useEffect(() => {
    const fetchInitialDocuments = async () => {
      setLoading(true);
      try {
        const response = await getStarredDocumentsPaginated(LIMIT, 0, "");
        setStarredDocuments(response.documents);
        setHasMore(response.hasMore);
        setOffset(LIMIT);
      } catch (error) {
        console.error("Error fetching initial documents:", error);
        toast.error("Failed to load starred documents");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchInitialDocuments();
    }
  }, [user?.id]);

  // Handle search
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setSearching(true);
      return;
    }

    const fetchSearchResults = async () => {
      setSearching(true);
      try {
        const response = await getStarredDocumentsPaginated(
          LIMIT,
          0,
          debouncedSearchQuery
        );
        setStarredDocuments(response.documents);
        setHasMore(response.hasMore);
        setOffset(LIMIT);
      } catch (error) {
        console.error("Error searching starred documents:", error);
        toast.error("Failed to search starred documents");
      } finally {
        setSearching(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery, searchQuery]);

  // Load more documents
  const loadMoreDocuments = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const response = await getStarredDocumentsPaginated(
        LIMIT,
        offset,
        debouncedSearchQuery
      );
      setStarredDocuments((prev) => [...prev, ...response.documents]);
      setHasMore(response.hasMore);
      setOffset((prev) => prev + LIMIT);
    } catch (error) {
      console.error("Error loading more documents:", error);
      toast.error("Failed to load more documents. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }, [offset, debouncedSearchQuery, loadingMore, hasMore]);

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
          {searching && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}
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
                {searching
                  ? "Searching..."
                  : `${starredDocuments.length} starred document${
                      starredDocuments.length !== 1 ? "s" : ""
                    }`}
              </span>
              {searchQuery.trim() && !searching && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <DocumentCard.Skeleton key={index} showPreview={true} />
              ))}
            </div>
          ) : searching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <DocumentCard.Skeleton key={index} showPreview={true} />
              ))}
            </div>
          ) : starredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-[#2A2A2E] rounded-full flex items-center justify-center mb-4">
                {searchQuery.trim() ? (
                  <Search className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Star className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery.trim()
                  ? "No matching documents"
                  : "No starred documents"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                {searchQuery.trim()
                  ? `No starred documents match "${searchQuery}". Try a different search term or clear the search to see all starred documents.`
                  : "Star your important documents to quickly access them here. Click the star icon on any document to add it to your favorites."}
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
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {starredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    id={doc.id}
                    title={doc.title}
                    icon={doc.icon}
                    type="Document"
                    preview={doc.content || ""}
                    author={doc.lastEditedBy?.name || "Unknown"}
                    timestamp={doc.lastEditedAt || doc.createdAt}
                    workspace="Starred"
                    onClick={onDocumentSelect}
                    showPreview={true}
                    searchQuery={debouncedSearchQuery}
                    showStarIcon={true}
                    onStarClick={onStarClick}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMoreDocuments}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Documents"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StarredPage;
