"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

import {
  CustomCodeBlock,
  SelectionExtension,
  TrailingNodeExtension,
} from "@/extensions/tiptap-extensions";
import { CollaborationExtension } from "@/extensions/collaboration-extension";
import { LiveCollaborationExtension } from "@/extensions/live-collaboration-extension";
import { useSocket } from "@/components/providers/socket-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/tiptap-utils";

interface SimpleEditorNoToolbarProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  documentId?: string;
  onEditorReady?: (editor: any) => void;
}

export function SimpleEditorNoToolbar({
  content = "",
  onChange,
  placeholder = "Start writing...",
  className,
  editable = true,
  documentId,
  onEditorReady,
}: SimpleEditorNoToolbarProps) {
  const { socket } = useSocket();
  const user = useCurrentUser();

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          bulletList: {
            keepMarks: true,
            keepAttributes: false,
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
          codeBlock: {
            HTMLAttributes: {
              class: "tiptap-code-block",
            },
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: "rounded-lg border max-w-full h-auto",
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-blue-600 hover:text-blue-800 underline cursor-pointer",
          },
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Highlight.configure({
          multicolor: true,
        }),
        Typography,
        Placeholder.configure({
          placeholder,
        }),
        SelectionExtension,
        TrailingNodeExtension,
        CustomCodeBlock,
        Underline,
        // Only include collaboration extension when all dependencies are available
        ...(socket && documentId && user?.id
          ? [
              CollaborationExtension.configure({
                socket,
                documentId,
                userId: user.id,
              }),
              LiveCollaborationExtension.configure({
                socket,
                documentId,
                userId: user.id,
                userName: user.name || "Anonymous",
              }),
            ]
          : []),
      ],
      content,
      editable,
      onUpdate: ({ editor, transaction }) => {
        const html = editor.getHTML();
        onChange?.(html);

        // Only emit for user actions (not collaborative updates)
        // This prevents infinite loops when receiving real-time changes from other users
        const isUserAction = !transaction.getMeta('isReceiving');
        
        if (isUserAction && socket && documentId && user?.id) {
          console.log(`[USER ID FROM FRONTEND CONTENT UPDATE]: ${user.id}`);
          socket.emit("document:update:content", {
            documentId,
            content: html,
            userId: user.id,
          });
        }
      },
      editorProps: {
        attributes: {
          class: cn(
            "mx-auto focus:outline-none min-h-[200px] p-4"
          ),
        },
      },
    },
    [socket && documentId && user?.id]
  ); // Only recreate when collaboration becomes available

  // Setup collaboration when all dependencies are ready
  React.useEffect(() => {
    if (editor && socket && documentId && user?.id) {
      console.log(
        `[${user.id}] All collaboration dependencies ready for document: ${documentId}`
      );
    }
  }, [editor, socket, documentId, user?.id]);

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editor's editable state when the prop changes
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Notify parent when editor is ready
  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-full px-[54px] mx-auto rounded-lg bg-background",
        className
      )}
    >
      {/* Editor Content */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className={cn("min-h-[400px]", !editable && "cursor-default")}
        />
      </div>
    </div>
  );
}