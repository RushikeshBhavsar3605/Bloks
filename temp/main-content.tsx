"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
  Upload,
  Plus,
  ArrowRight,
  FileText,
  Folder,
  MoreHorizontal,
  User,
  Clock,
  BookOpen,
  Target,
  Briefcase,
  Calendar,
} from "lucide-react"

interface MainContentProps {
  onDocumentSelect: (docId: string) => void
}

export function MainContent({ onDocumentSelect }: MainContentProps) {
  const [activeTab, setActiveTab] = useState("pages")

  const folders = [
    { id: "projects", name: "Active Projects", count: 12, icon: "🚀" },
    { id: "meeting-notes", name: "Meeting Notes", count: 8, icon: "📝" },
    { id: "research", name: "Research & Ideas", count: 24, icon: "💡" },
    { id: "personal", name: "Personal", count: 6, icon: "👤" },
    { id: "templates", name: "Templates", count: 15, icon: "📋" },
  ]

  const pages = [
    {
      id: "project-roadmap",
      title: "Q1 2024 Product Roadmap",
      preview:
        "# Q1 2024 Product Roadmap\n\n## Key Objectives\n- Launch new user dashboard\n- Implement real-time collaboration\n- Mobile app beta release\n\n## Timeline\n**January**\n- User research and wireframes\n- Technical architecture planning",
      author: "Rushikesh Joseph",
      timestamp: "2h ago",
      workspace: "Rushikesh's Workspace",
      type: "Project Plan",
      icon: "🎯",
    },
    {
      id: "meeting-notes-jan",
      title: "Weekly Team Sync - January 15",
      preview:
        "# Weekly Team Sync\n**Date:** January 15, 2024\n**Attendees:** Sarah, Mike, Alex, Rushikesh\n\n## Agenda\n1. Sprint review\n2. Upcoming deadlines\n3. Blockers discussion\n\n## Action Items\n- [ ] Update API documentation",
      author: "Rushikesh Joseph",
      timestamp: "1d ago",
      workspace: "Rushikesh's Workspace",
      type: "Meeting Notes",
      icon: "📋",
    },
    {
      id: "feature-spec",
      title: "User Authentication System Spec",
      preview:
        "# User Authentication System\n\n## Overview\nImplement a secure, scalable authentication system supporting multiple providers.\n\n## Requirements\n- OAuth integration (Google, GitHub)\n- JWT token management\n- Role-based access control",
      author: "Rushikesh Joseph",
      timestamp: "3d ago",
      workspace: "Rushikesh's Workspace",
      type: "Technical Spec",
      icon: "🔐",
    },
    {
      id: "design-system",
      title: "Design System Guidelines",
      preview:
        "# Design System v2.0\n\n## Color Palette\n- Primary: #3B82F6\n- Secondary: #6B7280\n- Success: #10B981\n\n## Typography\n- Headings: Inter Bold\n- Body: Inter Regular\n\n## Components\nButton, Card, Modal, Form elements...",
      author: "Rushikesh Joseph",
      timestamp: "5d ago",
      workspace: "Rushikesh's Workspace",
      type: "Design Doc",
      icon: "🎨",
    },
    {
      id: "user-research",
      title: "User Interview Insights - December",
      preview:
        '# User Research Summary\n\n## Key Findings\n1. Users want faster page loading\n2. Mobile experience needs improvement\n3. Search functionality is crucial\n\n## Quotes\n"I love the clean interface but wish it was faster"\n"Mobile app would be game-changing"',
      author: "Rushikesh Joseph",
      timestamp: "1w ago",
      workspace: "Rushikesh's Workspace",
      type: "Research",
      icon: "🔍",
    },
    {
      id: "api-docs",
      title: "REST API Documentation",
      preview:
        "# API Documentation\n\n## Authentication\nAll API requests require authentication via Bearer token.\n\n```\nAuthorization: Bearer <your-token>\n```\n\n## Endpoints\n\n### Users\n- GET /api/users\n- POST /api/users\n- PUT /api/users/:id",
      author: "Rushikesh Joseph",
      timestamp: "1w ago",
      workspace: "Rushikesh's Workspace",
      type: "Documentation",
      icon: "📚",
    },
    {
      id: "brainstorm",
      title: "Product Ideas Brainstorm",
      preview:
        "# Product Ideas 💡\n\n## New Features\n- [ ] Dark mode toggle\n- [ ] Collaborative editing\n- [ ] Template marketplace\n- [ ] Advanced search filters\n\n## Integrations\n- Slack notifications\n- GitHub sync\n- Calendar integration",
      author: "Rushikesh Joseph",
      timestamp: "2w ago",
      workspace: "Rushikesh's Workspace",
      type: "Brainstorm",
      icon: "💭",
    },
  ]

  return (
    <div className="flex-1 flex flex-col bg-[#0B0B0F]">
      {/* Header */}
      <header className="h-[72px] flex items-center justify-between px-8 border-b border-[#1E1E20]">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search for pages, projects, tasks & folders"
            className="bg-transparent border-none text-white placeholder-gray-500 text-sm focus-visible:ring-0 p-0"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            New Page
          </button>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">R</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2 tracking-wider">
              <span>WORKSPACE</span>
            </div>
            <h1 className="text-[32px] font-bold text-white leading-tight">My Workspace</h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-8 mb-10">
            <button
              onClick={() => setActiveTab("pages")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "pages" ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Pages
              {activeTab === "pages" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "templates" ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Templates
              {activeTab === "templates" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-white">Quick Start</h2>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <button
                className="bg-[#161618] rounded-xl p-5 hover:bg-[#1A1A1C] transition-colors cursor-pointer group border border-[#1E1E20] text-left"
                onClick={() => onDocumentSelect("new-project")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">New Project</h3>
                    <p className="text-xs text-gray-500">Start a new project</p>
                  </div>
                </div>
              </button>
              <button
                className="bg-[#161618] rounded-xl p-5 hover:bg-[#1A1A1C] transition-colors cursor-pointer group border border-[#1E1E20] text-left"
                onClick={() => onDocumentSelect("meeting-notes")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Meeting Notes</h3>
                    <p className="text-xs text-gray-500">Take meeting notes</p>
                  </div>
                </div>
              </button>
              <button
                className="bg-[#161618] rounded-xl p-5 hover:bg-[#1A1A1C] transition-colors cursor-pointer group border border-[#1E1E20] text-left"
                onClick={() => onDocumentSelect("task-list")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Task List</h3>
                    <p className="text-xs text-gray-500">Create a to-do list</p>
                  </div>
                </div>
              </button>
              <button
                className="bg-[#161618] rounded-xl p-5 hover:bg-[#1A1A1C] transition-colors cursor-pointer group border border-[#1E1E20] text-left"
                onClick={() => onDocumentSelect("blank-page")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">Blank Page</h3>
                    <p className="text-xs text-gray-500">Start from scratch</p>
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Folders Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Folder className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-semibold text-white">Folders</h2>
              </div>
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                See all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-[#161618] rounded-xl p-5 hover:bg-[#1A1A1C] transition-colors cursor-pointer group border border-[#1E1E20]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl">{folder.icon}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#2A2A2E] rounded">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <h3 className="font-medium text-white text-sm mb-1 leading-tight">{folder.name}</h3>
                  <p className="text-xs text-gray-500">{folder.count} pages</p>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Pages Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-semibold text-white">Recent Pages</h2>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors"
                onClick={() => onDocumentSelect("new")}
              >
                <Plus className="w-4 h-4" />
                New Page
              </button>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="bg-[#161618] rounded-xl overflow-hidden hover:bg-[#1A1A1C] transition-colors cursor-pointer group border border-[#1E1E20]"
                  onClick={() => onDocumentSelect(page.id)}
                >
                  {/* Page Preview */}
                  <div className="aspect-video bg-[#0F0F11] relative overflow-hidden p-4">
                    <div className="text-xs font-mono text-gray-300 leading-relaxed">
                      {page.preview.substring(0, 150)}...
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className="text-xl">{page.icon}</span>
                    </div>
                  </div>

                  {/* Page Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 bg-[#2A2A2E] text-gray-300 rounded">{page.type}</span>
                    </div>
                    <h3 className="font-medium text-white text-sm mb-3 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                      {page.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <User className="w-3 h-3" />
                      <span>{page.author}</span>
                      <span>•</span>
                      <span>{page.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">{page.workspace}</div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#2A2A2E] rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
