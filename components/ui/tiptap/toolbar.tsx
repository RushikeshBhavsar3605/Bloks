import * as React from "react";
import { cn } from "@/lib/tiptap-utils";

const Toolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-1 p-2 border-b border-border bg-background",
      className
    )}
    {...props}
  />
));
Toolbar.displayName = "Toolbar";

const ToolbarSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-1", className)}
    {...props}
  />
));
ToolbarSection.displayName = "ToolbarSection";

const Spacer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-px h-6 bg-border mx-1", className)}
    {...props}
  />
));
Spacer.displayName = "Spacer";

export { Toolbar, ToolbarSection, Spacer };
