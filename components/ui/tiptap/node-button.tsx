import * as React from "react";
import { Editor } from "@tiptap/react";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/tiptap-utils";

interface NodeButtonProps {
  editor: Editor;
  node: string;
  children: React.ReactNode;
  tooltip?: string;
  className?: string;
  shortcut?: string;
  attributes?: Record<string, any>;
  command?: () => void;
}

export function NodeButton({
  editor,
  node,
  children,
  tooltip,
  className,
  shortcut,
  attributes = {},
  command,
}: NodeButtonProps) {
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

  const isActive = editor.isActive(node, attributes);

  const handleClick = () => {
    if (command) command();
    else editor.chain().focus().toggleNode(node, "paragraph", attributes).run();
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
