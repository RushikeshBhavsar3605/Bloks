"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Code,
  Link,
  List,
  ImageIcon,
  Table,
  MoreHorizontal,
  RotateCcw,
  RotateCw,
  Hash,
  CheckSquare,
  Quote,
  Calendar,
  User,
  Clock,
  Star,
  MessageCircle,
  Share2,
  Eye,
} from "lucide-react"

interface DocumentEditorProps {
  documentId: string | null
  onBack: () => void
}

export function DocumentEditor({ documentId, onBack }: DocumentEditorProps) {
  const [isEditing, setIsEditing] = useState(false)

  const getDocumentData = (docId: string | null) => {
    switch (docId) {
      case "project-roadmap":
        return {
          title: "Q1 2024 Product Roadmap",
          icon: "🎯",
          lastModified: "2 hours ago",
          author: "Rushikesh Joseph",
          collaborators: ["Sarah Chen", "Mike Johnson", "Alex Rodriguez"],
        }
      case "meeting-notes-jan":
        return {
          title: "Weekly Team Sync - January 15",
          icon: "📋",
          lastModified: "1 day ago",
          author: "Rushikesh Joseph",
          collaborators: ["Sarah Chen", "Mike Johnson"],
        }
      case "feature-spec":
        return {
          title: "User Authentication System Spec",
          icon: "🔐",
          lastModified: "3 days ago",
          author: "Rushikesh Joseph",
          collaborators: ["Alex Rodriguez"],
        }
      default:
        return {
          title: "Untitled",
          icon: "📄",
          lastModified: "Just now",
          author: "Rushikesh Joseph",
          collaborators: [],
        }
    }
  }

  const docData = getDocumentData(documentId)

  return (
    <div className="flex-1 flex flex-col bg-[#0B0B0F]">
      {/* Header */}
      <header className="h-[72px] flex items-center justify-between px-8 border-b border-[#1E1E20]">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#1E1E20] rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{docData.icon}</span>
            <div>
              <h1 className="text-white text-sm font-medium">{docData.title}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Last edited {docData.lastModified}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            {docData.collaborators.slice(0, 3).map((collaborator, index) => (
              <div
                key={collaborator}
                className="w-7 h-7 bg-blue-600 rounded-full border-2 border-[#0B0B0F] flex items-center justify-center text-xs font-medium text-white"
                title={collaborator}
              >
                {collaborator
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#2A2A2E] hover:bg-[#323236] text-white text-sm rounded-lg transition-colors">
            <Star className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-[#1E1E20] rounded-lg transition-colors text-gray-400 hover:text-white">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-[#1E1E20] px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <RotateCw className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-[#1E1E20] mx-2" />
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <Hash className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <Bold className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <Italic className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <Underline className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <Code className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-[#1E1E20] mx-2" />
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <Link className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <List className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <CheckSquare className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <ImageIcon className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <Table className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isEditing ? "bg-blue-600 text-white" : "bg-[#2A2A2E] hover:bg-[#323236] text-gray-300"
              }`}
            >
              {isEditing ? "Done" : "Edit"}
            </button>
            <button className="p-1.5 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-[#1E1E20] rounded text-gray-400 hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Document Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-6xl">{docData.icon}</span>
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-white mb-2">{docData.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{docData.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created January 10, 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Body */}
          <div className="prose prose-invert max-w-none">
            {/* Overview Section */}
            <div className="mb-10">
              <div className="bg-[#1A1A1C] border border-[#2A2A2E] rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">ℹ️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Overview</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  This roadmap outlines our key product initiatives for Q1 2024, focusing on user experience
                  improvements, platform scalability, and new feature development. Our primary goal is to increase user
                  engagement by 25% while maintaining system reliability.
                </p>
              </div>
            </div>

            {/* Key Objectives */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                Key Objectives
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#161618] border border-[#1E1E20] rounded-lg p-5">
                  <div className="text-2xl mb-3">🚀</div>
                  <h4 className="font-semibold text-white mb-2">Launch New Dashboard</h4>
                  <p className="text-sm text-gray-400">
                    Redesigned user interface with improved navigation and analytics
                  </p>
                </div>
                <div className="bg-[#161618] border border-[#1E1E20] rounded-lg p-5">
                  <div className="text-2xl mb-3">👥</div>
                  <h4 className="font-semibold text-white mb-2">Real-time Collaboration</h4>
                  <p className="text-sm text-gray-400">Enable multiple users to work on documents simultaneously</p>
                </div>
                <div className="bg-[#161618] border border-[#1E1E20] rounded-lg p-5">
                  <div className="text-2xl mb-3">📱</div>
                  <h4 className="font-semibold text-white mb-2">Mobile App Beta</h4>
                  <p className="text-sm text-gray-400">iOS and Android applications for on-the-go productivity</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📅</span>
                Timeline & Milestones
              </h2>

              {/* January */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-white">January 2024</h3>
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">In Progress</span>
                </div>
                <div className="ml-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">User research and wireframes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">Technical architecture planning</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">Design system updates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">Database optimization</span>
                  </div>
                </div>
              </div>

              {/* February */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-white">February 2024</h3>
                  <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Planned</span>
                </div>
                <div className="ml-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">Dashboard development sprint 1</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">API improvements and documentation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">Mobile app foundation setup</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">User testing sessions</span>
                  </div>
                </div>
              </div>

              {/* March */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-white">March 2024</h3>
                  <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Planned</span>
                </div>
                <div className="ml-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">Beta testing with select users</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">Performance optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">Launch preparation and marketing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      readOnly
                    />
                    <span className="text-gray-300">Documentation and training materials</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Metrics */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                Success Metrics
              </h2>
              <div className="bg-[#161618] border border-[#1E1E20] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#1A1A1C]">
                    <tr>
                      <th className="text-left p-4 text-white font-semibold">Metric</th>
                      <th className="text-left p-4 text-white font-semibold">Current</th>
                      <th className="text-left p-4 text-white font-semibold">Target</th>
                      <th className="text-left p-4 text-white font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#1E1E20]">
                      <td className="p-4 text-gray-300">User Engagement</td>
                      <td className="p-4 text-gray-300">68%</td>
                      <td className="p-4 text-gray-300">85%</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">In Progress</span>
                      </td>
                    </tr>
                    <tr className="border-t border-[#1E1E20]">
                      <td className="p-4 text-gray-300">User Satisfaction</td>
                      <td className="p-4 text-gray-300">4.2/5</td>
                      <td className="p-4 text-gray-300">4.5/5</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">On Track</span>
                      </td>
                    </tr>
                    <tr className="border-t border-[#1E1E20]">
                      <td className="p-4 text-gray-300">Page Load Time</td>
                      <td className="p-4 text-gray-300">2.1s</td>
                      <td className="p-4 text-gray-300">1.5s</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">At Risk</span>
                      </td>
                    </tr>
                    <tr className="border-t border-[#1E1E20]">
                      <td className="p-4 text-gray-300">Mobile App Downloads</td>
                      <td className="p-4 text-gray-300">0</td>
                      <td className="p-4 text-gray-300">1,000</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Not Started</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Team & Resources */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">👥</span>
                Team & Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-4">Core Team</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                        RJ
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Rushikesh Joseph</div>
                        <div className="text-gray-400 text-xs">Product Manager</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                        SC
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Sarah Chen</div>
                        <div className="text-gray-400 text-xs">Lead Designer</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                        MJ
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Mike Johnson</div>
                        <div className="text-gray-400 text-xs">Senior Developer</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                        AR
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Alex Rodriguez</div>
                        <div className="text-gray-400 text-xs">DevOps Engineer</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-4">Budget & Tools</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Budget:</span>
                      <span className="text-white font-medium">$75,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Development:</span>
                      <span className="text-white">$45,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Design:</span>
                      <span className="text-white">$15,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Marketing:</span>
                      <span className="text-white">$15,000</span>
                    </div>
                    <div className="pt-3 border-t border-[#1E1E20]">
                      <div className="text-gray-300 mb-2">Tools & Platforms:</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-[#2A2A2E] text-gray-300 text-xs rounded">Figma</span>
                        <span className="px-2 py-1 bg-[#2A2A2E] text-gray-300 text-xs rounded">GitHub</span>
                        <span className="px-2 py-1 bg-[#2A2A2E] text-gray-300 text-xs rounded">Slack</span>
                        <span className="px-2 py-1 bg-[#2A2A2E] text-gray-300 text-xs rounded">Vercel</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Updates */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📝</span>
                Notes & Updates
              </h2>
              <div className="bg-[#1A1A1C] border-l-4 border-blue-500 p-6 rounded-r-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Quote className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Important Note</span>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  This roadmap is a living document and will be updated regularly based on user feedback, technical
                  constraints, and business priorities. All dates are estimates and subject to change.
                </p>
                <div className="text-sm text-gray-400">Last updated: January 15, 2024 by Rushikesh Joseph</div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-[#1E1E20] text-center">
              <div className="text-sm text-gray-500">
                Created with ❤️ using Jotion • Last modified {docData.lastModified}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
