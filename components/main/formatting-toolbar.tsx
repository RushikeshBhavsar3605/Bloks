"use client";

import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Code,
  Link,
  List,
  ImageIcon,
  Table,
  MoreHorizontal,
  RotateCcw,
  RotateCw,
  Hash,
  CheckSquare,
  Quote,
  Eye,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { MarkButton } from "@/components/ui/tiptap/mark-button";
import { HeadingDropdown } from "@/components/ui/tiptap/heading-dropdown";
import { ListDropdown } from "@/components/ui/tiptap/list-dropdown";
import { UndoRedoButton } from "@/components/ui/tiptap/undo-redo-button";
import { ImageUploadButton } from "@/components/ui/tiptap/image-upload-button";
import { HighlightPopover } from "@/components/ui/tiptap/highlight-popover";
import { LinkPopover } from "@/components/ui/tiptap/link-popover";
import { NodeButton } from "@/components/ui/tiptap/node-button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FormattingToolbarProps {
  editor: Editor | null;
  editable?: boolean;
}

export const FormattingToolbar = ({
  editor,
  editable = true,
}: FormattingToolbarProps) => {
  const [isEditing, setIsEditing] = useState(editable);

  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 dark:border-[#1E1E20] px-8 py-3 bg-background dark:bg-[#0B0B0F]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-[#1E1E20] mx-2" />

          {/* Heading */}
          <button
            onClick={() => {
              if (editor.isActive("heading", { level: 1 })) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              }
            }}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("heading")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Hash className="w-4 h-4" />
          </button>

          {/* Bold */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("bold")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("italic")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("underline")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Underline className="w-4 h-4" />
          </button>

          {/* Code */}
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("code")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-200 dark:bg-[#1E1E20] mx-2" />

          {/* Link */}
          <button
            onClick={() => {
              const url = window.prompt("Enter URL:");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("link")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Link className="w-4 h-4" />
          </button>

          {/* Bullet List */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("bulletList")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <List className="w-4 h-4" />
          </button>

          {/* Task List */}
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("taskList")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          {/* Image */}
          <button
            onClick={() => {
              const url = window.prompt("Enter image URL:");
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Quote */}
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("blockquote")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Callout */}
          <button
            onClick={() => editor.chain().focus().toggleCallout().run()}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("callout")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
            title="Callout"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              isEditing
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-gray-300"
            )}
          >
            {isEditing ? "Done" : "Edit"}
          </button>
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
