"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { PlusCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

const DocumentsPage = () => {
  const user = useCurrentUser();

  const onClick = () => {
    signOut();
  };

  const onCreate = () => {
    console.log("Page created!");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        height="300"
        width="300"
        alt="Empty"
        className="dark:hidden"
      />

      <Image
        src="/empty-dark.png"
        height="300"
        width="300"
        alt="Empty"
        className="hidden dark:block"
      />

      <h2 className="text-lg font-medium">
        Welcome to {user?.name?.split(" ")[0]}
        &apos;s Jotion
      </h2>

      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a note
      </Button>
    </div>
  );
};

export default DocumentsPage;
