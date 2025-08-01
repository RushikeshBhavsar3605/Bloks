"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Library, BookOpen, FileText, Folder } from "lucide-react";
import { useRouter } from "next/navigation";

const LibraryPage = () => {
  const user = useCurrentUser();
  const router = useRouter();

  const goToDocuments = () => {
    router.push("/documents");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center gap-3 mb-8">
        <Library className="h-12 w-12 text-green-500" />
        <h1 className="text-4xl font-bold">My Library</h1>
      </div>

      <h2 className="text-lg font-medium text-center max-w-md">
        Your personal document library
      </h2>

      <p className="text-muted-foreground text-center max-w-md">
        Organize and access all your documents, notes, and files in one place. 
        Create collections and manage your knowledge base efficiently.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-2xl">
        <div className="flex flex-col items-center p-6 border rounded-lg">
          <FileText className="h-8 w-8 text-blue-500 mb-2" />
          <h3 className="font-medium">Documents</h3>
          <p className="text-sm text-muted-foreground text-center">All your text documents</p>
        </div>
        
        <div className="flex flex-col items-center p-6 border rounded-lg">
          <Folder className="h-8 w-8 text-yellow-500 mb-2" />
          <h3 className="font-medium">Collections</h3>
          <p className="text-sm text-muted-foreground text-center">Organized folders</p>
        </div>
        
        <div className="flex flex-col items-center p-6 border rounded-lg">
          <BookOpen className="h-8 w-8 text-purple-500 mb-2" />
          <h3 className="font-medium">Recent</h3>
          <p className="text-sm text-muted-foreground text-center">Recently accessed items</p>
        </div>
      </div>

      <Button onClick={goToDocuments} size="lg" className="mt-8">
        Browse Documents
      </Button>
    </div>
  );
};

export default LibraryPage;