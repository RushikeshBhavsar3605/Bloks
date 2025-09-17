"use client";

import { useOrigin } from "@/hooks/use-origin";
import { CollaboratorWithMeta, DocumentWithMeta } from "@/types/shared";
import { useState } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Check, Copy, Globe } from "lucide-react";
import { publishDocument } from "@/actions/documents/publish-document";
import { unpublishDocument } from "@/actions/documents/unpublish-document";

interface PublishProps {
  initialData: DocumentWithMeta & { collaborators: CollaboratorWithMeta[] };
}
export const Publish = ({ initialData }: PublishProps) => {
  const origin = useOrigin();

  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [document, setDocument] = useState<
    DocumentWithMeta & { collaborators: CollaboratorWithMeta[] }
  >(initialData);

  const url = `${origin}/preview/${document.id}`;

  const onPublish = () => {
    setIsSubmitting(true);

    const updatedDocument = publishDocument(document.id);

    toast.promise(updatedDocument, {
      loading: "Publishing...",
      success: "Note Published",
      error: "Failed to publish note.",
    });

    updatedDocument
      .then((updated) => {
        setDocument({ ...document, isPublished: updated.isPublished });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const onUnpublish = () => {
    setIsSubmitting(true);

    const updatedDocument = unpublishDocument(document.id);

    toast.promise(updatedDocument, {
      loading: "Unpublishing...",
      success: "Note Unpublished",
      error: "Failed to unpublish note.",
    });

    updatedDocument
      .then((updated) => {
        setDocument({ ...document, isPublished: updated.isPublished });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const onCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-[#2A2A2E] hover:bg-gray-200 dark:hover:bg-[#323236] text-gray-900 dark:text-white text-sm rounded-lg transition-colors">
          {document.isPublished && (
            <Globe className="text-sky-500 w-4 h-4 mr-2" />
          )}
          Publish
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72" align="end" alignOffset={8} forceMount>
        {document.isPublished ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="text-sky-500 animate-pulse h-4 w-4" />
              <p className="text-xs font-medium text-sky-500">
                This note is live on web.
              </p>
            </div>

            <div className="flex items-center">
              <input
                className="flex-1 px-2 text-xs border rounded-l-md h-8 bg-muted truncate"
                value={url}
                disabled
              />
              <Button
                onClick={onCopy}
                disabled={copied}
                className="h-8 rounded-l-none"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Button
              size="sm"
              className="w-full text-xs"
              disabled={isSubmitting}
              onClick={onUnpublish}
            >
              Unpublish
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Globe className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-2">Publish this note</p>
            <span className="text-xs text-muted-foreground">
              Share your work with others.
            </span>
            <Button
              disabled={isSubmitting}
              onClick={onPublish}
              className="w-full text-xs"
              size="sm"
            >
              Publish
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
