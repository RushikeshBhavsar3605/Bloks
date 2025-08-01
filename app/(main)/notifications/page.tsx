"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const NotificationsPage = () => {
  const user = useCurrentUser();
  const router = useRouter();

  const mockNotifications = [
    {
      id: 1,
      type: "info",
      title: "Welcome to Jotion!",
      message: "Your workspace has been set up successfully.",
      time: "2 hours ago",
      icon: Info,
      color: "text-blue-500"
    },
    {
      id: 2,
      type: "success",
      title: "Document Shared",
      message: "Your document 'Project Notes' has been shared with the team.",
      time: "1 day ago",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      id: 3,
      type: "warning",
      title: "Storage Almost Full",
      message: "You're using 85% of your storage space. Consider upgrading.",
      time: "3 days ago",
      icon: AlertTriangle,
      color: "text-yellow-500"
    }
  ];

  return (
    <div className="h-full p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Notifications</h1>
      </div>

      <div className="space-y-4">
        {mockNotifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <Icon className={`h-5 w-5 mt-1 ${notification.color}`} />
              <div className="flex-1">
                <h3 className="font-medium">{notification.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <span className="text-xs text-muted-foreground mt-2 block">{notification.time}</span>
              </div>
              <Button variant="ghost" size="sm">
                Mark as read
              </Button>
            </div>
          );
        })}
      </div>

      {mockNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button variant="outline" onClick={() => router.push("/documents")}>
          Back to Documents
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPage;