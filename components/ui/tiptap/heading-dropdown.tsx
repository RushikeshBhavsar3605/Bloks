import * as React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Heading1, Heading2, Heading3, Type } from "lucide-react";
import { cn } from "@/lib/tiptap-utils";

interface HeadingDropdownProps {
  editor: Editor;
  className?: string;
}

const headingItems = [
  {
    label: "Paragraph",
    icon: Type,
    command: (editor: Editor) => editor.chain().focus().setParagraph().run(),
    isActive: (editor: Editor) => editor.isActive("paragraph"),
  },
  {
    label: "Heading 1",
    icon: Heading1,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    label: "Heading 2",
    icon: Heading2,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    label: "Heading 3",
    icon: Heading3,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 3 }),
  },
];

export function HeadingDropdown({ editor, className }: HeadingDropdownProps) {
  const activeItem = headingItems.find((item) => item.isActive(editor));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 gap-1 px-2", className)}
        >
          {activeItem ? (
            <activeItem.icon className="h-4 w-4" />
          ) : (
            <Type className="h-4 w-4" />
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {headingItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={() => item.command(editor)}
            className={cn(
              "flex items-center gap-2",
              item.isActive(editor) && "bg-accent"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
