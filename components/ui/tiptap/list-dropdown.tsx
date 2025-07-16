import * as React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, List, ListOrdered, CheckSquare } from "lucide-react";
import { cn } from "@/lib/tiptap-utils";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

interface ListDropdownProps {
  editor: Editor;
  className?: string;
}

const listItems = [
  {
    label: "Bullet List",
    icon: List,
    command: (editor: Editor) =>
      editor.chain().focus().toggleBulletList().run(),
    isActive: (editor: Editor) => editor.isActive("bulletList"),
  },
  {
    label: "Ordered List",
    icon: ListOrdered,
    command: (editor: Editor) =>
      editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor: Editor) => editor.isActive("orderedList"),
  },
  {
    label: "Task List",
    icon: CheckSquare,
    command: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
    isActive: (editor: Editor) => editor.isActive("taskList"),
  },
];

export function ListDropdown({ editor, className }: ListDropdownProps) {
  const activeItem = listItems.find((item) => item.isActive(editor));

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
            <List className="h-4 w-4" />
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {listItems.map((item) => (
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
