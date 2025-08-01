"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Settings, User, Bell, Shield, Palette, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
  const user = useCurrentUser();
  const router = useRouter();

  const settingsSections = [
    {
      title: "Profile",
      icon: User,
      description: "Manage your account information and preferences",
      items: ["Personal information", "Profile picture", "Display name"]
    },
    {
      title: "Notifications",
      icon: Bell,
      description: "Configure how you receive notifications",
      items: ["Email notifications", "Push notifications", "Notification frequency"]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      description: "Control your privacy and security settings",
      items: ["Two-factor authentication", "Privacy settings", "Data export"]
    },
    {
      title: "Appearance",
      icon: Palette,
      description: "Customize the look and feel of your workspace",
      items: ["Theme selection", "Font preferences", "Layout options"]
    },
    {
      title: "Language & Region",
      icon: Globe,
      description: "Set your language and regional preferences",
      items: ["Language", "Time zone", "Date format"]
    }
  ];

  return (
    <div className="h-full p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-gray-500" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* Profile Section */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {user?.image ? (
              <AvatarImage src={user.image} />
            ) : (
              <AvatarFallback className="text-lg font-semibold">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{user?.name || "User"}</h3>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Member since {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="p-6 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-4">
                <Icon className="h-6 w-6 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">{section.title}</h3>
                  <p className="text-muted-foreground mb-4">{section.description}</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {section.items.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => router.push("/documents")}>
          Back to Documents
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;