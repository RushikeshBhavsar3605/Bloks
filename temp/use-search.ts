"use client"

import { useState, useEffect, useMemo } from "react"

export interface SearchResult {
  id: string
  type: "document" | "page" | "folder" | "user" | "workspace"
  title: string
  content?: string
  preview?: string
  icon?: string
  author?: string
  workspace?: string
  lastModified?: string
  url?: string
  category?: string
  tags?: string[]
}

// Mock data - in a real app, this would come from your API/database
const mockSearchData: SearchResult[] = [
  {
    id: "project-roadmap",
    type: "document",
    title: "Q1 2024 Product Roadmap",
    content:
      "Q1 2024 Product Roadmap Key Objectives Launch new user dashboard Implement real-time collaboration Mobile app beta release Timeline January User research and wireframes Technical architecture planning",
    preview:
      "# Q1 2024 Product Roadmap\n\n## Key Objectives\n- Launch new user dashboard\n- Implement real-time collaboration\n- Mobile app beta release",
    icon: "🎯",
    author: "Rushikesh Joseph",
    workspace: "Rushikesh's Workspace",
    lastModified: "2 hours ago",
    url: "/document/project-roadmap",
    category: "Project Plan",
    tags: ["roadmap", "planning", "Q1", "dashboard", "mobile"],
  },
  {
    id: "meeting-notes-jan",
    type: "document",
    title: "Weekly Team Sync - January 15",
    content:
      "Weekly Team Sync Date January 15 2024 Attendees Sarah Mike Alex Rushikesh Agenda Sprint review Upcoming deadlines Blockers discussion Action Items Update API documentation",
    preview: "# Weekly Team Sync\n**Date:** January 15, 2024\n**Attendees:** Sarah, Mike, Alex, Rushikesh",
    icon: "📋",
    author: "Rushikesh Joseph",
    workspace: "Rushikesh's Workspace",
    lastModified: "1 day ago",
    url: "/document/meeting-notes-jan",
    category: "Meeting Notes",
    tags: ["meeting", "sync", "team", "agenda", "action-items"],
  },
  {
    id: "feature-spec",
    type: "document",
    title: "User Authentication System Spec",
    content:
      "User Authentication System Overview Implement secure scalable authentication system supporting multiple providers Requirements OAuth integration Google GitHub JWT token management Role-based access control",
    preview:
      "# User Authentication System\n\n## Overview\nImplement a secure, scalable authentication system supporting multiple providers.",
    icon: "🔐",
    author: "Rushikesh Joseph",
    workspace: "Rushikesh's Workspace",
    lastModified: "3 days ago",
    url: "/document/feature-spec",
    category: "Technical Spec",
    tags: ["authentication", "security", "oauth", "jwt", "system"],
  },
  {
    id: "design-system",
    type: "document",
    title: "Design System Guidelines",
    content:
      "Design System v2.0 Color Palette Primary #3B82F6 Secondary #6B7280 Success #10B981 Typography Headings Inter Bold Body Inter Regular Components Button Card Modal Form elements",
    preview: "# Design System v2.0\n\n## Color Palette\n- Primary: #3B82F6\n- Secondary: #6B7280\n- Success: #10B981",
    icon: "🎨",
    author: "Rushikesh Joseph",
    workspace: "Rushikesh's Workspace",
    lastModified: "5 days ago",
    url: "/document/design-system",
    category: "Design Doc",
    tags: ["design", "system", "colors", "typography", "components"],
  },
  {
    id: "api-docs",
    type: "document",
    title: "REST API Documentation",
    content:
      "API Documentation Authentication All API requests require authentication via Bearer token Authorization Bearer your-token Endpoints Users GET /api/users POST /api/users PUT /api/users/:id",
    preview: "# API Documentation\n\n## Authentication\nAll API requests require authentication via Bearer token.",
    icon: "📚",
    author: "Rushikesh Joseph",
    workspace: "Rushikesh's Workspace",
    lastModified: "1 week ago",
    url: "/document/api-docs",
    category: "Documentation",
    tags: ["api", "documentation", "rest", "authentication", "endpoints"],
  },
  {
    id: "user-research",
    type: "document",
    title: "User Interview Insights - December",
    content:
      "User Research Summary Key Findings Users want faster page loading Mobile experience needs improvement Search functionality is crucial Quotes I love the clean interface but wish it was faster Mobile app would be game-changing",
    preview:
      "# User Research Summary\n\n## Key Findings\n1. Users want faster page loading\n2. Mobile experience needs improvement",
    icon: "🔍",
    author: "Rushikesh Joseph",
    workspace: "Rushikesh's Workspace",
    lastModified: "1 week ago",
    url: "/document/user-research",
    category: "Research",
    tags: ["research", "user", "insights", "mobile", "performance"],
  },
  {
    id: "brainstorm",
    type: "document",
    title: "Product Ideas Brainstorm",
    content:
      "Product Ideas New Features Dark mode toggle Collaborative editing Template marketplace Advanced search filters Integrations Slack notifications GitHub sync Calendar integration",
    preview: "# Product Ideas 💡\n\n## New Features\n- [ ] Dark mode toggle\n- [ ] Collaborative editing",
    icon: "💭",
    author: "Rushikesh Joseph",
    workspace: "Rushikesh's Workspace",
    lastModified: "2 weeks ago",
    url: "/document/brainstorm",
    category: "Brainstorm",
    tags: ["ideas", "features", "brainstorm", "integrations", "collaboration"],
  },
  // Folders
  {
    id: "projects-folder",
    type: "folder",
    title: "Active Projects",
    content: "Active Projects folder containing 12 project-related documents",
    icon: "🚀",
    workspace: "Rushikesh's Workspace",
    category: "Folder",
    tags: ["projects", "active", "folder"],
  },
  {
    id: "meeting-notes-folder",
    type: "folder",
    title: "Meeting Notes",
    content: "Meeting Notes folder containing 8 meeting-related documents",
    icon: "📝",
    workspace: "Rushikesh's Workspace",
    category: "Folder",
    tags: ["meetings", "notes", "folder"],
  },
  // Users
  {
    id: "sarah-chen",
    type: "user",
    title: "Sarah Chen",
    content: "Sarah Chen Lead Designer Team member in Rushikesh's Workspace",
    workspace: "Rushikesh's Workspace",
    category: "Team Member",
    tags: ["team", "designer", "collaborator"],
  },
  {
    id: "mike-johnson",
    type: "user",
    title: "Mike Johnson",
    content: "Mike Johnson Senior Developer Team member in Rushikesh's Workspace",
    workspace: "Rushikesh's Workspace",
    category: "Team Member",
    tags: ["team", "developer", "collaborator"],
  },
]

