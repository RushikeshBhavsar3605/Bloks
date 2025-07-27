"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Circle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Collaborator {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  status: 'online' | 'away' | 'offline';
  lastActivity: string;
  currentDocument?: string;
  isEditing: boolean;
}

interface ActiveCollaboratorsProps {
  collaborators: Collaborator[];
}

export const ActiveCollaborators = ({ collaborators }: ActiveCollaboratorsProps) => {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'away':
        return 'text-yellow-500';
      case 'offline':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string, lastActivity: string, isEditing: boolean, currentDocument?: string) => {
    if (status === 'online' && isEditing && currentDocument) {
      return `editing now`;
    }
    
    const date = new Date(lastActivity);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 5) {
      return 'active now';
    } else if (diffInMinutes < 60) {
      return `active ${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `active ${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `active ${days}d ago`;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewAllCollaborators = () => {
    router.push('/collaborators');
  };

  // Sort collaborators by status and activity
  const sortedCollaborators = [...collaborators].sort((a, b) => {
    const statusOrder = { online: 0, away: 1, offline: 2 };
    const aOrder = statusOrder[a.status as keyof typeof statusOrder];
    const bOrder = statusOrder[b.status as keyof typeof statusOrder];
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // If same status, sort by last activity
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });

  const onlineCount = collaborators.filter(c => c.status === 'online').length;
  const activeToday = collaborators.filter(c => {
    const lastActivity = new Date(c.lastActivity);
    const today = new Date();
    return lastActivity.toDateString() === today.toDateString();
  }).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Active Collaborators</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            ({onlineCount} online)
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No collaborators yet</p>
            <p className="text-sm">Invite people to collaborate on your documents</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm">
                <span className="font-medium">{collaborators.length}</span> total collaborators
              </div>
              <div className="text-sm">
                <span className="font-medium">{activeToday}</span> active today
              </div>
            </div>

            {/* Collaborators List */}
            <div className="space-y-3">
              {sortedCollaborators.slice(0, 6).map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Avatar with Status */}
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.userImage} />
                      <AvatarFallback className="text-xs">
                        {getInitials(collaborator.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <Circle 
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-current ${getStatusColor(collaborator.status)}`}
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">
                        {collaborator.userName}
                      </p>
                      {collaborator.isEditing && collaborator.status === 'online' && (
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-green-600 font-medium">editing</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getStatusText(
                        collaborator.status, 
                        collaborator.lastActivity, 
                        collaborator.isEditing,
                        collaborator.currentDocument
                      )}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    <Circle className={`h-2 w-2 fill-current ${getStatusColor(collaborator.status)}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            {collaborators.length > 6 && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={handleViewAllCollaborators}
                >
                  View All Collaborators ({collaborators.length - 6} more) →
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};