"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/main/section-header";
import { DocumentCard } from "@/components/main/document-card";
import { StatsCard } from "@/components/main/stats-card";
import { PageTitle } from "@/components/main/page-title";
import { Globe, Search, FileText, Calendar, Loader2 } from "lucide-react";
import { DocumentWithMeta } from "@/types/shared";
import { getPublicDocumentsPaginated } from "@/actions/documents/get-public-documents-paginated";
import { getPublicPageStats } from "@/actions/documents/get-public-page-stats";
import { toast } from "sonner";

const ExplorePage = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentWithMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [stats, setStats] = useState<{
    totalDocuments: number;
    recentlyPublished: number;
  }>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const LIMIT = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch initial documents
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const response = await getPublicDocumentsPaginated(LIMIT, 0, "");
        setDocuments(response.documents);
        setHasMore(response.hasMore);
        setOffset(LIMIT);
      } catch (error) {
        console.error("Error fetching initial documents:", error);
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getPublicPageStats();
        setStats(response);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setSearching(true);
      return;
    }

    const fetchSearchResults = async () => {
      setSearching(true);
      try {
        const response = await getPublicDocumentsPaginated(
          LIMIT,
          0,
          debouncedSearchQuery
        );
        setDocuments(response.documents);
        setHasMore(response.hasMore);
        setOffset(LIMIT);
      } catch (error) {
        console.error("Error searching documents:", error);
        toast.error("Failed to search documents");
      } finally {
        setSearching(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery, searchQuery]);

  const loadMoreDocuments = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const response = await getPublicDocumentsPaginated(
        LIMIT,
        offset,
        debouncedSearchQuery
      );
      setDocuments((prev) => [...prev, ...response.documents]);
      setHasMore(response.hasMore);
      setOffset((prev) => prev + LIMIT);
    } catch (error) {
      console.error("Error loading more documents:", error);
      toast.error("Failed to load more documents. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }, [offset, debouncedSearchQuery, loadingMore, hasMore]);

  const onDocumentSelect = (documentId: string) => {
    router.push(`/preview/${documentId}`);
  };

  if (loading || stats === undefined) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0B0F]">
        <div className="h-[72px]" />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-8 py-8">
            <div className="mb-12">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2 tracking-wider">
                <div className="h-3 w-16 bg-gray-200 dark:bg-[#2A2A2E] rounded animate-pulse" />
              </div>
              <div className="h-8 w-64 bg-gray-200 dark:bg-[#2A2A2E] rounded animate-pulse mb-2" />
              <div className="h-4 w-96 bg-gray-200 dark:bg-[#2A2A2E] rounded animate-pulse" />
            </div>
            <section className="mb-12">
              <SectionHeader icon={FileText} title="Content Overview" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, index) => (
                  <StatsCard.Skeleton key={index} variant="stats" />
                ))}
              </div>
            </section>
            <section className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 h-10 bg-gray-200 dark:bg-[#2A2A2E] rounded-lg animate-pulse" />
              </div>
            </section>
            <section>
              <SectionHeader icon={Globe} title="Public Documents" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <DocumentCard.Skeleton key={index} showPreview={true} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  const statsData = [
    {
      label: "Public Documents",
      value: stats.totalDocuments.toString(),
      change: "Available to explore",
      icon: FileText,
      color: "text-blue-400",
    },
    {
      label: "Recently Published",
      value: stats.recentlyPublished.toString(),
      change: "This week",
      icon: Calendar,
      color: "text-green-400",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0B0F]">
      {/* <div className="h-[72px]" /> */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-8 py-8">
          <PageTitle
            title="Explore Public Documents"
            subtitle="Discover amazing content shared by the community"
            breadcrumb="EXPLORE"
          />

          <section className="mb-12">
            <SectionHeader icon={FileText} title="Content Overview" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {statsData.map((stat, index) => (
                <StatsCard
                  key={index}
                  icon={stat.icon}
                  iconColor={stat.color}
                  value={stat.value}
                  label={stat.label}
                  change={stat.change}
                  variant="stats"
                />
              ))}
            </div>
          </section>

          <section className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents, tags, or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            {searching && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                Searching documents...
              </div>
            )}
          </section>

          <section>
            <SectionHeader
              icon={Globe}
              title={`Public Documents ${
                documents.length > 0 ? `(${documents.length})` : ""
              }`}
            />

            {searching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <DocumentCard.Skeleton key={index} showPreview={true} />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No documents found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "No public documents available"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      id={doc.id}
                      title={doc.title}
                      icon={doc.icon}
                      type="Document"
                      preview={doc.content || ""}
                      author={doc.owner.name || ""}
                      timestamp={doc.publishedAt || doc.createdAt}
                      lastModified={doc.lastEditedAt ?? undefined}
                      onClick={onDocumentSelect}
                      showPreview={true}
                      searchQuery={debouncedSearchQuery}
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
          </section>
        </div>
      </main>
    </div>
  );
};

export default ExplorePage;
