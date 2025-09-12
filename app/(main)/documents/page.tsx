"use client";

import { useEffect, useState } from "react";
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
  TrendingUp,
  Clock,
  FileText,
  Users,
  ArrowRight,
  Activity,
  CheckCircle,
  AlertCircle,
  Zap,
  Share2,
  Pencil,
  Plus,
  Star,
  Globe,
  History,
} from "lucide-react";
import { getDocumentsCount } from "@/actions/documents/get-documents-count";
import { useSocket } from "@/components/providers/socket-provider";
import { DocumentWithMeta } from "@/types/shared";
import { getCoeditors } from "@/actions/collaborators/get-co-editors";
import { getSharedDocuments } from "@/actions/collaborators/get-shared-documents";
import { getLasteditedDocument } from "@/actions/documents/get-lastedited-document";
import { Document } from "@prisma/client";

function getRelativeTimeMessage(
  createdDate: Date | null,
  isEdited?: boolean
): string {
  if (!createdDate) return "No documents";

  const currDate = new Date();
  const diffMs = currDate.getTime() - createdDate.getTime();
  const diffHr = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffHr < 1)
    return isEdited ? "Few minutes ago" : "Created a few minutes ago";
  if (diffHr < 24)
    return isEdited ? `${diffHr}h ago` : `Last created ${diffHr}h ago`;
  return isEdited ? `${diffDay}d ago` : `Last created ${diffDay}d ago`;
}

const DocumentsPage = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const { socket } = useSocket();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const [created, setCreated] = useState<{ count: number; date: Date | null }>({
    count: 0,
    date: null,
  });
  const [coeditors, setCoeditors] = useState<{
    count: number;
    documents: number;
  }>({ count: 0, documents: 0 });
  const [collaborated, setCollaborated] = useState<{
    owned: number;
    coauthored: number;
  }>({
    owned: 0,
    coauthored: 0,
  });
  const [edited, setEdited] = useState<{ name: string; date: Date | null }>({
    name: "",
    date: null,
  });

  useEffect(() => {
    const fetchCreated = async () => {
      const documents = await getDocumentsCount(user?.id as string);
      setCreated({ count: documents.count, date: documents.date });
    };

    fetchCreated();
  }, [user?.id]);

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (data: DocumentWithMeta) => {
      const count = created.count + 1;
      setCreated({ count: count, date: data.createdAt });
    };

    const createEvent = "document:created:root";

    socket.on(createEvent, handleCreated);

    return () => {
      socket.off(createEvent, handleCreated);
    };
  }, [socket, user?.id]);

  useEffect(() => {
    const fetchCoeditors = async () => {
      const response = await getCoeditors(user?.id as string);
      setCoeditors({
        count: response.totalUniqueCollaborators,
        documents: response.count,
      });
    };

    fetchCoeditors();
  }, [user?.id]);

  useEffect(() => {
    const fetchShared = async () => {
      const response = await getSharedDocuments(user?.id as string);
      setCollaborated({
        owned: response.owned,
        coauthored: response.coauthored,
      });
    };

    fetchShared();
  }, [user?.id]);

  useEffect(() => {
    const fetchLastEdited = async () => {
      const response = await getLasteditedDocument(user?.id as string);
      setEdited({
        name: user?.id === response.id ? "you" : response.name,
        date: response.date,
      });
    };

    fetchLastEdited();
  }, [user?.id]);

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
    })
      .then((res) => res.json())
      .then((document: Document) => {
        router.push(`/documents/${document.id}`);
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
      value: `${created.count}`,
      change: getRelativeTimeMessage(created.date),
      icon: FileText,
      color: "text-blue-400",
    },
    {
      label: "Co-editors",
      value: `${coeditors.count}`,
      change: `Across ${coeditors.documents} docs`,
      icon: Users,
      color: "text-green-400",
    },
    {
      label: "Collaborated Documents",
      value: `${collaborated.owned + collaborated.coauthored}`,
      change: `${collaborated.owned} owned · ${collaborated.coauthored} co-authored`,
      icon: Share2,
      color: "text-purple-400",
    },
    {
      label: "Last Edited",
      value: getRelativeTimeMessage(edited.date, true),
      change: `By ${edited.name}`,
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
      action: () => onNavigate("library"),
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
      lastModified: new Date(),
      icon: "🎯",
    },
    {
      id: "meeting-notes-jan",
      title: "Weekly Team Sync - January 15",
      type: "Meeting Notes",
      lastModified: new Date(),
      icon: "📋",
    },
    {
      id: "feature-spec",
      title: "User Authentication System Spec",
      type: "Technical Spec",
      lastModified: new Date(),
      icon: "🔐",
    },
    {
      id: "design-system",
      title: "Design System Guidelines",
      type: "Design Doc",
      lastModified: new Date(),
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
      <div className="h-[72px]" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-8 py-8">
          {/* Welcome Section */}
          <PageTitle
            title={`${greeting}, ${user?.name?.split(" ")[0] || "User"}!`}
            subtitle="Ready to make today productive? Here's what's happening."
            showEmoji={true}
          />

          {/* Stats Overview */}
          <section className="mb-12">
            <SectionHeader icon={TrendingUp} title="Overview" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
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

          {/* Quick Actions */}
          <section className="mb-12">
            <SectionHeader icon={Zap} title="Quick Actions" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <ActionCard
                  key={action.id}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  iconColor={action.color}
                  onClick={action.action}
                  variant="documents"
                />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <section>
              <SectionHeader
                icon={Activity}
                title="Recent Activity"
                actionButton={
                  <button
                    onClick={() => onNavigate("notifications")}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    View all <ArrowRight className="w-4 h-4" />
                  </button>
                }
              />
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
              <SectionHeader
                icon={CheckCircle}
                title="Upcoming Tasks"
                actionButton={
                  <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    View all <ArrowRight className="w-4 h-4" />
                  </button>
                }
              />
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
            <SectionHeader
              icon={Clock}
              title="Recent Documents"
              actionButton={
                <button
                  onClick={() => onNavigate("library")}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  View library <ArrowRight className="w-4 h-4" />
                </button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  type={doc.type}
                  icon={doc.icon}
                  lastModified={doc.lastModified}
                  onClick={onDocumentSelect}
                  showPreview={false}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DocumentsPage;
