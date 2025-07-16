import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { cn } from "@/lib/tiptap-utils";

// Image Node Component
export function ImageNode({ node, updateAttributes, selected }: any) {
  return (
    <NodeViewWrapper
      className={cn("image-node", selected && "ProseMirror-selectednode")}
    >
      <img
        src={node.attrs.src}
        alt={node.attrs.alt || ""}
        className="max-w-full h-auto rounded-lg border"
        style={{
          width: node.attrs.width || "auto",
          height: node.attrs.height || "auto",
        }}
      />
    </NodeViewWrapper>
  );
}

// Code Block Node Component
export function CodeBlockNode({ node, updateAttributes, extension }: any) {
  return (
    <NodeViewWrapper className="code-block-node">
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
        <NodeViewContent as="code" className="block font-mono text-sm" />
      </pre>
    </NodeViewWrapper>
  );
}

// List Node Component
export function ListNode({ node }: any) {
  const Tag = node.type.name === "bulletList" ? "ul" : "ol";

  return (
    <NodeViewWrapper
      as={Tag}
      className={cn(
        "list-node",
        node.type.name === "bulletList" && "list-disc list-inside",
        node.type.name === "orderedList" && "list-decimal list-inside",
        node.type.name === "taskList" && "task-list"
      )}
    >
      <NodeViewContent />
    </NodeViewWrapper>
  );
}

// Paragraph Node Component
export function ParagraphNode() {
  return (
    <NodeViewWrapper as="p" className="paragraph-node">
      <NodeViewContent />
    </NodeViewWrapper>
  );
}
