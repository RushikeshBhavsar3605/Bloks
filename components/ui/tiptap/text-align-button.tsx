import * as React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/tiptap-utils";
import TextAlign from "@tiptap/extension-text-align";

interface TextAlignButtonProps {
  editor: Editor;
  className?: string;
}

const alignItems = [
  {
    label: "Align Left",
    icon: AlignLeft,
    command: (editor: Editor) =>
      editor.chain().focus().setTextAlign("left").run(),
    isActive: (editor: Editor) => editor.isActive({ textAlign: "left" }),
  },
  {
    label: "Align Center",
    icon: AlignCenter,
    command: (editor: Editor) =>
      editor.chain().focus().setTextAlign("center").run(),
    isActive: (editor: Editor) => editor.isActive({ textAlign: "center" }),
  },
  {
    label: "Align Right",
    icon: AlignRight,
    command: (editor: Editor) =>
      editor.chain().focus().setTextAlign("right").run(),
    isActive: (editor: Editor) => editor.isActive({ textAlign: "right" }),
  },
  {
    label: "Justify",
    icon: AlignJustify,
    command: (editor: Editor) =>
      editor.chain().focus().setTextAlign("justify").run(),
    isActive: (editor: Editor) => editor.isActive({ textAlign: "justify" }),
  },
];

export function TextAlignButton({ editor, className }: TextAlignButtonProps) {
  const activeItem =
    alignItems.find((item) => item.isActive(editor)) || alignItems[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 gap-1 px-2", className)}
        >
          <activeItem.icon className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {alignItems.map((item) => (
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
