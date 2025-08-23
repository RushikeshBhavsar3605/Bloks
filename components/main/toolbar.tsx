"use client";

import { DocumentWithMeta } from "@/types/shared";
import { IconPicker } from "./icon-picker";
import { Button } from "../ui/button";
import { Smile, X, User, Calendar } from "lucide-react";
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
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = inputRef.current.value.length; // Position cursor at the end
        inputRef.current.selectionEnd = inputRef.current.value.length; // Ensure cursor is at the end
      }
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
  };

  const onInput = (newValue: string) => {
    if (!socket || !user?.id) return;

    setValue(newValue);

    socket.emit("document:update:title", {
      documentId: initialData.id,
      title: newValue,
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
    if (!socket || !user?.id || preview) return;

    socket.emit("document:update:title", {
      documentId: initialData.id,
      icon: icon,
      userId: user.id,
    });
  };

  const onRemoveIcon = () => {
    if (!socket || !user?.id || preview) return;

    socket.emit("document:update:title", {
      documentId: initialData.id,
      icon: "",
      userId: user.id,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      {/* Document Header */}
      <div>
        <div className="flex items-center gap-4 mt-14">
          {/* Icon */}
          {!!initialData.icon && !preview && (
            <div className="group/icon">
              <IconPicker onChange={onIconSelect}>
                <span className="text-6xl hover:opacity-75 transition cursor-pointer">
                  {initialData.icon}
                </span>
              </IconPicker>
              <Button
                onClick={onRemoveIcon}
                className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs ml-2 absolute"
                variant="outline"
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {!!initialData.icon && preview && (
            <span className="text-6xl">{initialData.icon}</span>
          )}

          {!initialData.icon && !preview && (
            <div className="opacity-0 group-hover:opacity-100">
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
            </div>
          )}

          {/* Title and Meta */}
          <div className="flex-1">
            {isEditing && !preview ? (
              <TextAreaAutosize
                ref={inputRef}
                onBlur={disableInput}
                onKeyDown={onKeyDown}
                value={value}
                onChange={(e) => onInput(e.target.value)}
                className="text-5xl bg-transparent font-bold break-words outline-none text-gray-900 dark:text-white resize-none w-full mb-2"
              />
            ) : (
              <h1
                onClick={enableInput}
                className="text-5xl font-bold text-gray-900 dark:text-white mb-2 cursor-text"
              >
                {initialData.title}
              </h1>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{initialData.owner?.name || "Unknown Author"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Created {new Date(initialData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
