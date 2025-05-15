"use client";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";

export const ErrorCard = () => {
  const searchParams = useSearchParams();
  const urlError =
    searchParams?.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : "Oops! Something went wrong!";

  return (
    <CardWrapper
      headerLabel="Error"
      headerDescription={urlError}
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <div className="w-full flex justify-center items-center">
        <TriangleAlert className="text-destructive" />
      </div>
    </CardWrapper>
  );
};
