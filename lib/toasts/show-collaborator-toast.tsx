"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface showCollaboratorInviteToastProps {
  newCollaborator: {
    userName?: string;
    email: string;
    documentId: string;
    documentTitle: string;
    addedBy: { name: string; id: string };
  };
  userExist: boolean;
  openDocument: () => void;
}

export const showCollaboratorInviteToast = ({
  newCollaborator,
  userExist,
  openDocument,
}: showCollaboratorInviteToastProps) => {
  const { userName, email, documentId, documentTitle, addedBy } =
    newCollaborator;
  const truncatedEmail =
    email.length > 25 ? `${email.substring(0, 25)}...` : email;
  const displayName = userExist ? userName : truncatedEmail;
  const truncatedTitle =
    documentTitle.length > 30
      ? `${documentTitle.substring(0, 30)}...`
      : documentTitle;

  const copyDocumentId = async () => {
    try {
      await navigator.clipboard.writeText(documentId);
      toast.success("Document ID copied to clipboard", {
        duration: 2000,
        position: "bottom-center",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  toast(
    <div className="space-y-3 pt-1">
      {/* Title */}
      <div className="flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-muted-foreground dark:text-muted-foreground/80" />
        <span className="text-sm font-semibold text-muted-foreground">
          New Collaborator Added
        </span>
      </div>

      {/* Main message */}
      <div className="text-[13px]">
        <div>
          <span className="font-semibold text-muted-foreground">
            {addedBy.name}
          </span>
          <span className="text-muted-foreground"> invited </span>
          <span className="font-semibold text-muted-foreground">
            {displayName}
          </span>
          <span className="text-muted-foreground">
            {" "}
            to join and collaborate on{" "}
          </span>
          <span className="font-semibold text-muted-foreground">
            &quot;{truncatedTitle}&quot;
          </span>
        </div>
      </div>

      {/* Badge and email row */}
      <div className="flex items-center gap-2 text-xs">
        <Badge variant="secondary" className="text-muted-foreground">
          {userExist ? "Existing User" : "New Invite"}
        </Badge>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground font-mono">{displayName}</span>
      </div>

      {/* Separator */}
      <Separator />

      {/* Document ID with copy functionality */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-muted-foreground">Doc ID:</span>
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5">
            {documentId.substring(0, 10)}...
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={copyDocumentId}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy ID
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={openDocument}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open
          </Button>
        </div>
      </div>
    </div>,
    {
      position: "top-right",
      duration: 5000,
      className: "group",
    }
  );
};
