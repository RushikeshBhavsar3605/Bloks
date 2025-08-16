"use client";

import { SimpleEditorNoToolbar } from "../templates/simple-editor-no-toolbar";
import { useState } from "react";

interface EditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  editable?: boolean;
  documentId?: string;
  onEditorReady?: (editor: any) => void;
}

export const Editor = ({ initialContent, onChange, editable, documentId, onEditorReady }: EditorProps) => {
  return (
    <SimpleEditorNoToolbar 
      content={initialContent}
      onChange={onChange}
      editable={editable}
      documentId={documentId}
      onEditorReady={onEditorReady}
    />
  );
};
