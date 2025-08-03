"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import {
  Search,
  Plus,
  TrendingUp,
  Clock,
  FileText,
  Users,
  ArrowRight,
  Activity,
  Target,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Zap,
  BarChart3,
  Share2,
  Pencil,
  Star,
  Globe,
  History,
} from "lucide-react";

const DocumentsPage = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const onCreate = () => {
    setError("");
    setSuccess("");

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
    if (docId === "new") {
      onCreate();
    } else {
      router.push(`/documents/${docId}`);
    }
  };

  const onNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  const stats = [
    {
      label: "Pages Created",
      value: "47",
      change: "Last created 2h ago",
      icon: FileText,
      color: "text-blue-400",
    },
    {
      label: "Co-editors",
      value: "8",
      change: "Across 12 docs",
      icon: Users,
      color: "text-green-400",
    },
    {
      label: "Shared Documents",
      value: "15",
      change: "5 owned, 10 invited",
      icon: Share2,
      color: "text-purple-400",
    },
    {
      label: "Last Edited",
      value: "2h ago",
      change: "By John Doe",
      icon: Pencil,
      color: "text-orange-400",
    },
  ];

  const recentActivity = [
    {
      id: "1",
      type: "comment",
      message: "Sarah Chen commented on Q1 2024 Product Roadmap",
      time: "2 minutes ago",
      avatar: "SC",
      avatarColor: "bg-green-600",
    },
    {
      id: "2",
      type: "document",
      message: "You updated User Authentication System Spec",
      time: "1 hour ago",
      avatar:
        user?.name
          ?.split(" ")
          .map((n) => n[0])
          .join("") || "U",
      avatarColor: "bg-blue-600",
    },
    {
      id: "3",
      type: "collaboration",
      message: "Alex Rodriguez joined your workspace",
      time: "3 hours ago",
      avatar: "AR",
      avatarColor: "bg-orange-600",
    },
    {
      id: "4",
      type: "document",
      message: "Mike Johnson shared API Documentation with you",
      time: "1 day ago",
      avatar: "MJ",
      avatarColor: "bg-purple-600",
    },
  ];

  const quickActions = [
    {
      id: "new-page",
      title: "Create New Page",
      description: "Start writing immediately",
      icon: Plus,
      color: "bg-blue-600",
      action: () => onCreate(),
    },
    {
      id: "recently-edited",
      title: "Recently Edited",
      description: "Continue where you left off",
      icon: History,
      color: "bg-orange-600",
      action: () => onNavigate("recent"),
    },
    {
      id: "starred-pages",
      title: "Starred Pages",
      description: "Access your important pages",
      icon: Star,
      color: "bg-yellow-600",
      action: () => onNavigate("starred"),
    },
    {
      id: "discover-pages",
      title: "Discover Public Pages",
      description: "Explore community content",
      icon: Globe,
      color: "bg-green-600",
      action: () => onNavigate("explore"),
    },
  ];

  const upcomingTasks = [
    {
      id: "1",
      title: "Review API documentation",
      dueDate: "Today, 4:00 PM",
      priority: "high",
      completed: false,
    },
    {
      id: "2",
      title: "Team standup meeting",
      dueDate: "Tomorrow, 10:00 AM",
      priority: "medium",
      completed: false,
    },
    {
      id: "3",
      title: "Update design system guidelines",
      dueDate: "Jan 18, 2024",
      priority: "low",
      completed: false,
    },
    {
      id: "4",
      title: "Prepare Q1 presentation",
      dueDate: "Jan 20, 2024",
      priority: "high",
      completed: false,
    },
  ];

  const recentDocuments = [
    {
      id: "project-roadmap",
      title: "Q1 2024 Product Roadmap",
      type: "Project Plan",
      lastModified: "2 hours ago",
      icon: "🎯",
    },
    {
      id: "meeting-notes-jan",
      title: "Weekly Team Sync - January 15",
      type: "Meeting Notes",
      lastModified: "1 day ago",
      icon: "📋",
    },
    {
      id: "feature-spec",
      title: "User Authentication System Spec",
      type: "Technical Spec",
      lastModified: "3 days ago",
      icon: "🔐",
    },
    {
      id: "design-system",
      title: "Design System Guidelines",
      type: "Design Doc",
      lastModified: "5 days ago",
      icon: "🎨",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0B0F]">
      {/* Header */}
      <header className="h-[72px] flex items-center justify-between px-8 border-b border-gray-200 dark:border-[#1E1E20]">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search pages, projects, and more..."
            className="bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 text-sm focus-visible:ring-0 p-0"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Page
          </button>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
              {user?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-10">
            <h1 className="text-[32px] font-bold text-gray-900 dark:text-white leading-tight mb-2">
              {greeting}, {user?.name?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Ready to make today productive? Here&apos;s what&apos;s happening.
            </p>
          </div>

          {/* Stats Overview */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Overview
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-[#2A2A2E] rounded-lg flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          stat.change.startsWith("+")
                            ? "text-green-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-[#1A1A1C] transition-colors text-left group"
                  >
                    <div
                      className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h2>
                </div>
                <button
                  onClick={() => onNavigate("notifications")}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  View all <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-[#1E1E20]">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 hover:bg-gray-100 dark:hover:bg-[#1A1A1C] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 ${activity.avatarColor} rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0`}
                        >
                          {activity.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Upcoming Tasks */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Upcoming Tasks
                  </h2>
                </div>
                <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  View all <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-[#1E1E20]">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 hover:bg-gray-100 dark:hover:bg-[#1A1A1C] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button className="w-5 h-5 border-2 border-gray-400 dark:border-gray-600 rounded hover:border-blue-500 transition-colors flex-shrink-0">
                          {task.completed && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </h4>
                            <AlertCircle
                              className={`w-4 h-4 ${getPriorityColor(
                                task.priority
                              )}`}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.dueDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Recent Documents */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Documents
                </h2>
              </div>
              <button
                onClick={() => onNavigate("library")}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                View library <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onDocumentSelect(doc.id)}
                  className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-[#1A1A1C] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{doc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-400 transition-colors line-clamp-1">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Modified {doc.lastModified}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DocumentsPage;
