"use server";

import { db } from "@/lib/db";

export const getPublicPageStats = async (): Promise<{
  totalDocuments: number;
  recentlyPublished: number;
  mostPopularViews: number;
}> => {
  const totalDocuments = await db.document.count({
    where: {
      isPublished: true,
    },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentlyPublished = await db.document.count({
    where: {
      isPublished: true,
      publishedAt: {
        gte: sevenDaysAgo, // Only include documents created after 7 days ago
      },
    },
  });

  const mostPopularViews = await db.document.findFirst({
    where: {
      isPublished: true,
    },
    orderBy: {
      views: "desc",
    },
    select: {
      views: true,
    },
  });

  return {
    totalDocuments,
    recentlyPublished,
    mostPopularViews: mostPopularViews !== null ? mostPopularViews.views : 0,
  };
};
