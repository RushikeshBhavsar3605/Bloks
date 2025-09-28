"use client";

import { MoreHorizontal, User, Star } from "lucide-react";
import TurndownService from "turndown";
import { Skeleton } from "../ui/skeleton";
import React from "react";

// Initialize turndown service
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

function htmlToMarkdown(html: string): string {
  if (!html) return "";
  return turndownService.turndown(html);
}

function getRelativeTimeMessage(lastEditedAt: Date): string {
  const currDate = new Date();
  const diffMs = currDate.getTime() - lastEditedAt.getTime();

  const diffHr = Math.floor(diffMs / 1000 / 60 / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeeks = Math.floor(diffDay / 7);
  const diffYears = Math.floor(diffDay / 365);

  if (diffHr < 1) return "Few minutes ago";
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffWeeks < 52) return `${diffWeeks} weeks ago`;

  return `${diffYears} years ago`;
}

// Function to highlight matching text
function highlightText(text: string, query: string): JSX.Element {
  if (!query.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-white rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

// Function to get relevant content snippet with highlighting
function getRelevantContentSnippet(
  content: string,
  query: string,
  maxLength: number = 150
): string {
  if (!content || !query.trim()) {
    return content.substring(0, maxLength);
  }

  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerContent.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return content.substring(0, maxLength);
  }

  // Calculate start position to center the match
  const startOffset = Math.max(
    0,
    matchIndex - Math.floor((maxLength - query.length) / 2)
  );
  const endOffset = Math.min(content.length, startOffset + maxLength);

  let snippet = content.substring(startOffset, endOffset);

  // Add ellipsis if we're not at the beginning/end
  if (startOffset > 0) snippet = "..." + snippet;
  if (endOffset < content.length) snippet = snippet + "...";

  return snippet;
}

interface DocumentCardProps {
  id: string;
  title: string;
  type: string;
  icon: string | null;
  lastModified?: Date;
  preview?: string;
  author?: string;
  timestamp?: Date;
  workspace?: string;
  onClick: (id: string) => void;
  showPreview?: boolean;
  searchQuery?: string; // Optional search query for highlighting
  showStarIcon?: boolean; // Optional star icon for starred documents
  onStarClick?: (id: string, event: React.MouseEvent) => void; // Optional star click handler
}

export const DocumentCard = ({
  id,
  title,
  type,
  icon,
  lastModified,
  preview,
  author,
  timestamp,
  workspace,
  onClick,
  showPreview = false,
  searchQuery = "", // Default to empty string for backward compatibility
  showStarIcon = false, // Default to false for backward compatibility
  onStarClick, // Optional star click handler
}: DocumentCardProps) => {
  return (
    <div
      onClick={() => onClick(id)}
      className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl overflow-hidden hover:bg-gray-100 dark:hover:bg-[#1A1A1C] transition-colors cursor-pointer group"
    >
      {/* Preview Section (only for library-style cards) */}
      {showPreview && preview && (
        <div className="aspect-video bg-gray-100 dark:bg-[#0F0F11] relative overflow-hidden p-4">
          <div className="text-xs font-mono text-gray-600 dark:text-gray-300 leading-relaxed">
            {searchQuery
              ? highlightText(
                  getRelevantContentSnippet(
                    htmlToMarkdown(preview),
                    searchQuery,
                    150
                  ),
                  searchQuery
                )
              : htmlToMarkdown(preview).substring(0, 150) + " ..."}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#161618] via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            <span className="text-xl">{icon || "📄"}</span>
          </div>
          {/* Star Icon */}
          {showStarIcon && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStarClick?.(id, e);
              }}
              className="absolute top-3 left-3 p-1 hover:bg-gray-200 dark:hover:bg-[#2A2A2E] rounded transition-colors"
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </button>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className={showPreview ? "p-4" : "p-5"}>
        {/* Simple layout for documents page */}
        {!showPreview && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{icon || "📄"}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-400 transition-colors line-clamp-1">
                {searchQuery ? highlightText(title, searchQuery) : title}
              </h3>
              <p className="text-xs text-gray-500">{type}</p>
            </div>
          </div>
        )}

        {/* Complex layout for library page */}
        {showPreview && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-[#2A2A2E] text-gray-700 dark:text-gray-300 rounded">
                {type}
              </span>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-3 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
              {searchQuery ? highlightText(title, searchQuery) : title}
            </h3>
            {author && timestamp && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <User className="w-3 h-3" />
                <span>{author}</span>
                <span>•</span>
                <span>{getRelativeTimeMessage(timestamp)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">{workspace}</div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#2A2A2E] rounded">
                <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </>
        )}

        {/* Last modified for simple layout */}
        {lastModified && (
          <div className="text-xs text-gray-500">
            Modified {getRelativeTimeMessage(lastModified)}
          </div>
        )}
      </div>
    </div>
  );
};

DocumentCard.Skeleton = function DocumentCardSkeleton({
  showPreview = false,
}: {
  showPreview?: boolean;
}) {
  return (
    <div className="bg-gray-50 dark:bg-[#161618] border border-gray-200 dark:border-[#1E1E20] rounded-xl overflow-hidden">
      {/* Preview Section Skeleton (only for library-style cards) */}
      {showPreview && (
        <div className="aspect-video bg-gray-100 dark:bg-[#0F0F11] relative overflow-hidden p-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/4" />
          </div>
          <div className="absolute top-3 right-3">
            <Skeleton className="w-6 h-6 rounded" />
          </div>
        </div>
      )}

      {/* Card Content Skeleton */}
      <div className={showPreview ? "p-4" : "p-5"}>
        {/* Simple layout skeleton for documents page */}
        {!showPreview && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-8 h-8 rounded" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-3 w-24" />
          </>
        )}

        {/* Complex layout skeleton for library page */}
        {showPreview && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            <Skeleton className="h-4 w-40 mb-3" />
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-1" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="w-6 h-6 rounded" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
