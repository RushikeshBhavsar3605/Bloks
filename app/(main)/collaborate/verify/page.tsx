"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyCollaboratorPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params?.get("token");
    if (!token) return;

    fetch(`/api/socket/collaborators/verify?token=${token}`)
      .then(() => {
        // Redirect will already happen on server, fallback here
        router.push("/documents");
      })
      .catch(() => router.push("/error"));
  }, [params, router]);

  return <p>Verifying invitation...</p>;
}
