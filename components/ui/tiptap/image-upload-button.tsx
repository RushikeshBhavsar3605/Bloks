import * as React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Image as ImageIcon, Upload } from "lucide-react";
import { cn } from "@/lib/tiptap-utils";
import Image from "@tiptap/extension-image";

interface ImageUploadButtonProps {
  editor: Editor;
  className?: string;
}

export function ImageUploadButton({
  editor,
  className,
}: ImageUploadButtonProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a URL for the image
    const url = URL.createObjectURL(file);

    // Insert the image into the editor
    editor.chain().focus().setImage({ src: url }).run();

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", className)}
            onClick={handleClick}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Upload Image</span>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
