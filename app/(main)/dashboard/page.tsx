"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSocket } from "@/components/providers/socket-provider";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { MostActiveDocuments } from "@/components/dashboard/most-active-documents";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ActiveCollaborators } from "@/components/dashboard/active-collaborators";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  stats: {
    totalDocuments: number;
    weeklyDocumentGrowth: number;
    totalCollaborations: number;
    weeklyCollaborationGrowth: number;
    activeTimeToday: number;
    averageDailyTime: number;
    currentStreak: number;
    streakGoal: number;
  };
  activityChart: {
    date: string;
    edits: number;
  }[];
  mostActiveDocuments: any[];
  recentActivity: any[];
  activeCollaborators: any[];
}

const DashboardPage = () => {
  const user = useCurrentUser();
  const { socket } = useSocket();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`/api/socket/dashboard/stats?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Real-time updates
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleDashboardUpdate = (data: any) => {
      setDashboardData(prev => prev ? { ...prev, ...data } : null);
    };

    const handleDocumentCreated = () => {
      setDashboardData(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          totalDocuments: prev.stats.totalDocuments + 1
        }
      } : null);
    };

    const handleCollaboratorAdded = () => {
      setDashboardData(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          totalCollaborations: prev.stats.totalCollaborations + 1
        }
      } : null);
    };

    socket.on("dashboard:update", handleDashboardUpdate);
    socket.on("document:created", handleDocumentCreated);
    socket.on("collaborator:settings:verified", handleCollaboratorAdded);

    return () => {
      socket.off("dashboard:update", handleDashboardUpdate);
      socket.off("document:created", handleDocumentCreated);
      socket.off("collaborator:settings:verified", handleCollaboratorAdded);
    };
  }, [socket, user?.id]);

  if (loading) {
    return (
      <div className="h-full flex flex-col space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        
        {/* Chart Skeleton */}
        <Skeleton className="h-80 w-full" />
        
        {/* Bottom Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back, {user?.name?.split(" ")[0]}!
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={dashboardData.stats} />

      {/* Activity Chart */}
      <ActivityChart data={dashboardData.activityChart} />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <MostActiveDocuments documents={dashboardData.mostActiveDocuments} />
        </div>
        <div className="space-y-6">
          <RecentActivity activities={dashboardData.recentActivity} />
          <ActiveCollaborators collaborators={dashboardData.activeCollaborators} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;