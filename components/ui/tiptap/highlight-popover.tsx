import * as React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Highlighter } from "lucide-react";
import { cn } from "@/lib/tiptap-utils";
import Highlight from "@tiptap/extension-highlight";

interface HighlightPopoverProps {
  editor: Editor;
  className?: string;
}

const highlightColors = [
  { name: "Yellow", color: "#fef08a", value: "#fef08a" },
  { name: "Green", color: "#bbf7d0", value: "#bbf7d0" },
  { name: "Blue", color: "#bfdbfe", value: "#bfdbfe" },
  { name: "Purple", color: "#e9d5ff", value: "#e9d5ff" },
  { name: "Pink", color: "#fbcfe8", value: "#fbcfe8" },
  { name: "Red", color: "#fecaca", value: "#fecaca" },
  { name: "Orange", color: "#fed7aa", value: "#fed7aa" },
];

export function HighlightPopover({ editor, className }: HighlightPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const isActive = editor.isActive("highlight");

  const setHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
    setOpen(false);
  };

  const unsetHighlight = () => {
    editor.chain().focus().unsetHighlight().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", isActive && "bg-accent", className)}
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span>Highlight</span>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-48 p-2" align="start">
        <div className="grid grid-cols-4 gap-1">
          {highlightColors.map((color) => (
            <button
              key={color.name}
              className="w-8 h-8 rounded border hover:scale-110 transition-transform"
              style={{ backgroundColor: color.color }}
              onClick={() => setHighlight(color.value)}
              title={color.name}
            />
          ))}
        </div>
        <div className="mt-2 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={unsetHighlight}
          >
            Remove highlight
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
