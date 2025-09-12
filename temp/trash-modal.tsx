"use client"

import { useState, useEffect, useRef } from "react"
import {
  X,
  Search,
  Trash2,
  RotateCcw,
  Clock,
  User,
  MoreHorizontal,
  AlertTriangle,
  CheckSquare,
  Folder,
} from "lucide-react"

interface TrashModalProps {
  isOpen: boolean
  onClose: () => void
  onDocumentRestore?: (docId: string) => void
  onDocumentDelete?: (docId: string) => void
}

interface TrashedDocument {
  id: string
  title: string
  type: string
  icon: string
  author: string
  deletedDate: string
  originalLocation: string
  size?: string
  preview?: string
}

// Mock trash data - in a real app, this would come from your API
const trashedDocuments: TrashedDocument[] = [
  {
    id: "old-roadmap",
    title: "Q4 2023 Product Roadmap",
    type: "Project Plan",
    icon: "🎯",
    author: "Rushikesh Joseph",
    deletedDate: "2 days ago",
    originalLocation: "Active Projects",
    size: "2.4 KB",
    preview:
      "# Q4 2023 Product Roadmap\n\n## Completed Objectives\n- Dashboard redesign completed\n- Mobile app launched",
  },
  {
    id: "old-meeting",
    title: "Team Sync - December 20",
    type: "Meeting Notes",
    icon: "📋",
    author: "Rushikesh Joseph",
    deletedDate: "1 week ago",
    originalLocation: "Meeting Notes",
    size: "1.8 KB",
    preview: "# Team Sync - December 20\n**Attendees:** Sarah, Mike, Alex\n\n## Discussion Points\n- Year-end review",
  },
  {
    id: "draft-spec",
    title: "Payment System Draft",
    type: "Technical Spec",
    icon: "💳",
    author: "Mike Johnson",
    deletedDate: "1 week ago",
    originalLocation: "Active Projects",
    size: "3.2 KB",
    preview: "# Payment System Integration\n\n## Overview\nDraft specifications for payment processing system",
  },
  {
    id: "old-research",
    title: "User Survey Results - Nov",
    type: "Research",
    icon: "📊",
    author: "Sarah Chen",
    deletedDate: "2 weeks ago",
    originalLocation: "Research & Ideas",
    size: "4.1 KB",
    preview: "# User Survey Results\n\n## Key Findings\n- 78% satisfaction rate\n- Mobile usage increased by 45%",
  },
  {
    id: "temp-notes",
    title: "Temporary Notes",
    type: "Notes",
    icon: "📝",
    author: "Rushikesh Joseph",
    deletedDate: "3 weeks ago",
    originalLocation: "Personal",
    size: "0.5 KB",
    preview: "Quick notes and ideas that were captured during brainstorming session",
  },
  {
    id: "old-design",
    title: "Legacy Design System",
    type: "Design Doc",
    icon: "🎨",
    author: "Sarah Chen",
    deletedDate: "1 month ago",
    originalLocation: "Design Team",
    size: "5.7 KB",
    preview: "# Legacy Design System v1.0\n\n## Colors\n- Primary: #2563EB\n- Secondary: #64748B",
  },
]

export function TrashModal({ isOpen, onClose, onDocumentRestore, onDocumentDelete }: TrashModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"name" | "deleted" | "type">("deleted")
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("")
      setSelectedItems([])
    }
  }, [isOpen])

  // Filter and sort documents
  const filteredDocuments = trashedDocuments
    .filter((doc) => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.type.toLowerCase().includes(query) ||
        doc.author.toLowerCase().includes(query) ||
        doc.originalLocation.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "type":
          return a.type.localeCompare(b.type)
        case "deleted":
        default:
          return new Date(b.deletedDate).getTime() - new Date(a.deletedDate).getTime()
      }
    })

  const handleSelectItem = (docId: string) => {
    setSelectedItems((prev) => (prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]))
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredDocuments.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredDocuments.map((doc) => doc.id))
    }
  }

  const handleBulkRestore = () => {
    selectedItems.forEach((docId) => {
      onDocumentRestore?.(docId)
    })
    setSelectedItems([])
  }

  const handleBulkDelete = () => {
    selectedItems.forEach((docId) => {
      onDocumentDelete?.(docId)
    })
    setSelectedItems([])
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-red-600/30 text-red-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161618] border border-[#1E1E20] rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E1E20]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Trash</h2>
              <p className="text-sm text-gray-400">
                {filteredDocuments.length} item{filteredDocuments.length !== 1 ? "s" : ""} in trash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A2A2E] rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Controls */}
        <div className="p-6 border-b border-[#1E1E20] space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in trash..."
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1C] border border-[#2A2A2E] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-3 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm rounded-lg transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                {selectedItems.length === filteredDocuments.length ? "Deselect All" : "Select All"}
              </button>

              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkRestore}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore ({selectedItems.length})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Forever ({selectedItems.length})
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "deleted" | "type")}
                className="bg-[#2A2A2E] border border-[#323236] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="deleted">Date Deleted</option>
                <option value="name">Name</option>
                <option value="type">Type</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[calc(85vh-200px)]">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#2A2A2E] rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? "No matching items in trash" : "Trash is empty"}
              </h3>
              <p className="text-gray-400 max-w-md">
                {searchQuery
                  ? `No items in trash match "${searchQuery}". Try different keywords.`
                  : "Deleted documents will appear here. You can restore them or delete them permanently."}
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex items-center gap-4 p-4 bg-[#1A1A1C] border rounded-lg hover:bg-[#1E1E20] transition-colors ${
                      selectedItems.includes(doc.id) ? "border-red-500/50 bg-red-600/10" : "border-[#2A2A2E]"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleSelectItem(doc.id)}
                      className={`w-5 h-5 border-2 rounded transition-colors ${
                        selectedItems.includes(doc.id)
                          ? "border-red-500 bg-red-500"
                          : "border-gray-600 hover:border-red-500"
                      }`}
                    >
                      {selectedItems.includes(doc.id) && <CheckSquare className="w-5 h-5 text-white" />}
                    </button>

                    {/* Document Icon */}
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{doc.icon}</span>
                    </div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white truncate">{highlightMatch(doc.title, searchQuery)}</h4>
                        <span className="text-xs px-2 py-1 bg-[#2A2A2E] text-gray-400 rounded flex-shrink-0">
                          {doc.type}
                        </span>
                      </div>

                      {doc.preview && (
                        <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                          {highlightMatch(doc.preview.replace(/[#*`\n]/g, " ").trim(), searchQuery)}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{doc.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Deleted {doc.deletedDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Folder className="w-3 h-3" />
                          <span>{doc.originalLocation}</span>
                        </div>
                        {doc.size && <span>{doc.size}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDocumentRestore?.(doc.id)}
                        className="p-2 hover:bg-green-600/20 rounded-lg transition-colors text-green-400 hover:text-green-300"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDocumentDelete?.(doc.id)}
                        className="p-2 hover:bg-red-600/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                        title="Delete Forever"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-[#2A2A2E] rounded-lg transition-colors text-gray-400 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredDocuments.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-[#1E1E20] bg-[#1A1A1C]">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span>Items in trash will be permanently deleted after 30 days</span>
            </div>
            <div className="text-sm text-gray-500">
              {selectedItems.length > 0 && `${selectedItems.length} selected • `}
              {filteredDocuments.length} item{filteredDocuments.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
