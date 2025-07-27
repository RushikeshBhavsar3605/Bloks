"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Clock, Flame } from "lucide-react";

interface StatsCardsProps {
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
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const cards = [
    {
      title: "My Documents",
      value: stats.totalDocuments,
      change: `+${stats.weeklyDocumentGrowth} this week`,
      icon: FileText,
      progress: getProgressPercentage(stats.totalDocuments, 50), // Assuming goal of 50 docs
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Collaborating",
      value: stats.totalCollaborations,
      change: `+${stats.weeklyCollaborationGrowth} new`,
      icon: Users,
      progress: getProgressPercentage(stats.totalCollaborations, 20), // Assuming goal of 20 collaborations
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Today",
      value: formatTime(stats.activeTimeToday),
      change: `${formatTime(stats.averageDailyTime)} avg`,
      icon: Clock,
      progress: getProgressPercentage(stats.activeTimeToday, 240), // 4 hours goal
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Streak",
      value: `${stats.currentStreak} days`,
      change: "🎯 Goal",
      icon: Flame,
      progress: getProgressPercentage(stats.currentStreak, stats.streakGoal),
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {typeof card.value === 'string' ? card.value : card.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {card.change}
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  card.color.replace('text-', 'bg-')
                }`}
                style={{ width: `${card.progress}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(card.progress)}% progress
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};