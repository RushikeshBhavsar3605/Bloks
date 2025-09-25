"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Document } from "@prisma/client";
import { getUserSubscription } from "../users/get-user-subscription";
import TurndownService from "turndown";

type DocumentWithOwner = Document & {
  owner: {
    name: string | null;
  };
};

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

function htmlToMarkdown(html: string): string {
  if (!html) return "";
  return turndownService.turndown(html);
}

const generateHTMLExport = (document: DocumentWithOwner) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${document.title || "Document"}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .document-header {
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .document-title {
            font-size: 32px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 12px;
          }
          
          .document-meta {
            color: #6b7280;
            font-size: 14px;
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
          }
          
          .document-content {
            max-width: 100%;
            font-size: 16px;
          }
          
          h1, h2, h3, h4, h5, h6 {
            color: #111827;
            margin: 28px 0 16px 0;
            font-weight: 600;
            line-height: 1.3;
          }
          
          h1 { font-size: 28px; }
          h2 { font-size: 24px; }
          h3 { font-size: 20px; }
          h4 { font-size: 18px; }
          h5 { font-size: 16px; }
          h6 { font-size: 14px; }
          
          p {
            margin: 16px 0;
            line-height: 1.7;
          }
          
          strong, b {
            font-weight: 600;
            color: #111827;
          }
          
          em, i {
            font-style: italic;
          }
          
          .callout-container {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .callout-container h1,
          .callout-container h2,
          .callout-container h3,
          .callout-container h4,
          .callout-container h5,
          .callout-container h6 {
            color: #1e40af;
            margin-top: 0;
            margin-bottom: 12px;
          }
          
          .callout-container p {
            margin: 12px 0;
            color: #374151;
          }
          
          ul, ol {
            margin: 16px 0;
            padding-left: 28px;
          }
          
          li {
            margin: 6px 0;
            line-height: 1.6;
          }
          
          blockquote {
            border-left: 4px solid #d1d5db;
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            color: #6b7280;
          }
          
          code {
            background: #f3f4f6;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            color: #dc2626;
          }
          
          pre {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            line-height: 1.5;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
          }
          
          th, td {
            border: 1px solid #e5e7eb;
            padding: 12px 16px;
            text-align: left;
          }
          
          th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
          }
          
          /* Reset default list indent only for task lists */
          ul[data-type="taskList"] { list-style: none; padding-left: 0; margin: 0; width: 100%; }

          /* Each task item as a row */
          ul[data-type="taskList"] li[data-type="taskItem"] {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            width: 100%;
            margin: 8px 0;
          }

          /* Label holds the checkbox in Tiptap */
          ul[data-type="taskList"] li[data-type="taskItem"] > label {
            flex: 0 0 16px;              /* fixed checkbox column */
            display: inline-flex;
            align-items: flex-start;
          }

          /* Actual checkbox */
          ul[data-type="taskList"] li[data-type="taskItem"] > label > input[type="checkbox"] {
            width: 16px; height: 16px;
            margin-top: 2px;
            accent-color: #3b82f6;
            cursor: pointer;
          }

          /* Task text */
          ul[data-type="taskList"] li[data-type="taskItem"] > .content {
            flex: 1 1 auto;
            min-width: 0;                /* allow proper wrapping inside flex */
            line-height: 1.6;
            overflow-wrap: break-word;
          }

          /* Checked styling via data-checked (Tiptap) */
          ul[data-type="taskList"] li[data-checked="true"] > .content {
            text-decoration: line-through;
            color: #6b7280;
          }

          /* Optional: tighter spacing inside task content paragraphs */
          ul[data-type="taskList"] li[data-type="taskItem"] > .content p { margin: 0; }

          /* Keep the row inline */
          ul[data-type="taskList"] li[data-type="taskItem"] {
            display: flex;
            align-items: center; /* or baseline for text-first alignment */
            gap: 8px;
          }

          /* Label holds the checkbox in Tiptap */
          ul[data-type="taskList"] li[data-type="taskItem"] > label {
            flex: 0 0 16px;
            display: inline-flex;
            align-items: center;
            margin: 0; /* avoid extra vertical offset */
          }

          /* Checkbox */
          ul[data-type="taskList"] li[data-type="taskItem"] > label > input[type="checkbox"] {
            width: 16px;
            height: 16px;
            margin: 0; /* remove the earlier 2px top nudge */
          }

          /* Task text fills remaining space and can wrap */
          ul[data-type="taskList"] li[data-type="taskItem"] > .content {
            flex: 1 1 auto;
            min-width: 0;
            line-height: 1.6;
          }

          /* Kill the default top margin on the first block so text sits on the same row */
          ul[data-type="taskList"] li[data-type="taskItem"] > .content > :first-child {
            margin-top: 0;
          }

          /* If your global p has margins, neutralize inside tasks */
          ul[data-type="taskList"] li[data-type="taskItem"] > .content p {
            margin-top: 0; /* remove top bump */
          }

          .document-footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
          }
          
          @media print {
            body { padding: 20px; }
            .document-header { page-break-after: avoid; }
            h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
            .callout-container { page-break-inside: avoid; }
          }
          
          @media (max-width: 768px) {
            body { padding: 20px; }
            .document-title { font-size: 24px; }
            .document-meta { flex-direction: column; gap: 8px; }
          }
        </style>
      </head>
      <body>
        <div class="document-header">
          <h1 class="document-title">${
            document.title || "Untitled Document"
          }</h1>
          <div class="document-meta">
            <span><strong>Author:</strong> ${
              document.owner.name || "Unknown"
            }</span>
            <span><strong>Created:</strong> ${document.createdAt.toLocaleDateString()}</span>
            <span><strong>Last Modified:</strong> ${document.updatedAt.toLocaleDateString()}</span>
            <span><strong>Status:</strong> ${
              document.isPublished ? "Published" : "Draft"
            }</span>
          </div>
        </div>
        
        <div class="document-content">
          ${document.content || "<p>No content available.</p>"}
        </div>
        
        <div class="document-footer">
          <p>Exported on ${new Date().toLocaleDateString()} from Your Application</p>
        </div>
      </body>
    </html>
  `;
};

export const downloadDocumentAsMarkdown = async (documentId: string) => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const document = await db.document.findUnique({
      where: {
        id: documentId,
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    const isOwner = document.userId === user.id;
    let hasAccess = isOwner;

    if (!isOwner) {
      const collaborator = await db.collaborator.findUnique({
        where: {
          userId_documentId: {
            userId: user.id as string,
            documentId: documentId,
          },
        },
      });

      hasAccess = collaborator?.isVerified ? true : false;
    }

    if (!hasAccess) {
      throw new Error("You don't have access to this document");
    }

    const userPlan = await getUserSubscription(user.id as string);

    if (userPlan === "free") {
      throw new Error("Markdown download requires Pro plan or above");
    }

    const markdownContent = `# ${document.title || "Untitled Document"}

