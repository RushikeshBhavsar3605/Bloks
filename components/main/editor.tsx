"use client";

import { SimpleEditor } from "../templates/simple-editor";

interface EditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export const Editor = ({ initialContent, onChange, editable }: EditorProps) => {
  return <SimpleEditor />;
};
