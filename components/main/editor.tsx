"use client";

import { SimpleEditor } from "../templates/simple-editor";

interface EditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  documentId?: string;
}

export const Editor = ({ initialContent, onChange, editable, documentId }: EditorProps) => {
  return (
    <SimpleEditor 
      content={initialContent}
      onChange={onChange}
      editable={editable}
      documentId={documentId}
    />
  );
};
