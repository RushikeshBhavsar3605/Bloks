"use client";

import { useEffect, useState, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { getAllDocumentsPaginated } from "@/actions/documents/get-all-documents-paginated";
import { Document, User } from "@prisma/client";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const LIMIT = 10;

  // Fetch initial documents
  useEffect(() => {
    const fetchInitialDocuments = async () => {
      setLoading(true);
      try {
        const response = await getAllDocumentsPaginated(LIMIT, 0);
        setDocuments(response.documents);
        setHasMore(response.hasMore);
        setOffset(LIMIT);
      } catch (error) {
        console.error("Error fetching initial documents:", error);
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialDocuments();
  }, [user?.id]);

  // Load more documents
  const loadMoreDocuments = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const response = await getAllDocumentsPaginated(LIMIT, offset);
      setDocuments((prev) => [...prev, ...response.documents]);
      setHasMore(response.hasMore);
      setOffset((prev) => prev + LIMIT);
    } catch (error) {
      console.error("Error loading more documents:", error);
      toast.error("Failed to load more documents. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }, [offset, loadingMore, hasMore]);

  const onCreate = ({
    title,
    content,
  }: {
    title?: string;
    content?: string;
  }) => {
    createDocumentWithUpgradeCheck({
      title: title || "Untitled",
      content,
      onSuccess: (document) => {
        router.push(`/documents/${document.id}`);
      },
      onUpgradeRequired: openUpgradeAlert,
    });
  };

  const onDocumentSelect = (docId: string) => {
    if (docId === "new" || docId === "blank-page") {
      onCreate({});
    }
    // else if (
    //   docId === "new-project" ||
    //   docId === "meeting-notes" ||
    //   docId === "task-list"
    // ) {
    //   // For template-based creation, we can still use the basic create function
    //   // In a real app, you might want to create with specific templates
    //   onCreate();
    // } else {
    //   router.push(`/documents/${docId}`);
    // }
    else if (docId === "new-project") {
      onCreate({
        title: "{{Project Name}}",
        content: `<p>Status: Draft | Active | On Hold</p><p>Owner: {{Owner}} • Updated: {{YYYY-MM-DD}}</p><h2>Summary</h2><p>One or two sentences on the problem, proposed solution, and expected impact.</p><h2>Goals &amp; Metrics</h2><ul><li><p>{{Goal}} — Metric: {{baseline}} → {{target}} by {{date}}</p></li><li><p>{{Goal}} — Metric: {{baseline}} → {{target}} by {{date}}</p></li></ul><h2>Scope</h2><ul><li><p>In: {{key components/services/user flows}}</p></li><li><p>Out: {{explicit exclusions}}</p></li></ul><h2>Requirements</h2><ul><li><p>Functional: {{behavior 1}}; {{behavior 2}}</p></li><li><p>Non-Functional: p95 ≤ {{X}} ms; Reliability {{SLO}}; Security {{note}}</p></li></ul><h2>Plan &amp; Milestones</h2><ul><li><p>M1: {{milestone}} — {{YYYY-MM-DD}}</p></li><li><p>M2: {{milestone}} — {{YYYY-MM-DD}}</p></li><li><p>Launch: {{YYYY-MM-DD}}</p></li></ul><h2>Risks</h2><ul><li><p>{{risk}} — Mitigation: {{plan}} — Owner: {{name}}</p></li></ul><h2>Stakeholders</h2><ul><li><p>Engg: {{names}} • PM: {{names}} • Design: {{names}}</p></li></ul><h2>Decisions &amp; Open Questions</h2><ul><li><p>Decision: {{what}} — Rationale: {{why}}</p></li><li><p>Open: {{question}} — Owner: {{name}}</p></li></ul><p></p>`,
      });
    } else if (docId === "meeting-notes") {
      onCreate({
        title: "Meeting: {{Topic}}",
        content: `<p>Date: {{YYYY-MM-DD}}</p><p>Time: {{Start–End}} {{TZ}}</p><p>Facilitator: {{Name}}</p><p>Note Taker: {{Name}}</p><h2>Attendees</h2><ul><li><p>{{Name}} (Role)</p></li><li><p>{{Name}} (Role)</p></li></ul><h2>Agenda</h2><ul><li><p>{{Item 1}} ({{mins}})</p></li><li><p>{{Item 2}} ({{mins}})</p></li></ul><h2>Discussion Notes</h2><ul><li><p>{{Key point or decision context}}</p></li><li><p>{{Data/links referenced}}</p></li></ul><h2>Decisions</h2><ul><li><p>Decision: {{what}} — Owner: {{who}} — Effective: {{date}}</p></li></ul><h2>Action Items</h2><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>{{Action}} — Owner: {{who}} — Due: {{YYYY-MM-DD}}</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>{{Action}} — Owner: {{who}} — Due: {{YYYY-MM-DD}}</p></div></li></ul><h2>Parking Lot</h2><ul><li><p>{{Topic to revisit}} — Owner: {{who}}</p></li></ul><h2>Next Meeting</h2><ul><li><p>Tentative: {{YYYY-MM-DD}} — Goals: {{objectives}}</p></li></ul><p></p>`,
      });
    } else if (docId === "task-list") {
      onCreate({
        title: "Task List",
        content: `<p>Priority Legend: 🔴 High • 🟠 Medium • 🟢 Low</p><p>Status: Inbox | Backlog | In Progress | Blocked | Review | Done</p><h2>Inbox</h2><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>{{Task}} — Owner: {{Name}} — Priority: 🟠 — Due: {{YYYY-MM-DD}} — Tags: {{#tag}}</p></div></li></ul><p>## Backlog</p><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>{{Task}} — Owner: {{Name}} — Priority: 🟢 — Due: {{YYYY-MM-DD}}</p></div></li></ul><p>## In Progress</p><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>{{Task}} — Owner: {{Name}} — Priority: 🔴 — Started: {{YYYY-MM-DD}}</p></div></li></ul><p>## Blocked</p><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>{{Task}} — Blocker: {{dependency}} — Owner: {{Name}} — ETA: {{YYYY-MM-DD}}</p></div></li></ul><p>## Review</p><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>{{Task}} — Reviewer: {{Name}} — PR: {{ID}}</p></div></li></ul><p>## Done</p><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>{{Task}} — Completed: {{YYYY-MM-DD}} — Notes: {{brief}}</p></div></li></ul><p></p>`,
      });
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0B0F]">
        <div className="h-[72px]" />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-8 py-8">
            {/* Page Title Skeleton */}
            <div className="mb-12">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2 tracking-wider">
                <span>WORKSPACE</span>
              </div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-[#2A2A2E] rounded animate-pulse mb-2" />
            </div>

            {/* Tabs Skeleton */}
            <div className="flex items-center gap-8 mb-10">
              <div className="pb-3 relative">
                <div className="h-4 w-12 bg-gray-200 dark:bg-[#2A2A2E] rounded animate-pulse" />
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-[#2A2A2E] rounded-full" />
              </div>
            </div>

            {/* Quick Actions Skeleton */}
            <section className="mb-12">
              <SectionHeader icon={Target} title="Quick Start" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ActionCard.Skeleton key={index} variant="library" />
                ))}
              </div>
            </section>

            {/* Recent Pages Section Skeleton */}
            <section>
              <SectionHeader
                icon={Clock}
                title="Recent Pages"
                actionButton={
                  <div className="h-9 w-24 bg-gray-200 dark:bg-[#2A2A2E] rounded-lg animate-pulse" />
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <DocumentCard.Skeleton key={index} showPreview={true} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0B0F]">
      <div className="h-[72px]" />

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
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No documents found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create your first document to get started
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMoreDocuments}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More Documents"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
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
