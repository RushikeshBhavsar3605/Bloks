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
  Toolbar,
  ToolbarSection,
  Spacer,
} from "@/components/ui/tiptap/toolbar";
import { MarkButton } from "@/components/ui/tiptap/mark-button";
import { HeadingDropdown } from "@/components/ui/tiptap/heading-dropdown";
import { ListDropdown } from "@/components/ui/tiptap/list-dropdown";
import { TextAlignButton } from "@/components/ui/tiptap/text-align-button";
import { UndoRedoButton } from "@/components/ui/tiptap/undo-redo-button";
import { ImageUploadButton } from "@/components/ui/tiptap/image-upload-button";
import { HighlightPopover } from "@/components/ui/tiptap/highlight-popover";
import { LinkPopover } from "@/components/ui/tiptap/link-popover";
import { NodeButton } from "@/components/ui/tiptap/node-button";
import {
  CustomCodeBlock,
  SelectionExtension,
  TrailingNodeExtension,
} from "@/extensions/tiptap-extensions";
import { CollaborationExtension } from "@/extensions/collaboration-extension";
import { useSocket } from "@/components/providers/socket-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/tiptap-utils";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Quote,
  Sun,
  Moon,
  CodeXml,
  SquareTerminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  documentId?: string;
}

export function SimpleEditor({
  content = "",
  onChange,
  placeholder = "Start writing...",
  className,
  editable = true,
  documentId,
}: SimpleEditorProps) {
  const [darkMode, setDarkMode] = React.useState(false);
  const isMobile = useMobile();
  const { socket } = useSocket();
  const user = useCurrentUser();
  
  const editor = useEditor({
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
      ...(socket && documentId && user?.id ? [
        CollaborationExtension.configure({
          socket,
          documentId,
          userId: user.id,
        })
      ] : []),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "mx-auto focus:outline-none min-h-[200px] p-4",
          darkMode && "prose-invert"
        ),
      },
    },
  }, [socket && documentId && user?.id]); // Only recreate when collaboration becomes available

  // Setup collaboration when all dependencies are ready
  React.useEffect(() => {
    if (editor && socket && documentId && user?.id) {
      console.log(`[${user.id}] All collaboration dependencies ready for document: ${documentId}`);
    }
  }, [editor, socket, documentId, user?.id]);

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "w-full px-[54px] mx-auto rounded-lg bg-background",
          darkMode && "dark",
          className
        )}
      >
        {/* Toolbar */}
        <Toolbar>
          <ToolbarSection>
            <UndoRedoButton editor={editor} />
          </ToolbarSection>

          <Spacer />

          <ToolbarSection>
            <HeadingDropdown editor={editor} />
          </ToolbarSection>

          <Spacer />

          <ToolbarSection>
            <MarkButton
              editor={editor}
              mark="bold"
              tooltip="Bold"
              shortcut="⌘B"
            >
              <Bold className="h-4 w-4" />
            </MarkButton>

            <MarkButton
              editor={editor}
              mark="italic"
              tooltip="Italic"
              shortcut="⌘I"
            >
              <Italic className="h-4 w-4" />
            </MarkButton>

            <MarkButton
              editor={editor}
              mark="underline"
              tooltip="Underline"
              shortcut="⌘U"
            >
              <UnderlineIcon className="h-4 w-4" />
            </MarkButton>

            <MarkButton
              editor={editor}
              mark="strike"
              tooltip="Strikethrough"
              shortcut="⌘⇧S"
            >
              <Strikethrough className="h-4 w-4" />
            </MarkButton>

            <MarkButton
              editor={editor}
              mark="code"
              tooltip="Code"
              shortcut="⌘E"
            >
              <CodeXml className="h-4 w-4" />
            </MarkButton>

            <NodeButton
              editor={editor}
              node="codeBlock"
              tooltip="Code Block"
              shortcut="⌘⇧E"
              command={() => {
                const { state } = editor;
                const { from, to } = state.selection;

                if (editor.isActive("codeBlock")) {
                  editor.chain().focus().toggleCodeBlock().run();
                  return;
                }

                const text = state.doc.textBetween(from, to, "\n");

                editor
                  .chain()
                  .focus()
                  .deleteRange({ from, to })
                  .insertContentAt(from, {
                    type: "codeBlock",
                    content: [{ type: "text", text }],
                  })
                  .run();
              }}
            >
              <SquareTerminal className="h-4 w-4" />
            </NodeButton>
          </ToolbarSection>

          <Spacer />

          <ToolbarSection>
            <HighlightPopover editor={editor} />
            <LinkPopover editor={editor} />
          </ToolbarSection>

          <Spacer />

          <ToolbarSection>
            <ListDropdown editor={editor} />
            <TextAlignButton editor={editor} />
          </ToolbarSection>

          <Spacer />

          <ToolbarSection>
            <NodeButton
              editor={editor}
              node="blockquote"
              tooltip="Quote"
              shortcut="⌘⇧B"
              command={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </NodeButton>

            <ImageUploadButton editor={editor} />
          </ToolbarSection>

          {!isMobile && (
            <>
              <div className="flex-1" />
              <ToolbarSection>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </ToolbarSection>
            </>
          )}
        </Toolbar>

        {/* Editor Content */}
        <div className="relative">
          <EditorContent
            editor={editor}
            className={cn("min-h-[400px]", !editable && "cursor-default")}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
