import { create } from "zustand";

type SaveStatus = "Saving" | "Saved";

type SaveStatusStore = {
  status: SaveStatus;
  setSaving: () => void;
  setSaved: () => void;
};

export const useSaveStatus = create<SaveStatusStore>((set, get) => ({
  status: "Saved",
  setSaving: () =>
    set({
      status: "Saving",
    }),
  setSaved: () =>
    set({
      status: "Saved",
    }),
}));