**Author:** ${document.owner.name || "Unknown"}  
**Created:** ${document.createdAt.toLocaleDateString()}  
**Last Modified:** ${document.updatedAt.toLocaleDateString()}

---

${htmlToMarkdown(document.content as string)}

---

*This document was exported from your application on ${new Date().toLocaleDateString()}*
`;

    return {
      success: true,
      data: {
        content: markdownContent,
        filename: `${document.title || "untitled"}.md`,
        mimeType: "text/markdown",
      },
    };
  } catch (error) {
    console.error("Error downloading document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to download document",
    };
  }
};

export const downloadDocumentAsHTML = async (documentId: string) => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const document = await db.document.findUnique({
      where: {
        id: documentId,
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    const isOwner = document.userId === user.id;
    let hasAccess = isOwner;

    if (!isOwner) {
      const collaborator = await db.collaborator.findUnique({
        where: {
          userId_documentId: {
            userId: user.id as string,
            documentId: documentId,
          },
        },
      });

      hasAccess = collaborator?.isVerified ? true : false;
    }

    if (!hasAccess) {
      throw new Error("You don't have access to this document");
    }

    const userPlan = await getUserSubscription(user.id as string);

    if (userPlan !== "team") {
      throw new Error("HTML download requires Team plan");
    }

    const htmlContent = generateHTMLExport(document);

    return {
      success: true,
      data: {
        content: htmlContent,
        filename: `${document.title || "untitled"}.html`,
        mimeType: "text/html",
      },
    };
  } catch (error) {
    console.error("Error generating HTML:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate HTML",
    };
  }
};