export function useSearch() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("jotion-recent-searches")
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to parse recent searches:", error)
      }
    }
  }, [])

  // Save recent searches to localStorage
  const addToRecentSearches = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 10) // Keep only last 10 searches

    setRecentSearches(updated)
    localStorage.setItem("jotion-recent-searches", JSON.stringify(updated))
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("jotion-recent-searches")
  }

  // Perform search with debouncing
  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    setIsSearching(true)

    const searchTerm = query.toLowerCase()
    const results = mockSearchData.filter((item) => {
      // Search in title
      if (item.title.toLowerCase().includes(searchTerm)) return true

      // Search in content
      if (item.content?.toLowerCase().includes(searchTerm)) return true

      // Search in category
      if (item.category?.toLowerCase().includes(searchTerm)) return true

      // Search in tags
      if (item.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))) return true

      // Search in author
      if (item.author?.toLowerCase().includes(searchTerm)) return true

      return false
    })

    // Sort results by relevance
    const sortedResults = results.sort((a, b) => {
      // Exact title matches first
      const aExactTitle = a.title.toLowerCase() === searchTerm
      const bExactTitle = b.title.toLowerCase() === searchTerm
      if (aExactTitle && !bExactTitle) return -1
      if (!aExactTitle && bExactTitle) return 1

      // Title starts with search term
      const aTitleStarts = a.title.toLowerCase().startsWith(searchTerm)
      const bTitleStarts = b.title.toLowerCase().startsWith(searchTerm)
      if (aTitleStarts && !bTitleStarts) return -1
      if (!aTitleStarts && bTitleStarts) return 1

      // Title contains search term
      const aTitleContains = a.title.toLowerCase().includes(searchTerm)
      const bTitleContains = b.title.toLowerCase().includes(searchTerm)
      if (aTitleContains && !bTitleContains) return -1
      if (!aTitleContains && bTitleContains) return 1

      // Sort by type priority (documents first)
      const typePriority = { document: 0, folder: 1, user: 2, workspace: 3, page: 4 }
      const aPriority = typePriority[a.type] || 5
      const bPriority = typePriority[b.type] || 5
      if (aPriority !== bPriority) return aPriority - bPriority

      // Finally sort alphabetically
      return a.title.localeCompare(b.title)
    })

    setTimeout(() => setIsSearching(false), 100)
    return sortedResults
  }, [query])

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}

    searchResults.forEach((result) => {
      const type = result.type
      if (!groups[type]) groups[type] = []
      groups[type].push(result)
    })

    return groups
  }, [searchResults])

  return {
    query,
    setQuery,
    searchResults,
    groupedResults,
    isSearching,
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
  }
}
