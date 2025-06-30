"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Blockquote from "@tiptap/extension-blockquote";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import CodeBlock from "@tiptap/extension-code-block";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import History from "@tiptap/extension-history";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type ContentJSON = {
  type?: string;
  content?: ContentJSON[];
  [key: string]: any;
};

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const RichTextExtensions = [
  StarterKit.configure({
    history: false,
    heading: {
      levels: [1, 2, 3],
      HTMLAttributes: {
        class: "font-semibold",
      },
    },
    codeBlock: {
      HTMLAttributes: {
        class: "rounded-md bg-muted p-4 font-mono",
      },
    },
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class: "border-l-4 pl-4 italic text-muted-foreground",
    },
  }),
  Placeholder.configure({
    placeholder: ({ node, editor }) => {
      if (editor.isEmpty) return "Start writing...";
      if (node.type.name === "heading") return `Heading ${node.attrs.level}`;
      return "";
    },
    emptyEditorClass:
      "is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground before:pointer-events-none before:absolute before:left-[16px] before:text-base before:leading-[1.5]",
  }),
  Heading.extend({
    addKeyboardShortcuts() {
      return {
        "Mod-Alt-1": () => this.editor.commands.toggleHeading({ level: 1 }),
        "Mod-Alt-2": () => this.editor.commands.toggleHeading({ level: 2 }),
        "Mod-Alt-3": () => this.editor.commands.toggleHeading({ level: 3 }),
      };
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-primary underline",
      rel: "noopener noreferrer",
    },
  }),
  Underline,
  ListItem,
  BulletList.configure({
    HTMLAttributes: { class: "pl-4 list-disc" },
    keepMarks: true,
  }),
  OrderedList.configure({
    HTMLAttributes: { class: "pl-4 list-decimal" },
    keepMarks: true,
  }),
  CodeBlock,
  Image.configure({
    inline: true,
    allowBase64: true,
    HTMLAttributes: {
      class:
        "rounded-lg max-w-full h-auto border border-border hover:shadow-lg transition-shadow",
    },
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: "border-collapse border-border",
    },
  }),
  TableRow,
  TableCell.configure({
    HTMLAttributes: {
      class: "border border-border p-2",
    },
  }),
  TableHeader.configure({
    HTMLAttributes: {
      class: "bg-muted font-semibold",
    },
  }),
  History.configure({
    depth: 20,
    newGroupDelay: 500,
  }),
];

export const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const editor = useEditor({
    extensions: RichTextExtensions,
    content: initialContent ? JSON.parse(initialContent) : "",
    editorProps: {
      attributes: {
        class: [
          "focus:outline-none relative pl-4",
          "max-w-none",
          "text-base",
          "[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:my-4",
          "[&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:my-3",
          "[&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:my-2",
          "[&_p]:my-2",
          "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:font-mono [&_pre]:transition-colors [&_pre:hover]:bg-muted/80",
          "[&_code]:bg-muted [&_code]:px-2 [&_code]:py-1 [&_code]:rounded-md [&_code]:font-mono [&_code]:border [&_code]:border-border",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-muted/20 [&_blockquote]:py-2 [&_blockquote]:rounded-r",
          "[&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:list-decimal [&_ol]:pl-6",
          "[&_li]:my-1",
          "[&_table]:w-full [&_table]:border-collapse",
          "[&_th]:border-2 [&_th]:border-border [&_th]:bg-muted/30 [&_th]:p-2 [&_td]:border [&_td]:p-2 [&_td:hover]:bg-muted/10",
          "dark:[&]:text-white",
        ].join(" "),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editable: editable !== false,
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(JSON.parse(initialContent));
    }
  }, [editor, initialContent]);

  return (
    <>
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex flex-wrap gap-2 p-2 rounded-lg border-2 shadow-lg bg-popover border-border max-w-[350px]">
            {[
              {
                name: "Bold",
                command: () => editor.chain().focus().toggleBold().run(),
                active: editor.isActive("bold"),
              },
              {
                name: "Italic",
                command: () => editor.chain().focus().toggleItalic().run(),
                active: editor.isActive("italic"),
              },
              {
                name: "Underline",
                command: () => editor.chain().focus().toggleUnderline().run(),
                active: editor.isActive("underline"),
              },
              {
                name: "Strike",
                command: () => editor.chain().focus().toggleStrike().run(),
                active: editor.isActive("strike"),
              },
              {
                name: "H1",
                command: () =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run(),
                active: editor.isActive("heading", { level: 1 }),
              },
              {
                name: "H2",
                command: () =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run(),
                active: editor.isActive("heading", { level: 2 }),
              },
              {
                name: "H3",
                command: () =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run(),
                active: editor.isActive("heading", { level: 3 }),
              },
              {
                name: "Bullet",
                command: () => editor.chain().focus().toggleBulletList().run(),
                active: editor.isActive("bulletList"),
              },
              {
                name: "Ordered",
                command: () => editor.chain().focus().toggleOrderedList().run(),
                active: editor.isActive("orderedList"),
              },
              {
                name: "Code",
                command: () => editor.chain().focus().toggleCodeBlock().run(),
                active: editor.isActive("codeBlock"),
              },
              {
                name: "Undo",
                command: () => editor.chain().focus().undo().run(),
                active: false,
              },
              {
                name: "Redo",
                command: () => editor.chain().focus().redo().run(),
                active: false,
              },
              {
                name: "Quote",
                command: () => editor.chain().focus().toggleBlockquote().run(),
                active: editor.isActive("blockquote"),
              },
              {
                name: "Link",
                command: () => {
                  const url = window.prompt("Enter URL");
                  if (url) {
                    editor.chain().focus().toggleLink({ href: url }).run();
                  }
                },
                active: editor.isActive("link"),
              },
              {
                name: "Table",
                command: () =>
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 2, cols: 3, withHeaderRow: true })
                    .run(),
                active: editor.isActive("table"),
              },
              {
                name: "Image",
                command: () => {
                  const url = window.prompt("Enter image URL");
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                },
                active: editor.isActive("image"),
              },
            ].map(({ name, command, active }) => (
              <button
                key={name}
                onClick={command}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  {
                    "bg-primary text-primary-foreground shadow-inner": active,
                    "hover:bg-accent hover:text-accent-foreground": !active,
                  }
                )}
              >
                {name}
              </button>
            ))}
            {/* <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                "rounded-sm px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-black hover:text-white",
                {
                  "bg-black text-white": editor.isActive("bold"),
                }
              )}
            >
              Bold
            </button>

            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                "rounded-sm px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-black hover:text-white",
                {
                  "bg-black text-white": editor.isActive("italic"),
                }
              )}
            >
              Italic
            </button>

            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn(
                "rounded-sm px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-black hover:text-white",
                {
                  "bg-black text-white": editor.isActive("strike"),
                }
              )}
            >
              Strike
            </button> */}
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  );
};
