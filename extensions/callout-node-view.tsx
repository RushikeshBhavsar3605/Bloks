import React from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { cn } from "@/lib/utils";

interface CalloutNodeViewProps {
  node: any;
  updateAttributes: (attributes: Record<string, any>) => void;
  selected: boolean;
}

export const CalloutNodeView: React.FC<CalloutNodeViewProps> = () => {
  return (
    <NodeViewWrapper className="mb-4">
      <div className="rounded-lg bg-muted dark:bg-[#1A1A1C] p-4 transition-all duration-200">
        <div className="leading-relaxed min-h-[1.5rem] dark:text-muted-foreground callout-content">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  );
};
