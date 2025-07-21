"use client";

import { DocumentWithMeta } from "@/types/shared";
import { IconPicker } from "./icon-picker";
import { Button } from "../ui/button";
import { Smile, X } from "lucide-react";
import { ElementRef, useRef, useState } from "react";
import TextAreaAutosize from "react-textarea-autosize";
import { useSocket } from "../providers/socket-provider";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ToolbarProps {
  initialData: DocumentWithMeta;
  preview?: boolean;
}

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [value, setValue] = useState<string>(initialData.title);
  const { socket } = useSocket();
  const user = useCurrentUser();

  const enableInput = () => {
    if (preview) return;

    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title);

      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = inputRef.current.value.length; // Position cursor at the end
        inputRef.current.selectionEnd = inputRef.current.value.length; // Ensure cursor is at the end
      }
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onInput = (value: string) => {
    if (!socket || !user?.id) return;

    setValue(value);

    socket.emit("document:update:title", {
      documentId: initialData.id,
      title: value,
      userId: user.id,
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = (icon: string) => {
    if (!socket || !user?.id) return;

    setValue(value);

    socket.emit("document:update:title", {
      documentId: initialData.id,
      icon: icon,
      userId: user.id,
    });
  };

  const onRemoveIcon = () => {
    if (!socket || !user?.id) return;

    socket.emit("document:update:title", {
      documentId: initialData.id,
      icon: "",
      userId: user.id,
    });
  };

  return (
    <div className="pl-[54px] group relative">
      {!!initialData.icon && !preview && (
        <div className="flex items-center gap-x-2 group/icon pt-6">
          <IconPicker onChange={onIconSelect}>
            <p className="text-6xl hover:opacity-75 transition">
              {initialData.icon}
            </p>
          </IconPicker>
          <Button
            onClick={onRemoveIcon}
            className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
            variant="outline"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!!initialData.icon && preview && (
        <p className="text-6xl pt-6">{initialData.icon}</p>
      )}

      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
        {!initialData.icon && !preview && (
          <IconPicker asChild onChange={onIconSelect}>
            <Button
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <Smile className="h-4 w-4 mr-2" />
              Add icon
            </Button>
          </IconPicker>
        )}
      </div>

      {isEditing && !preview ? (
        <TextAreaAutosize
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none"
        />
      ) : (
        <div
          onClick={enableInput}
          className="pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
        >
          {initialData.title}
        </div>
      )}
    </div>
  );
};
