"use server";

import { db } from "@/lib/db";
import { CollaboratorRole } from "@prisma/client";

export const getCoeditorUserRelation = async ({
  userId,
  profileUserId,
}: {
  userId: string;
  profileUserId: string;
}) => {
  const profileUser = await db.user.findUnique({
    where: {
      id: profileUserId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!profileUser) return null;

  const ownedDocument = await db.document.findMany({
    where: {
      userId,
      collaborators: {
        some: {
          userId: profileUserId,
        },
      },
    },
    select: {
      id: true,
      title: true,
      icon: true,
      lastEditedAt: true,
      collaborators: {
        where: {
          userId: profileUserId,
        },
        select: {
          role: true,
        },
      },
    },
  });

  const sharedDocument = await db.document.findMany({
    where: {
      userId: profileUserId,
      collaborators: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
      title: true,
      icon: true,
      lastEditedAt: true,
    },
  });

  const collaboratingUser = await db.document.findMany({
    where: {
      AND: [
        {
          collaborators: {
            some: {
              userId,
            },
          },
        },
        {
          collaborators: {
            some: {
              userId: profileUserId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      icon: true,
      lastEditedAt: true,
      collaborators: {
        where: {
          userId: profileUserId,
        },
        select: {
          role: true,
        },
      },
    },
  });

  const mergedDocuments: {
    id: string;
    title: string;
    icon: string | null;
    role: CollaboratorRole | "OWNER";
    lastModified: Date | null;
  }[] = [
    // Transform ownedDocument (documents you own where profileUserId is collaborator)
    ...ownedDocument.map((doc) => ({
      id: doc.id,
      title: doc.title,
      icon: doc.icon,
      role: doc.collaborators[0]?.role as CollaboratorRole,
      lastModified: doc.lastEditedAt,
    })),

    // Transform sharedDocument (documents profileUserId owns where you're collaborator)
    ...sharedDocument.map((doc) => ({
      id: doc.id,
      title: doc.title,
      icon: doc.icon,
      role: "OWNER" as const, // No role data in this query
      lastModified: doc.lastEditedAt,
    })),

    // Transform collaboratingUser (documents where both are collaborators)
    ...collaboratingUser.map((doc) => ({
      id: doc.id,
      title: doc.title,
      icon: doc.icon,
      role: doc.collaborators[0]?.role as CollaboratorRole,
      lastModified: doc.lastEditedAt,
    })),
  ];

  return { ...profileUser, connectedDocuments: mergedDocuments };
};
