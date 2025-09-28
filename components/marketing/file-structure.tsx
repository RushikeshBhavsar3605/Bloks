import { Check, FileText, Minus, Plus } from "lucide-react";
import { useState } from "react";

export const FileStructure = () => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["root", "project-alpha", "meeting-notes"])
  );

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // File/file structure for visualization - each file can contain other files
  const fileStructure = [
    {
      id: "root",
      name: "Getting Started",
      type: "file",
      hasContent: true,
      children: [
        {
          id: "project-alpha",
          name: "Project Alpha",
          type: "file",
          hasContent: true,
          children: [
            {
              id: "requirements",
              name: "Requirements",
              type: "file",
              hasContent: true,
              children: [
                {
                  id: "user-stories",
                  name: "User Stories",
                  type: "file",
                  hasContent: true,
                },
                {
                  id: "acceptance-criteria",
                  name: "Acceptance Criteria",
                  type: "file",
                  hasContent: true,
                },
              ],
            },
            {
              id: "design-specs",
              name: "Design Specifications",
              type: "file",
              hasContent: true,
              children: [
                {
                  id: "wireframes",
                  name: "Wireframes",
                  type: "file",
                  hasContent: true,
                },
                {
                  id: "mockups",
                  name: "High-Fidelity Mockups",
                  type: "file",
                  hasContent: true,
                },
              ],
            },
            {
              id: "meeting-notes",
              name: "Meeting Notes",
              type: "file",
              hasContent: true,
              children: [
                {
                  id: "kickoff",
                  name: "Kickoff Meeting",
                  type: "file",
                  hasContent: true,
                  children: [
                    {
                      id: "agenda",
                      name: "Agenda",
                      type: "file",
                      hasContent: true,
                    },
                    {
                      id: "action-items",
                      name: "Action Items",
                      type: "file",
                      hasContent: true,
                    },
                  ],
                },
                {
                  id: "weekly-sync",
                  name: "Weekly Sync",
                  type: "file",
                  hasContent: true,
                },
              ],
            },
          ],
        },
        {
          id: "personal-notes",
          name: "Personal Notes",
          type: "file",
          hasContent: true,
          children: [
            {
              id: "daily-journal",
              name: "Daily Journal",
              type: "file",
              hasContent: true,
            },
            {
              id: "learning",
              name: "Learning Resources",
              type: "file",
              hasContent: true,
              children: [
                {
                  id: "react-notes",
                  name: "React Notes",
                  type: "file",
                  hasContent: true,
                },
                {
                  id: "design-patterns",
                  name: "Design Patterns",
                  type: "file",
                  hasContent: true,
                },
              ],
            },
          ],
        },
        {
          id: "team-handbook",
          name: "Team Handbook",
          type: "file",
          hasContent: true,
          children: [
            {
              id: "onboarding",
              name: "Onboarding Guide",
              type: "file",
              hasContent: true,
            },
            {
              id: "processes",
              name: "Team Processes",
              type: "file",
              hasContent: true,
            },
          ],
        },
      ],
    },
  ];

  const renderFileNode = (node: any, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const indent = level * 20;

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded cursor-pointer group"
          style={{ paddingLeft: `${8 + indent}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <Minus className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
            ) : (
              <Plus className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
            )
          ) : (
            <div className="w-3 h-3" />
          )}

          <div className="w-4 h-4 bg-primary/20 rounded flex items-center justify-center">
            <FileText className="w-2.5 h-2.5 text-primary" />
          </div>

          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {node.name}
          </span>

          {node.hasContent && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <div
                className="w-1.5 h-1.5 bg-green-500 rounded-full"
                title="Has content"
              />
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child: any) =>
              renderFileNode(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="py-20 lg:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Organize with infinite
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}
                nested structure
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Revolutionary file-in-file structure. Each document can contain
              other documents, creating infinite hierarchies. No more rigid
              folder structures - organize your thoughts the way your mind
              works.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-foreground">
                  Infinite nesting - files within files
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-foreground">
                  Each file has its own content and sub-files
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-foreground">
                  Drag & drop to reorganize instantly
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-foreground">
                  Smart breadcrumb navigation
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                File Structure
              </span>
              <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span>Has content</span>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {fileStructure.map((node) => renderFileNode(node))}
            </div>
            <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
              Click files to expand/collapse • Every file can contain other
              files
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
