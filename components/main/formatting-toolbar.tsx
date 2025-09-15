"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Code2,
  Link,
  List,
  ImageIcon,
  RotateCcw,
  RotateCw,
  CheckSquare,
  Quote,
  AlertCircle,
  Star,
  Table,
} from "lucide-react";
import { HeadingDropdown } from "@/components/ui/tiptap/heading-dropdown";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { sharedNavbarRef } from "./navigation";
import { getStarred } from "@/actions/documents/get-starred";
import { toggleStar } from "@/actions/documents/toggle-star";

interface FormattingToolbarProps {
  editor: Editor | null;
  editable?: boolean;
  userId: string;
  documentId: string;
}

export const FormattingToolbar = ({
  editor,
  editable = true,
  userId,
  documentId,
}: FormattingToolbarProps) => {
  const [starred, setStarred] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState(false);
  const [, forceUpdate] = useState({});
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStarred = async () => {
      const result = await getStarred({ userId, documentId });
      setStarred(!!result);
    };
    fetchStarred();
  }, [userId, documentId]);

  const toggle = async () => {
    if (isToggling) return; // Prevent multiple simultaneous requests

    setIsToggling(true);
    try {
      const result = await toggleStar({ userId, documentId });
      setStarred(result.starred);
    } catch (error) {
      console.error("Failed to toggle star:", error);
      // Optionally show a toast notification here
    } finally {
      setIsToggling(false);
    }
  };

  // Listen to editor state changes to update active states
  useEffect(() => {
    if (!editor) return;

    const updateActiveStates = () => {
      forceUpdate({});
    };

    // Listen to selection changes and content updates
    editor.on("selectionUpdate", updateActiveStates);
    editor.on("transaction", updateActiveStates);

    return () => {
      editor.off("selectionUpdate", updateActiveStates);
      editor.off("transaction", updateActiveStates);
    };
  }, [editor]);

  useEffect(() => {
    const updatePosition = () => {
      if (toolbarRef.current && sharedNavbarRef.current) {
        const navbarRect = sharedNavbarRef.current.getBoundingClientRect();
        const navbarHeight = navbarRect.height;
        const navbarTop = navbarRect.top;

        toolbarRef.current.style.top = `${navbarTop + navbarHeight}px`;
        toolbarRef.current.style.left = `${navbarRect.left}px`;
        toolbarRef.current.style.width = `${navbarRect.width}px`;
      }
    };

    // Use requestAnimationFrame for smooth updates
    const animationFrame = () => {
      updatePosition();
      requestAnimationFrame(animationFrame);
    };

    const frameId = requestAnimationFrame(animationFrame);

    // Also listen to specific events
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      className="fixed z-40 border-b border-gray-200 dark:border-[#1E1E20] px-8 py-2 bg-background dark:bg-[#0B0B0F]"
    >
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

          {/* Heading Dropdown */}
          <HeadingDropdown
            editor={editor}
            className={cn(
              "hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("heading")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          />

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

          {/* Code Block */}
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("codeBlock")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
            title="Code Block"
          >
            <Code2 className="w-4 h-4" />
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

          {/* Table */}
          <button
            onClick={() => {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            }}
            className={cn(
              "p-2 hover:bg-gray-100 dark:hover:bg-[#1E1E20] rounded transition-colors",
              editor.isActive("table")
                ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1E1E20]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
            title="Insert Table"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            disabled={isToggling}
            className={cn(
              "p-1.5 rounded transition-colors relative",
              isToggling && "cursor-not-allowed opacity-70",
              starred
                ? "text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1E1E20]",
              !isToggling && "hover:scale-105"
            )}
            title={
              isToggling
                ? "Updating..."
                : starred
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <Star
              className={cn(
                "w-4 h-4 transition-all duration-200",
                starred && "fill-current",
                isToggling && "animate-pulse"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
