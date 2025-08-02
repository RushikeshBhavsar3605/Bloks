import { cn } from "@/lib/utils";

interface DocumentEmptyProps {
  level: number;
  expanded: boolean;
}

export const DocumentEmpty = ({ level, expanded }: DocumentEmptyProps) => {
  return (
    <p
      style={{
        paddingLeft: level ? `${level * 12 + 25}px` : undefined,
      }}
      className={cn(
        "text-sm font-medium text-gray-400 dark:text-gray-400 text-gray-500",
        expanded ? "block" : "hidden",
        level === 0 && "hidden"
      )}
    >
      No pages inside
    </p>
  );
};
