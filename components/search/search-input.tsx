"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Command } from "lucide-react";
import { SearchModal } from "./search-modal";

interface SearchInputProps {
  placeholder?: string;
  onNavigate?: (page: string, id?: string) => void;
  onDocumentSelect?: (docId: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  onNavigate,
  onDocumentSelect,
  className = "",
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isModalOpen = searchParams?.get("modal") === "search";

  const openModal = () => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams);
    params.set("modal", "search");
    router.push(`?${params.toString()}`);
  };

  const closeModal = () => {
    router.back();
  };

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchParams]);

  return (
    <>
      <button
        onClick={openModal}
        className={`flex items-center gap-3 w-full max-w-md px-4 py-2 bg-transparent border border-[#1E1E20] rounded-lg text-gray-500 hover:text-gray-300 transition-colors ${className}`}
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left text-sm">{placeholder}</span>
        <div className="flex items-center gap-1 text-xs">
          <kbd className="px-1.5 py-0.5 bg-[#2A2A2E] text-gray-400 rounded border border-[#323236]">
            <Command className="w-3 h-3 inline mr-0.5" />K
          </kbd>
        </div>
      </button>

      <SearchModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onNavigate={onNavigate}
        onDocumentSelect={onDocumentSelect}
      />
    </>
  );
}
