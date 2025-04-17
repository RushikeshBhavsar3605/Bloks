"use client";

import { Document } from "@prisma/client";
import { useCallback, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import debounce from "lodash.debounce";
import { useSocket } from "../providers/socket-provider";
import { useSaveStatus } from "@/hooks/use-save-status";

interface TitleProps {
  initialData: Document;
}

export const Title = ({ initialData }: TitleProps) => {
  const { socket } = useSocket();
  const { setSaving, setSaved } = useSaveStatus();
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData.title || "Untitled");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const enableInput = () => {
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

  const saveToDB = useCallback(
    debounce(async (title: string) => {
      await fetch("/api/socket/documents/update-document", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: initialData.id,
          title: title || "Untitled",
        }),
      });

      setSaved();
    }, 2000),
    [initialData.id]
  );

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSaving();
    setTitle(event.target.value);

    socket.emit("document:update:title", {
      id: initialData.id,
      title: event.target.value,
    });
    saveToDB(event.target.value);
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
