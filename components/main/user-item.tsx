"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { signOut } from "next-auth/react";

const getAvatarInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getAvatarColor = (id: string) => {
  const colors = [
    "bg-blue-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-red-600",
    "bg-yellow-600",
    "bg-indigo-600",
    "bg-pink-600",
    "bg-gray-600",
  ];
  const index =
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

const UserItem = () => {
  const user = useCurrentUser();

  const signOutUser = () => {
    signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Header */}
        <div className="px-4 py-2 cursor-pointer border-b-1">
          <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-[#1E1E20]">
            <div className="w-8 h-8 rounded-md flex items-center justify-center">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-7 h-7 rounded-lg object-cover"
                />
              ) : (
                <div
                  className={`w-8 h-8 ${getAvatarColor(
                    user?.id as string
                  )} rounded-lg flex items-center justify-center text-sm font-semibold text-white`}
                >
                  {getAvatarInitials(user?.name || "User")}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {user?.name?.split(" ")[0]}&apos;s Workspace
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Personal
              </div>
            </div>
          </div>
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
              <p className="text-sm line-clamp-1">{user?.name}&apos;s Bloks</p>
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
