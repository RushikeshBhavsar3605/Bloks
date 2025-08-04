"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import { PageHeader } from "@/components/main/page-header";
import { SectionHeader } from "@/components/main/section-header";
import { DocumentCard } from "@/components/main/document-card";
import { ActionCard } from "@/components/main/action-card";
import { StatsCard } from "@/components/main/stats-card";
import { PageTitle } from "@/components/main/page-title";
import {
  Upload,
  ArrowRight,
  FileText,
  Folder,
  Clock,
  BookOpen,
  Target,
  Briefcase,
  Calendar,
  Plus,
} from "lucide-react";

const LibraryPage = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pages");

  const onCreate = () => {
    const promise = fetch("/api/socket/documents", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Untitled" }),
    });

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note.",
    });
  };

  const onDocumentSelect = (docId: string) => {
    if (docId === "new" || docId === "blank-page") {
      onCreate();
    } else if (docId === "new-project" || docId === "meeting-notes" || docId === "task-list") {
      // For template-based creation, we can still use the basic create function
      // In a real app, you might want to create with specific templates
      onCreate();
    } else {
      router.push(`/documents/${docId}`);
    }
  };

  const folders = [
    { id: "projects", name: "Active Projects", count: 12, icon: "🚀" },
    { id: "meeting-notes", name: "Meeting Notes", count: 8, icon: "📝" },
    { id: "research", name: "Research & Ideas", count: 24, icon: "💡" },
    { id: "personal", name: "Personal", count: 6, icon: "👤" },
    { id: "templates", name: "Templates", count: 15, icon: "📋" },
  ];

  const quickStartActions = [
    {
      id: "new-project",
      title: "New Project",
      description: "Start a new project",
      icon: Briefcase,
      color: "bg-blue-600",
      action: () => onDocumentSelect("new-project"),
    },
    {
      id: "meeting-notes",
      title: "Meeting Notes",
      description: "Take meeting notes",
      icon: Calendar,
      color: "bg-green-600",
      action: () => onDocumentSelect("meeting-notes"),
    },
    {
      id: "task-list",
      title: "Task List",
      description: "Create a to-do list",
      icon: FileText,
      color: "bg-purple-600",
      action: () => onDocumentSelect("task-list"),
    },
    {
      id: "blank-page",
      title: "Blank Page",
      description: "Start from scratch",
      icon: BookOpen,
      color: "bg-gray-600",
      action: () => onDocumentSelect("blank-page"),
    },
  ];

  const pages = [
    {
      id: "project-roadmap",
      title: "Q1 2024 Product Roadmap",
      preview:
        "# Q1 2024 Product Roadmap\n\n## Key Objectives\n- Launch new user dashboard\n- Implement real-time collaboration\n- Mobile app beta release\n\n## Timeline\n**January**\n- User research and wireframes\n- Technical architecture planning",
      author: user?.name || "User",
      timestamp: "2h ago",
      workspace: `${user?.name?.split(" ")[0] || "User"}'s Workspace`,
      type: "Project Plan",
      icon: "🎯",
    },
    {
      id: "meeting-notes-jan",
      title: "Weekly Team Sync - January 15",
      preview:
        "# Weekly Team Sync\n**Date:** January 15, 2024\n**Attendees:** Sarah, Mike, Alex, User\n\n## Agenda\n1. Sprint review\n2. Upcoming deadlines\n3. Blockers discussion\n\n## Action Items\n- [ ] Update API documentation",
      author: user?.name || "User",
      timestamp: "1d ago",
      workspace: `${user?.name?.split(" ")[0] || "User"}'s Workspace`,
      type: "Meeting Notes",
      icon: "📋",
    },
    {
      id: "feature-spec",
      title: "User Authentication System Spec",
      preview:
        "# User Authentication System\n\n## Overview\nImplement a secure, scalable authentication system supporting multiple providers.\n\n## Requirements\n- OAuth integration (Google, GitHub)\n- JWT token management\n- Role-based access control",
      author: user?.name || "User",
      timestamp: "3d ago",
      workspace: `${user?.name?.split(" ")[0] || "User"}'s Workspace`,
      type: "Technical Spec",
      icon: "🔐",
    },
    {
      id: "design-system",
      title: "Design System Guidelines",
      preview:
        "# Design System v2.0\n\n## Color Palette\n- Primary: #3B82F6\n- Secondary: #6B7280\n- Success: #10B981\n\n## Typography\n- Headings: Inter Bold\n- Body: Inter Regular\n\n## Components\nButton, Card, Modal, Form elements...",
      author: user?.name || "User",
      timestamp: "5d ago",
      workspace: `${user?.name?.split(" ")[0] || "User"}'s Workspace`,
      type: "Design Doc",
      icon: "🎨",
    },
    {
      id: "user-research",
      title: "User Interview Insights - December",
      preview:
        '# User Research Summary\n\n## Key Findings\n1. Users want faster page loading\n2. Mobile experience needs improvement\n3. Search functionality is crucial\n\n## Quotes\n"I love the clean interface but wish it was faster"\n"Mobile app would be game-changing"',
      author: user?.name || "User",
      timestamp: "1w ago",
      workspace: `${user?.name?.split(" ")[0] || "User"}'s Workspace`,
      type: "Research",
      icon: "🔍",
    },
    {
      id: "api-docs",
      title: "REST API Documentation",
      preview:
        "# API Documentation\n\n## Authentication\nAll API requests require authentication via Bearer token.\n\n```\nAuthorization: Bearer <your-token>\n```\n\n## Endpoints\n\n### Users\n- GET /api/users\n- POST /api/users\n- PUT /api/users/:id",
      author: user?.name || "User",
      timestamp: "1w ago",
      workspace: `${user?.name?.split(" ")[0] || "User"}'s Workspace`,
      type: "Documentation",
      icon: "📚",
    },
    {
      id: "brainstorm",
      title: "Product Ideas Brainstorm",
      preview:
        "# Product Ideas 💡\n\n## New Features\n- [ ] Dark mode toggle\n- [ ] Collaborative editing\n- [ ] Template marketplace\n- [ ] Advanced search filters\n\n## Integrations\n- Slack notifications\n- GitHub sync\n- Calendar integration",
      author: user?.name || "User",
      timestamp: "2w ago",
      workspace: `${user?.name?.split(" ")[0] || "User"}'s Workspace`,
      type: "Brainstorm",
      icon: "💭",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0B0F]">
      {/* Header */}
      <PageHeader 
        searchPlaceholder="Search for pages, projects, tasks & folders"
        showImportButton={true}
        onNewPageClick={onCreate}
        additionalButtons={
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
        }
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-8 py-8">
          {/* Page Title */}
          <PageTitle
            title={`${user?.name?.split(" ")[0] || "My"} Workspace`}
            breadcrumb="WORKSPACE"
          />

          {/* Tabs */}
          <div className="flex items-center gap-8 mb-10">
            <button
              onClick={() => setActiveTab("pages")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "pages"
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Pages
              {activeTab === "pages" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "templates"
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Templates
              {activeTab === "templates" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white rounded-full"></div>
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <section className="mb-12">
            <SectionHeader icon={Target} title="Quick Start" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStartActions.map((action) => (
                <ActionCard
                  key={action.id}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  iconColor={action.color}
                  onClick={action.action}
                  variant="library"
                />
              ))}
            </div>
          </section>

          {/* Folders Section */}
          <section className="mb-12">
            <SectionHeader 
              icon={Folder} 
              title="Folders"
              actionButton={
                <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  See all <ArrowRight className="w-4 h-4" />
                </button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {folders.map((folder) => (
                <StatsCard
                  key={folder.id}
                  icon={Folder}
                  iconColor=""
                  value=""
                  label=""
                  emoji={folder.icon}
                  name={folder.name}
                  count={folder.count}
                  variant="folder"
                  onClick={() => {}}
                />
              ))}
            </div>
          </section>

          {/* Recent Pages Section */}
          <section>
            <SectionHeader 
              icon={Clock} 
              title="Recent Pages"
              actionButton={
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                  onClick={() => onDocumentSelect("new")}
                >
                  <Plus className="w-4 h-4" />
                  New Page
                </button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pages.map((page) => (
                <DocumentCard
                  key={page.id}
                  id={page.id}
                  title={page.title}
                  type={page.type}
                  icon={page.icon}
                  preview={page.preview}
                  author={page.author}
                  timestamp={page.timestamp}
                  workspace={page.workspace}
                  onClick={onDocumentSelect}
                  showPreview={true}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LibraryPage;