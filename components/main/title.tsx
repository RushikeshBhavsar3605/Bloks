"use client";

import { CollaboratorRole } from "@prisma/client";
import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useSocket } from "../providers/socket-provider";
import { DocumentWithMeta } from "@/types/shared";
import { Skeleton } from "../ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";

interface TitleProps {
  initialData: DocumentWithMeta;
}

export const Title = ({ initialData }: TitleProps) => {
  const { socket } = useSocket();
  const user = useCurrentUser();
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData.title || "Untitled");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const enableInput = () => {
    if (!initialData.isOwner && initialData.role !== CollaboratorRole.EDITOR) {
      return;
    }

    setTitle(initialData.title);
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
    initialData.title = title;
  };

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!socket || !user?.id) return;

    setTitle(event.target.value);

    socket.emit("document:update:title", {
      documentId: initialData.id,
      title: event.target.value,
      userId: user.id,
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      disableInput();
    }
  };

  return (
    <div className="flex items-center gap-x-1">
      {!!initialData.icon && <p>{initialData.icon}</p>}
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
          className="h-7 px-2 focus-visible:ring-transparent"
        />
      ) : (
        <Button
          onClick={enableInput}
          variant="ghost"
          size="sm"
          className="font-normal h-auto p-1"
        >
          <span className="truncate">{initialData.title}</span>
        </Button>
      )}
    </div>
  );
};

Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-7 w-52 rounded-md" />;
};
