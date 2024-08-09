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
import { ChevronsLeftRight } from "lucide-react";
import { signOut } from "next-auth/react";

const UserItem = () => {
  const user = useCurrentUser();

  const signOutUser = () => {
    signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          className="flex items-center text-sm p-3 w-full hover:bg-primary/5"
        >
          <div className="gap-x-2 flex items-center max-w-[150px]">
            <Avatar className="h-5 w-5">
              {user?.image ? (
                <AvatarImage src={user?.image} />
              ) : (
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              )}
            </Avatar>

            <span className="text-start font-medium line-clamp-1">
              {user?.name}&apos;s Jotion
            </span>
          </div>

          <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4" />
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
