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
        "hidden text-sm font-medium text-muted-foreground/80",
        expanded && "last:block",
        level === 0 && "hidden"
      )}
    >
      No pages inside
    </p>
  );
};
