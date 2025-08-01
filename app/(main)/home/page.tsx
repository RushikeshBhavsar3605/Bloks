"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Home, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const HomePage = () => {
  const user = useCurrentUser();
  const router = useRouter();

  const goToDocuments = () => {
    router.push("/documents");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center gap-3 mb-8">
        <Home className="h-12 w-12 text-blue-500" />
        <h1 className="text-4xl font-bold">Welcome Home</h1>
      </div>

      <h2 className="text-lg font-medium text-center max-w-md">
        Welcome back, {user?.name?.split(" ")[0]}! 
        <br />
        This is your home dashboard.
      </h2>

      <p className="text-muted-foreground text-center max-w-md">
        From here you can access all your documents, manage your workspace, and stay productive.
      </p>

      <div className="flex gap-4 mt-8">
        <Button onClick={goToDocuments} size="lg">
          <PlusCircle className="h-4 w-4 mr-2" />
          Go to Documents
        </Button>
      </div>
    </div>
  );
};

export default HomePage;