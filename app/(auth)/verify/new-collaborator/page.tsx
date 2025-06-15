"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormSuccess } from "@/components/form-success";
import { FormError } from "@/components/form-error";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { toast } from "sonner";

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
          `/api/socket/auth/new-collaborator/verify?token=${token}`
        );

        if (!response.ok) {
          const error = await response.json();
          // Handle user not registered
          if (error?.error === "User not found") {
            setError("not_registered");
            return;
          }

          // Handle user not verified
          if (error?.error === "Not verified") {
            setError("not_verified");
            return;
          }

          throw new Error(error.error || "Verification failed");
        }

        const data = await response.json();

        setSuccess("Verified Successfully!");
        toast.success("Verified Successfully!");

        // Redirect to the specified document
        setTimeout(() => {
          router.replace(data.redirect || "/documents");
        }, 1000);
      } catch (error) {
        console.error("Verification error:", error);
        setError(
          error instanceof Error ? error.message : "Verification failed"
        );
        toast.error(
          error instanceof Error ? error.message : "Verification failed"
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

        {error === "not_registered" || error === "not_verified" ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <FormError
              message={
                error === "not_registered"
                  ? "You haven't registered yet!"
                  : "You haven't complete verification yet!"
              }
            />
            <Link
              href={
                error === "not_registered" ? "/auth/register" : "/auth/login"
              }
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
