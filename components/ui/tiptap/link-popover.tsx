import * as React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Link as LinkIcon, Unlink, ExternalLink } from "lucide-react";
import { cn } from "@/lib/tiptap-utils";
import Link from "@tiptap/extension-link";

interface LinkPopoverProps {
  editor: Editor;
  className?: string;
}

export function LinkPopover({ editor, className }: LinkPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const isActive = editor.isActive("link");

  React.useEffect(() => {
    if (open) {
      const currentUrl = editor.getAttributes("link").href || "";
      setUrl(currentUrl);
    }
  }, [open, editor]);

  const setLink = () => {
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    setOpen(false);
  };

  const unsetLink = () => {
    editor.chain().focus().unsetLink().run();
    setOpen(false);
  };

  const openLink = () => {
    const href = editor.getAttributes("link").href;
    if (href) {
      window.open(href, "_blank");
    }
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
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <span>Link</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100">
              ⌘K
            </kbd>
          </div>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setLink();
                }
              }}
            />
          </div>

          <div className="flex justify-between">
            <div className="flex gap-1">
              {isActive && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openLink}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={unsetLink}
                    className="h-8 w-8 p-0"
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={setLink} disabled={!url.trim()}>
                {isActive ? "Update" : "Add"} Link
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
