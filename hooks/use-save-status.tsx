import { create } from "zustand";
import { useEffect } from "react";
import { useSocket } from "@/components/providers/socket-provider";

type SaveStatus = "Saving" | "Saved" | "Error";

type SaveStatusStore = {
  status: SaveStatus;
  error?: string;
  setSaving: () => void;
  setSaved: () => void;
  setError: (error: string) => void;
  reset: () => void;
};

const useSaveStatusStore = create<SaveStatusStore>((set, get) => ({
  status: "Saved",
  error: undefined,
  setSaving: () =>
    set({
      status: "Saving",
      error: undefined,
    }),
  setSaved: () =>
    set({
      status: "Saved",
      error: undefined,
    }),
  setError: (error: string) =>
    set({
      status: "Error",
      error,
    }),
  reset: () =>
    set({
      status: "Saved",
      error: undefined,
    }),
}));

export const useSaveStatus = () => {
  const store = useSaveStatusStore();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleSaveStatus = (data: { status: string; error?: string }) => {
      if (data.status === "saving") {
        store.setSaving();
      } else if (data.status === "saved") {
        store.setSaved();
      } else if (data.status === "error") {
        store.setError(data.error || "Unknown error");
      }
    };

    socket.on("save:status", handleSaveStatus);

    return () => {
      socket.off("save:status", handleSaveStatus);
    };
  }, [socket, store]);

  return store;
};
