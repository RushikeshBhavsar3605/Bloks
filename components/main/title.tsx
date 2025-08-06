"use client";

import { useState, useEffect } from "react";
import { useSocket } from "../providers/socket-provider";
import { DocumentWithMeta } from "@/types/shared";
import { Skeleton } from "../ui/skeleton";

interface TitleProps {
  initialData: DocumentWithMeta;
}

export const Title = ({ initialData }: TitleProps) => {
  const { socket } = useSocket();
  const [title, setTitle] = useState(initialData.title || "Untitled");

  useEffect(() => {
    setTitle(initialData.title || "Untitled");
  }, [initialData.title, initialData.id]);

  // Listen for title changes
  useEffect(() => {
    if (!socket) return;

    const handleTitleUpdate = ({
      documentId,
      title: newTitle,
    }: {
      documentId: string;
      title?: string;
    }) => {
      if (documentId === initialData.id && newTitle !== undefined) {
        setTitle(newTitle);
      }
    };

    const titleChangeEvent = `document:receive:title:${initialData.id}`;
    socket.on(titleChangeEvent, handleTitleUpdate);

    return () => {
      socket.off(titleChangeEvent, handleTitleUpdate);
    };
  }, [socket, initialData.id]);

  return (
    <div>
      <h1 className="text-gray-900 dark:text-white text-sm font-medium">
        {title}
      </h1>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
        <span>Last edited recently</span>
      </div>
    </div>
  );
};

Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-7 w-52 rounded-md" />;
};
