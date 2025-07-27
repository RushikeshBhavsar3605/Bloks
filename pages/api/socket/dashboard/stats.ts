import { NextApiRequest, NextApiResponse } from "next";
import { currentUser } from "@/lib/auth-server";
import { getUserDocuments } from "@/services/document-service";
import { DocumentWithMeta } from "@/types/shared";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await currentUser(req);

    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userId } = req.query;

    if (!userId || userId !== user.id) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Get user documents
    const documentsResult = await getUserDocuments(userId as string);
    if (!documentsResult.success) {
      return res.status(500).json({ error: "Failed to fetch documents" });
    }

    const { ownedDocuments, sharedDocuments } = documentsResult.data!;

    // Calculate stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Document stats
    const totalDocuments = ownedDocuments.length;
    const weeklyDocumentGrowth = ownedDocuments.filter(
      (doc) => new Date(doc.createdAt) > oneWeekAgo
    ).length;

    // Collaboration stats
    const totalCollaborations = sharedDocuments.length;
    const weeklyCollaborationGrowth = sharedDocuments.filter((doc) =>
      doc.collaborators?.some(
        (collab) =>
          collab.userId === userId && new Date(collab.createdAt) > oneWeekAgo
      )
    ).length;

    // Activity stats (mock data for now - will be enhanced with real tracking)
    const activeTimeToday = getActiveTimeToday(userId as string);
    const averageDailyTime = getAverageDailyTime(userId as string);
    const currentStreak = calculateStreak(ownedDocuments);
    const streakGoal = 10; // Default goal

    // Generate activity chart data (last 7 days)
    const activityChart = generateActivityChartData(userId as string);

    // Get most active documents
    const mostActiveDocuments = getMostActiveDocuments(ownedDocuments);

    // Get recent activity
    const recentActivity = getRecentActivity(
      userId as string,
      ownedDocuments,
      sharedDocuments
    );

    // Get active collaborators
    const activeCollaborators = await getActiveCollaborators(
      userId as string,
      sharedDocuments
    );

    const dashboardData = {
      stats: {
        totalDocuments,
        weeklyDocumentGrowth,
        totalCollaborations,
        weeklyCollaborationGrowth,
        activeTimeToday,
        averageDailyTime,
        currentStreak,
        streakGoal,
      },
      activityChart,
      mostActiveDocuments,
      recentActivity,
      activeCollaborators,
    };

    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Helper functions

function getActiveTimeToday(userId: string): number {
  // Get from localStorage or database
  const today = new Date().toISOString().split("T")[0];
  const key = `activeTime_${userId}_${today}`;

  // For now, return mock data
  // In real implementation, this would come from activity tracking
  return Math.floor(Math.random() * 240) + 60; // 1-5 hours in minutes
}

function getAverageDailyTime(userId: string): number {
  // Calculate average from last 7 days
  // For now, return mock data
  return Math.floor(Math.random() * 180) + 120; // 2-5 hours in minutes
}

function calculateStreak(documents: DocumentWithMeta[]): number {
  if (documents.length === 0) return 0;

  // Sort documents by creation date (most recent first)
  const sortedDocs = documents
    .map((doc) => new Date(doc.createdAt))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const docDate of sortedDocs) {
    const docDay = new Date(docDate);
    docDay.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (currentDate.getTime() - docDay.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === streak) {
      streak++;
      currentDate = new Date(docDay.getTime() - 24 * 60 * 60 * 1000);
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}

function generateActivityChartData(userId: string) {
  const data = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];

    // Get activity from localStorage or database
    const key = `activity_${userId}_${dateStr}`;
    // For now, generate mock data
    const edits = Math.floor(Math.random() * 25);

    data.push({
      date: dateStr,
      edits,
    });
  }

  return data;
}

function getMostActiveDocuments(documents: DocumentWithMeta[]) {
  // Add activity scoring and sort
  const documentsWithActivity = documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    icon: doc.icon,
    collaboratorCount: doc.collaborators?.length || 0,
    editsThisWeek: Math.floor(Math.random() * 30), // Mock data
    lastActivity: doc.createdAt,
    isCurrentlyActive: Math.random() > 0.8, // 20% chance of being active
    currentEditors: Math.random() > 0.7 ? ["Sarah Chen"] : [], // Mock current editors
  }));

  // Sort by activity score
  return documentsWithActivity
    .sort((a, b) => {
      const scoreA = a.editsThisWeek * 2 + a.collaboratorCount * 5;
      const scoreB = b.editsThisWeek * 2 + b.collaboratorCount * 5;
      return scoreB - scoreA;
    })
    .slice(0, 5);
}

function getRecentActivity(
  userId: string,
  ownedDocuments: DocumentWithMeta[],
  sharedDocuments: DocumentWithMeta[]
) {
  const activities = [];

  // Add document creation activities
  ownedDocuments.slice(0, 3).forEach((doc) => {
    activities.push({
      id: `create_${doc.id}`,
      type: "document_created",
      userId: userId,
      userName: "You",
      documentId: doc.id,
      documentTitle: doc.title,
      description: "created",
      createdAt: doc.createdAt.toISOString(),
      isCurrentUser: true,
    });
  });

  // Add collaboration activities
  sharedDocuments.slice(0, 2).forEach((doc) => {
    activities.push({
      id: `collab_${doc.id}`,
      type: "collaborator_added",
      userId: doc.userId,
      userName: doc.owner?.name || "Someone",
      documentId: doc.id,
      documentTitle: doc.title,
      description: "shared",
      createdAt: doc.createdAt.toISOString(),
      isCurrentUser: false,
    });
  });

  // Add some mock edit activities
  if (ownedDocuments.length > 0) {
    const recentDoc = ownedDocuments[0];
    activities.push({
      id: `edit_${recentDoc.id}`,
      type: "document_edited",
      userId: userId,
      userName: "You",
      documentId: recentDoc.id,
      documentTitle: recentDoc.title,
      description: "edited",
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      isCurrentUser: true,
    });
  }

  // Sort by creation date (most recent first)
  return activities
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);
}

async function getActiveCollaborators(
  userId: string,
  sharedDocuments: DocumentWithMeta[]
) {
  const collaboratorMap = new Map();

  // Collect unique collaborators from shared documents
  sharedDocuments.forEach((doc) => {
    if (doc.owner && doc.owner.id !== userId) {
      collaboratorMap.set(doc.owner.id, {
        id: `owner_${doc.owner.id}`,
        userId: doc.owner.id,
        userName: doc.owner.name || "Unknown",
        userEmail: doc.owner.email || "",
        userImage: doc.owner.image,
        status:
          Math.random() > 0.5
            ? "online"
            : Math.random() > 0.5
            ? "away"
            : "offline",
        lastActivity: new Date(
          Date.now() - Math.random() * 24 * 60 * 60 * 1000
        ).toISOString(),
        isEditing: Math.random() > 0.8,
      });
    }

    doc.collaborators?.forEach((collab: any) => {
      if (collab.user && collab.user.id !== userId) {
        collaboratorMap.set(collab.user.id, {
          id: collab.id,
          userId: collab.user.id,
          userName: collab.user.name || "Unknown",
          userEmail: collab.user.email || "",
          userImage: collab.user.image,
          status:
            Math.random() > 0.5
              ? "online"
              : Math.random() > 0.5
              ? "away"
              : "offline",
          lastActivity: new Date(
            Date.now() - Math.random() * 24 * 60 * 60 * 1000
          ).toISOString(),
          isEditing: Math.random() > 0.8,
        });
      }
    });
  });

  return Array.from(collaboratorMap.values()).slice(0, 8);
}
