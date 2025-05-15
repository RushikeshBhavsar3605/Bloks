"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormSuccess } from "@/components/form-success";
import { FormError } from "@/components/form-error";
import { BeatLoader } from "react-spinners";

export default function VerifyCollaboratorPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  useEffect(() => {
    if (success || error) return;

    const token = params?.get("token");
    if (!token) {
      setError("Missing token!");
      toast.error("Missing token!");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(
          `/api/socket/collaborators/verify?token=${token}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Verification failed");
        }

        const data = await response.json();

        setSuccess("Verified Successfully!");
        toast.success("Verified Successfully!");

        // Redirect to the specified document
        router.replace(data.redirect || "/documents");
      } catch (error) {
        console.error("Verification error:", error);
        setError(
          error instanceof Error ? error.message : "Verification failed"
        );
        toast.error(
          error instanceof Error ? error.message : "Verification failed"
        );
        router.replace("/documents");
      }
    };

    verifyToken();
  }, [params, router, success, error]);

  return (
    <CardWrapper
      headerLabel="Confirming your collaboration"
      headerDescription=""
      backButtonLabel="Back to documents"
      backButtonHref="/documents"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader />}
        <FormSuccess message={success} />
        <FormError message={error} />
      </div>
    </CardWrapper>
  );
}
