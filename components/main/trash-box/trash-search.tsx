import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TrashSearchProps {
  search: string;
  setSearch: (value: string) => void;
}

export const TrashSearch = ({ search, setSearch }: TrashSearchProps) => {
  return (
    <div className="flex items-center gap-x-1 p-2">
      <Search className="h-4 w-4" />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
        placeholder="Filter by page title..."
      />
    </div>
  );
};
