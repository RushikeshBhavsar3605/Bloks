"use client";

import { useState, useEffect, useMemo } from "react";
import { Document, User } from "@prisma/client";
import { getSearch } from "@/actions/documents/search-documents";
import { getCoeditorUsers } from "@/actions/collaborators/get-co-editor-users";
import { useCurrentUser } from "@/hooks/use-current-user";

export interface SearchResult {
  id: string;
  type: "document" | "page" | "folder" | "user" | "workspace";
  title: string;
  content?: string;
  preview?: string;
  icon?: string;
  author?: string;
  workspace?: string;
  lastModified?: string;
  url?: string;
  category?: string;
  tags?: string[];
}

export function useAdvancedSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<
    Pick<User, "id" | "name" | "email" | "image">[]
  >([]);
  const user = useCurrentUser();

  // Load documents and users on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [documentsData, usersData] = await Promise.all([
          getSearch(),
          user?.id ? getCoeditorUsers(user.id) : Promise.resolve([]),
        ]);

        setDocuments(documentsData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setDocuments([]);
        setUsers([]);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("jotion-recent-searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse recent searches:", error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const addToRecentSearches = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 10);

    setRecentSearches(updated);
    localStorage.setItem("jotion-recent-searches", JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("jotion-recent-searches");
  };

  // Convert documents to search results
  const convertDocumentsToSearchResults = (
    docs: Document[]
  ): SearchResult[] => {
    return docs.map((doc) => ({
      id: doc.id,
      type: "document" as const,
      title: doc.title,
      content: doc.content || "",
      preview: doc.content ? doc.content.substring(0, 200) + "..." : "",
      icon: doc.icon || undefined,
      author: user?.name || "Unknown",
      workspace: `${user?.name}'s Workspace`,
      lastModified: formatLastModified(doc.updatedAt),
      url: `/documents/${doc.id}`,
      category: "Document",
      tags: [],
    }));
  };

  // Convert users to search results
  const convertUsersToSearchResults = (
    users: Pick<User, "id" | "name" | "email" | "image">[]
  ): SearchResult[] => {
    return users.map((user) => ({
      id: user.id,
      type: "user" as const,
      title: user.name || "Unknown User",
      content: `${user.name || "Unknown"} - ${user.email || "No email"}`,
      preview: `Collaborator in ${user.name}'s workspace`,
      icon: undefined, // Users don't have custom icons
      author: user.name || "Unknown",
      workspace: `${user.name}'s Workspace`,
      lastModified: "Active collaborator",
      url: `/settings`, // Could be user profile page
      category: "Collaborator",
      tags: ["collaborator", "user", "team"],
    }));
  };

  // Format last modified date
  const formatLastModified = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Perform search with debouncing
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    setIsSearching(true);

    const searchTerm = query.toLowerCase();
    const documentResults = convertDocumentsToSearchResults(documents);
    const userResults = convertUsersToSearchResults(users);
    const allResults = [...documentResults, ...userResults];

    const results = allResults.filter((item) => {
      // Search in title
      if (item.title.toLowerCase().includes(searchTerm)) return true;

      // Search in content
      if (item.content?.toLowerCase().includes(searchTerm)) return true;

      // Search in category
      if (item.category?.toLowerCase().includes(searchTerm)) return true;

      // Search in tags
      if (item.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)))
        return true;

      // Search in author
      if (item.author?.toLowerCase().includes(searchTerm)) return true;

      return false;
    });

    // Sort results by relevance
    const sortedResults = results.sort((a, b) => {
      // Exact title matches first
      const aExactTitle = a.title.toLowerCase() === searchTerm;
      const bExactTitle = b.title.toLowerCase() === searchTerm;
      if (aExactTitle && !bExactTitle) return -1;
      if (!aExactTitle && bExactTitle) return 1;

      // Title starts with search term
      const aTitleStarts = a.title.toLowerCase().startsWith(searchTerm);
      const bTitleStarts = b.title.toLowerCase().startsWith(searchTerm);
      if (aTitleStarts && !bTitleStarts) return -1;
      if (!aTitleStarts && bTitleStarts) return 1;

      // Title contains search term
      const aTitleContains = a.title.toLowerCase().includes(searchTerm);
      const bTitleContains = b.title.toLowerCase().includes(searchTerm);
      if (aTitleContains && !bTitleContains) return -1;
      if (!aTitleContains && bTitleContains) return 1;

      // Sort by type priority (documents first)
      const typePriority = {
        document: 0,
        folder: 1,
        user: 2,
        workspace: 3,
        page: 4,
      };
      const aPriority = typePriority[a.type] || 5;
      const bPriority = typePriority[b.type] || 5;
      if (aPriority !== bPriority) return aPriority - bPriority;

      // Finally sort alphabetically
      return a.title.localeCompare(b.title);
    });

    setTimeout(() => setIsSearching(false), 100);
    return sortedResults;
  }, [query, documents, users, user]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};

    searchResults.forEach((result) => {
      const type = result.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(result);
    });

    return groups;
  }, [searchResults]);

  return {
    query,
    setQuery,
    searchResults,
    groupedResults,
    isSearching,
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
  };
}
