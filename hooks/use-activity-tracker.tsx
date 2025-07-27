"use client";

import { useEffect } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { 
  trackDocumentEdit, 
  trackDocumentCreate, 
  trackDocumentShare,
  startEditingSession,
  endEditingSession 
} from "@/lib/activity-tracker";

export const useActivityTracker = () => {
  const { socket } = useSocket();
  const user = useCurrentUser();

  useEffect(() => {
    if (!socket || !user?.id) return;

    // Track document creation
    const handleDocumentCreated = (data: any) => {
      if (data.userId === user.id && user.id) {
        trackDocumentCreate(user.id, data.documentId);
      }
    };

    // Track document edits
    const handleDocumentEdit = (data: any) => {
      if (data.userId === user.id && user.id) {
        trackDocumentEdit(user.id, data.documentId);
      }
    };

    // Track document sharing
    const handleDocumentShared = (data: any) => {
      if (data.addedBy?.id === user.id && user.id) {
        trackDocumentShare(user.id, data.documentId);
      }
    };

    // Track editing sessions
    const handleJoinActiveDocument = (data: any) => {
      if (data.userId === user.id && user.id) {
        startEditingSession(user.id, data.documentId);
      }
    };

    const handleLeaveActiveDocument = (data: any) => {
      if (data.userId === user.id && user.id) {
        endEditingSession(user.id, data.documentId);
      }
    };

    // Listen to socket events
    socket.on("document:created", handleDocumentCreated);
    socket.on("document:update:title", handleDocumentEdit);
    socket.on("document:update:content", handleDocumentEdit);
    socket.on("collaborator:settings:verified", handleDocumentShared);
    socket.on("join-active-document", handleJoinActiveDocument);
    socket.on("leave-active-document", handleLeaveActiveDocument);

    return () => {
      socket.off("document:created", handleDocumentCreated);
      socket.off("document:update:title", handleDocumentEdit);
      socket.off("document:update:content", handleDocumentEdit);
      socket.off("collaborator:settings:verified", handleDocumentShared);
      socket.off("join-active-document", handleJoinActiveDocument);
      socket.off("leave-active-document", handleLeaveActiveDocument);
    };
  }, [socket, user?.id]);

  return null; // This hook doesn't return anything, just tracks activity
};