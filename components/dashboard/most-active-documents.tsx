"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Edit3, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Document {
  id: string;
  title: string;
  icon?: string;
  collaboratorCount: number;
  editsThisWeek: number;
  lastActivity: string;
  isCurrentlyActive: boolean;
  currentEditors: string[];
}

interface MostActiveDocumentsProps {
  documents: Document[];
}

export const MostActiveDocuments = ({ documents }: MostActiveDocumentsProps) => {
  const router = useRouter();

  const handleViewAnalytics = (documentId: string) => {
    router.push(`/analytics/${documentId}`);
  };

  const handleViewDocument = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Most Active Documents</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active documents yet</p>
              <p className="text-sm">Create your first document to see activity here</p>
            </div>
          ) : (
            documents.map((doc, index) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{doc.icon || "📄"}</span>
                      <h4 
                        className="font-medium truncate cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleViewDocument(doc.id)}
                      >
                        {doc.title}
                      </h4>
                      {doc.isCurrentlyActive && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-green-600 font-medium">Live</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{doc.collaboratorCount} collaborators</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Edit3 className="h-3 w-3" />
                        <span>{doc.editsThisWeek} edits this week</span>
                      </div>
                    </div>

                    {/* Current Editors */}
                    {doc.currentEditors.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-1 text-xs">
                          <span className="text-muted-foreground">Currently editing:</span>
                          <span className="text-green-600 font-medium">
                            {doc.currentEditors.join(", ")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewAnalytics(doc.id)}
                    className="text-xs"
                  >
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {documents.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => router.push("/documents")}
            >
              View All Documents →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};