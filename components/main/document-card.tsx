"use client";

import { MoreHorizontal, User } from "lucide-react";

interface DocumentCardProps {
  id: string;
  title: string;
  type: string;
  icon: string;
  lastModified?: string;
  preview?: string;
  author?: string;
  timestamp?: string;
  workspace?: string;
  onClick: (id: string) => void;
  showPreview?: boolean;
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
            {preview.substring(0, 150)}...
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#161618] via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            <span className="text-xl">{icon}</span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className={showPreview ? "p-4" : "p-5"}>
        {/* Simple layout for documents page */}
        {!showPreview && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-400 transition-colors line-clamp-1">
                {title}
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
              {title}
            </h3>
            {author && timestamp && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <User className="w-3 h-3" />
                <span>{author}</span>
                <span>•</span>
                <span>{timestamp}</span>
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
        {!showPreview && lastModified && (
          <div className="text-xs text-gray-500">Modified {lastModified}</div>
        )}
      </div>
    </div>
  );
};