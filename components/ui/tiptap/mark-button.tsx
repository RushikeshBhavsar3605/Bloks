import * as React from "react";
import { Editor } from "@tiptap/react";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/tiptap-utils";

interface MarkButtonProps {
  editor: Editor;
  mark: string;
  children: React.ReactNode;
  tooltip?: string;
  className?: string;
  shortcut?: string;
}

export function MarkButton({
  editor,
  mark,
  children,
  tooltip,
  className,
  shortcut,
}: MarkButtonProps) {
  const [, forceUpdate] = React.useState({});
  
  // Listen to editor state changes to update active state
  React.useEffect(() => {
    if (!editor) return;

    const updateActiveState = () => {
      forceUpdate({});
    };

    editor.on('selectionUpdate', updateActiveState);
    editor.on('transaction', updateActiveState);

    return () => {
      editor.off('selectionUpdate', updateActiveState);
      editor.off('transaction', updateActiveState);
    };
  }, [editor]);

  const isActive = editor.isActive(mark);

  const handleClick = () => {
    editor.chain().focus().toggleMark(mark).run();
  };

  const button = (
    <Toggle
      pressed={isActive}
      onPressedChange={handleClick}
      className={cn("h-8 w-8 p-0", isActive && "bg-muted", className)}
      size="sm"
    >
      {children}
    </Toggle>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <span>{tooltip}</span>
            {shortcut && (
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100">
                {shortcut}
              </kbd>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
