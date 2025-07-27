"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  FileText,
  Users,
  MessageSquare,
  Share,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Activity {
  id: string;
  type:
    | "document_created"
    | "document_edited"
    | "collaborator_added"
    | "comment_added"
    | "document_shared";
  userId: string;
  userName: string;
  documentId: string;
  documentTitle: string;
  description: string;
  createdAt: string;
  isCurrentUser: boolean;
}

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  const router = useRouter();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "document_created":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "document_edited":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "collaborator_added":
        return <Users className="h-4 w-4 text-purple-600" />;
      case "comment_added":
        return <MessageSquare className="h-4 w-4 text-orange-600" />;
      case "document_shared":
        return <Share className="h-4 w-4 text-indigo-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  const handleViewDocument = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const handleViewAllActivity = () => {
    router.push("/activity");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">
                Start creating and collaborating to see activity here
              </p>
            </div>
          ) : (
            <>
              {/* Live Activity Section */}
              {activities.some(
                (a) =>
                  a.type === "document_edited" &&
                  new Date().getTime() - new Date(a.createdAt).getTime() <
                    5 * 60 * 1000
              ) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-800">
                      Live Activity
                    </span>
                  </div>
                  {activities
                    .filter(
                      (a) =>
                        a.type === "document_edited" &&
                        new Date().getTime() - new Date(a.createdAt).getTime() <
                          5 * 60 * 1000
                    )
                    .slice(0, 2)
                    .map((activity) => (
                      <div key={activity.id} className="text-sm text-green-700">
                        <span className="font-medium">{activity.userName}</span>{" "}
                        is editing{" "}
                        <span
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() =>
                            handleViewDocument(activity.documentId)
                          }
                        >
                          &quot;{activity.documentTitle}&quot;
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Regular Activity Feed */}
              <div className="space-y-3">
                {activities.slice(0, 8).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span
                          className={`font-medium ${
                            activity.isCurrentUser ? "text-blue-600" : ""
                          }`}
                        >
                          {activity.isCurrentUser ? "You" : activity.userName}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          {activity.description}{" "}
                        </span>
                        <span
                          className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() =>
                            handleViewDocument(activity.documentId)
                          }
                        >
                          &quot;{activity.documentTitle}&quot;
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={handleViewAllActivity}
            >
              View All Activity →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
