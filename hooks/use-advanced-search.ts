"use client";

import { useState, useEffect, useCallback } from "react";
import { advancedSearch } from "@/actions/search/advanced-search";
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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const user = useCurrentUser();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 2000);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!user?.id) return;

    const performSearch = async () => {
      if (!debouncedQuery.trim() || !user.id) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await advancedSearch(debouncedQuery, user.id, 10);
        const allResults = [...response.documents, ...response.users];
        setSearchResults(allResults);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, user?.id]);

  // Show searching state when query differs from debounced query
  useEffect(() => {
    if (query !== debouncedQuery && query.trim()) {
      setIsSearching(true);
    }
  }, [query, debouncedQuery]);

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

  // Group results by type
  const groupedResults = useCallback(() => {
    const groups: Record<string, SearchResult[]> = {};

    searchResults.forEach((result) => {
      const type = result.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(result);
    });

    return groups;
  }, [searchResults])();

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
