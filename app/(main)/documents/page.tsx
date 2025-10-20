"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UpgradeAlertModal } from "@/components/modals/upgrade-alert-modal";
import { useUpgradeAlert } from "@/hooks/use-upgrade-alert";
import { createDocumentWithUpgradeCheck } from "@/lib/document-creation-utils";
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
import { Document, User } from "@prisma/client";
import { getAllDocumentsPaginated } from "@/actions/documents/get-all-documents-paginated";

type customDocumentWithMeta = Document & {
  lastEditedBy: User | null;
  owner: {
    name: string | null;
    email: string | null;
  };
};

function getRelativeTimeMessage(
  createdDate: Date | null,
  isEdited?: boolean
): string {
  if (!createdDate) return "No documents";

  const currDate = new Date();
  const diffMs = currDate.getTime() - createdDate.getTime();
  const diffHr = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffHr < 1) return isEdited ? "Just now" : "Created recently";
  if (diffHr < 24)
    return isEdited ? `${diffHr}h ago` : `Last created ${diffHr}h ago`;
  return isEdited ? `${diffDay}d ago` : `Last created ${diffDay}d ago`;
}

const DocumentsPage = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const { socket } = useSocket();
  const {
    isOpen: isUpgradeAlertOpen,
    openUpgradeAlert,
    closeUpgradeAlert,
  } = useUpgradeAlert();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const [created, setCreated] = useState<{
    count: number;
    date: Date | null;
  }>();
  const [coeditors, setCoeditors] = useState<{
    count: number;
    documents: number;
  }>();
  const [collaborated, setCollaborated] = useState<{
    owned: number;
    coauthored: number;
  }>();
  const [edited, setEdited] = useState<{ name: string; date: Date | null }>();
  const [recentDocuments, setRecentDocuments] =
    useState<customDocumentWithMeta[]>();

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
      const count = created !== undefined ? created.count + 1 : 1;
      setCreated({ count: count, date: new Date(data.createdAt) });
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

  useEffect(() => {
    const fetchDocuments = async () => {
      const response = await getAllDocumentsPaginated(4, 0);

      setRecentDocuments(response.documents);
    };

    fetchDocuments();
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

    createDocumentWithUpgradeCheck({
      title: "Untitled",
      onSuccess: (document) => {
        router.push(`/documents/${document.id}`);
      },
      onUpgradeRequired: openUpgradeAlert,
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

  if (
    created === undefined ||
    coeditors === undefined ||
    collaborated === undefined ||
    edited === undefined ||
    recentDocuments === undefined
  ) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0B0F]">
        <div className="h-[72px]" />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-8 py-8">
            {/* Welcome Section Skeleton */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-48 bg-gray-200 dark:bg-[#2A2A2E] rounded animate-pulse" />
              </div>
              <div className="h-4 w-80 bg-gray-200 dark:bg-[#2A2A2E] rounded animate-pulse" />
            </div>

            {/* Stats Overview Skeleton */}
            <section className="mb-12">
              <SectionHeader icon={TrendingUp} title="Overview" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <StatsCard.Skeleton key={index} variant="stats" />
                ))}
              </div>
            </section>

            {/* Quick Actions Skeleton */}
            <section className="mb-12">
              <SectionHeader icon={Zap} title="Quick Actions" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ActionCard.Skeleton key={index} variant="documents" />
                ))}
              </div>
            </section>

            {/* Recent Documents Skeleton */}
            <section className="mt-12">
              <SectionHeader
                icon={Clock}
                title="Recent Documents"
                actionButton={
                  <div className="h-4 w-24 bg-gray-200 dark:bg-[#2A2A2E] rounded animate-pulse" />
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <DocumentCard.Skeleton key={index} showPreview={false} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

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
      change: `${collaborated.owned} owned\n${collaborated.coauthored} co-authored`,
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
                  type="Document"
                  icon={doc.icon}
                  lastModified={doc.lastEditedAt || doc.createdAt}
                  onClick={onDocumentSelect}
                  showPreview={false}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
      <UpgradeAlertModal
        isOpen={isUpgradeAlertOpen}
        onClose={closeUpgradeAlert}
      />
    </div>
  );
};

export default DocumentsPage;
