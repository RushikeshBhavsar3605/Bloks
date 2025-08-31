"use client";

import { useState } from "react";
import { Github, Twitter, Linkedin, Slack, Figma } from "lucide-react";

export const IntegrationsTab = () => {
  const [connections, setConnections] = useState({
    github: true,
    slack: false,
    figma: true,
    notion: false,
    twitter: false,
    linkedin: false,
  });

  const integrations = [
    {
      id: "github",
      name: "GitHub",
      icon: Github,
      description: "Sync your repositories and collaborate on code",
      connected: connections.github,
    },
    {
      id: "slack",
      name: "Slack",
      icon: Slack,
      description: "Get notifications and updates in your Slack workspace",
      connected: connections.slack,
    },
    {
      id: "figma",
      name: "Figma",
      icon: Figma,
      description: "Import designs and collaborate with your design team",
      connected: connections.figma,
    },
    {
      id: "notion",
      name: "Notion",
      icon: Figma,
      description: "Sync your notes and documents with Notion",
      connected: connections.notion,
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: Twitter,
      description: "Share updates and connect with your network",
      connected: connections.twitter,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      description: "Share professional updates and network",
      connected: connections.linkedin,
    },
  ];

  const toggleConnection = (id: string) => {
    setConnections((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  return (
    <div className="space-y-8">
      {/* Connected Services */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Available Integrations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;

            return (
              <div
                key={integration.id}
                className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#2A2A2E] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-white">
                        {integration.name}
                      </h4>
                      {integration.connected && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      {integration.description}
                    </p>
                    <button
                      onClick={() => toggleConnection(integration.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        integration.connected
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {integration.connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* API Access */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Developer Tools
        </h3>
        <div className="space-y-4">
          <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
            <h4 className="font-medium text-white mb-2">API Access</h4>
            <p className="text-sm text-gray-400 mb-4">
              Generate API keys to build custom integrations and automate
              workflows.
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                Generate API Key
              </button>
              <button className="px-4 py-2 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm font-medium rounded-lg transition-colors">
                View Documentation
              </button>
            </div>
          </div>

          <div className="bg-[#161618] border border-[#1E1E20] rounded-xl p-6">
            <h4 className="font-medium text-white mb-2">Webhooks</h4>
            <p className="text-sm text-gray-400 mb-4">
              Receive real-time notifications when events occur in your
              workspace.
            </p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
              Configure Webhooks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
