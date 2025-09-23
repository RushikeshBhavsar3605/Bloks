"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface UpgradeAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeAlertModal = ({
  isOpen,
  onClose,
}: UpgradeAlertModalProps) => {
  const router = useRouter();

  const handleUpgrade = (e: React.MouseEvent) => {
    e.stopPropagation();

    router.replace("/billing");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>User Limit Reached</AlertDialogTitle>
          <AlertDialogDescription>
            You have reached your document creation limit. Please upgrade your
            plan to create more documents and unlock additional features.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={(e) => handleUpgrade(e)}>
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
