import { FileText, Lock, Search, Share2, Smartphone, Zap } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: FileText,
      title: "Nested File Structure",
      description:
        "Every file can contain other files. Create infinite hierarchies where each document becomes a container for more content.",
    },
    {
      icon: Search,
      title: "Powerful Search",
      description:
        "Find anything instantly with our AI-powered search across all your nested files and content.",
    },
    {
      icon: Share2,
      title: "Real-time Collaboration",
      description:
        "Work together seamlessly with your team in real-time, with comments and suggestions.",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description:
        "Bank-level security with end-to-end encryption and advanced permission controls.",
    },
    {
      icon: Smartphone,
      title: "Works Everywhere",
      description:
        "Access your workspace from any device - desktop, tablet, or mobile. Always in sync.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Built for speed with instant loading, real-time sync, and offline support.",
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Everything you need to be productive
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features that adapt to your workflow, whether you&apos;re
            working solo or with a team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-8 hover:bg-muted/50 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
