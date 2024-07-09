"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export const Social = () => {
  return (
    <div className="flex flex-col items-center w-full gap-y-2">
      <Button size="sm" className="w-full" variant="outline" onClick={() => {}}>
        <FcGoogle className="h-4 w-4 mr-2" />
        <p className="text-xs">Continue with Google</p>
      </Button>

      <Button size="sm" className="w-full" variant="outline" onClick={() => {}}>
        <FaGithub className="h-4 w-4 mr-2" />
        <p className="text-xs">Continue with Github</p>
      </Button>
    </div>
  );
};
