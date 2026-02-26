"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormSuccess } from "@/components/form-success";
import { FormError } from "@/components/form-error";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { verifyInviteCode } from "@/actions/collaborators/verify-invite-code";

export default function VerifyCollaboratorPage({
  params,
}: {
  params: { inviteCode: string };
}) {
  const user = useCurrentUser();
  const router = useRouter();

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  useEffect(() => {
    if (success || error) return;

    const token = params.inviteCode;
    if (!token) {
      setError("Missing token!");
      toast.error("Missing token!");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await verifyInviteCode(params.inviteCode);

        if (response.error) {
          setError(response.error);
          throw new Error(response.error || "Verification failed");
        }

        setSuccess("Verified Successfully!");
        toast.success("Verified Successfully!");

        // Redirect to the specified document
        setTimeout(() => {
          router.replace(response.redirect || "/documents");
        }, 1000);
      } catch (error) {
        console.error("Verification error:", error);
        setError(
          error instanceof Error ? error.message : "Verification failed",
        );
        toast.error(
          error instanceof Error ? error.message : "Verification failed",
        );
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

        {error ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <FormError message={error} />
            <Link
              href={"/auth/register"}
              className="text-sm underline text-blue-600 hover:text-blue-700"
            >
              Click here to register
            </Link>
          </div>
        ) : (
          <FormError message={error} />
        )}
      </div>
    </CardWrapper>
  );
}
