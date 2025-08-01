"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ChevronDown, ChevronsLeftRight } from "lucide-react";
import { signOut } from "next-auth/react";
import { use } from "react";

const UserItem = () => {
  const user = useCurrentUser();

  const signOutUser = () => {
    signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Header */}
        <div className="px-6 py-5 cursor-pointer hover:bg-[#1E1E20] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
              {user?.image ? (
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.image} />
                  <AvatarFallback className="bg-white text-black text-sm font-bold">
                    {user?.name?.charAt(0) || "J"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <span className="text-black font-bold text-sm">
                  {user?.name?.charAt(0) || "J"}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-medium text-white text-sm">Jotion</h2>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-10">
            {user?.name?.split(" ")[0]}'s Workspace
          </p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80"
        align="start"
        alignOffset={11}
        forceMount
      >
        <div className="flex flex-col space-y-4 p-2">
          <p className="text-xs font-medium leading-none text-muted-foreground">
            {user?.email}
          </p>

          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-secondary p-1">
              <Avatar className="h-8 w-8">
                {user?.image ? (
                  <AvatarImage src={user?.image} />
                ) : (
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
            </div>

            <div className="space-y-1">
              <p className="text-sm line-clamp-1">{user?.name}&apos;s Jotion</p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="w-full cursor-pointer text-muted-foreground"
        >
          <button onClick={signOutUser}>Log out</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserItem;
