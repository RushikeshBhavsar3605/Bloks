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
import { PageTitle } from "@/components/main/page-title";
import {
  FileText,
  Clock,
  BookOpen,
  Target,
  Briefcase,
  Calendar,
  Plus,
} from "lucide-react";
import { getAllDocuments } from "@/actions/documents/get-all-documents";
import { Document, User } from "@prisma/client";

type customDocumentWithMeta = Document & {
  lastEditedBy: User | null;
  owner: {
    name: string | null;
    email: string | null;
  };
};

const LibraryPage = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const {
    isOpen: isUpgradeAlertOpen,
    openUpgradeAlert,
    closeUpgradeAlert,
  } = useUpgradeAlert();
  const [documents, setDocuments] = useState<customDocumentWithMeta[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      const response = await getAllDocuments();

      setDocuments(response);
    };

    fetchDocuments();
  }, [user?.id]);

  const onCreate = () => {
    createDocumentWithUpgradeCheck({
      title: "Untitled",
      onSuccess: (document) => {
        router.push(`/documents/${document.id}`);
      },
      onUpgradeRequired: openUpgradeAlert,
    });
  };

  const onDocumentSelect = (docId: string) => {
    if (docId === "new" || docId === "blank-page") {
      onCreate();
    } else if (
      docId === "new-project" ||
      docId === "meeting-notes" ||
      docId === "task-list"
    ) {
      // For template-based creation, we can still use the basic create function
      // In a real app, you might want to create with specific templates
      onCreate();
    } else {
      router.push(`/documents/${docId}`);
    }
  };

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

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0B0F]">
      <div className="h-[72px]" />
      {/* Header */}
      {/* <PageHeader 
        searchPlaceholder="Search for pages, projects, tasks & folders"
        showImportButton={true}
        onNewPageClick={onCreate}
        additionalButtons={
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
        }
      /> */}

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
            <button className="pb-3 text-sm font-medium transition-colors relative text-gray-900 dark:text-white">
              Pages
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white rounded-full" />
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
              {documents.map((page) => (
                <DocumentCard
                  key={page.id}
                  id={page.id}
                  title={page.title}
                  type="Document"
                  icon={page.icon as string}
                  preview={page.content || "Empty"}
                  author={page.owner.name as string}
                  timestamp={page.createdAt}
                  lastModified={page.lastEditedAt ?? undefined}
                  onClick={onDocumentSelect}
                  showPreview={true}
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

export default LibraryPage;
