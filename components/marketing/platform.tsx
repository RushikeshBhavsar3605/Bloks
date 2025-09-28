import { Check, Globe, Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "../ui/button";

export const Platform = () => {
  const platforms = [
    {
      icon: Monitor,
      name: "Desktop",
      description: "Full-featured desktop app for Windows, Mac, and Linux",
      features: ["Offline sync", "Native performance", "System integration"],
    },
    {
      icon: Globe,
      name: "Web",
      description: "Access from any browser with full functionality",
      features: ["No installation", "Always updated", "Cross-platform"],
    },
    {
      icon: Smartphone,
      name: "Mobile",
      description: "Native iOS and Android apps for on-the-go productivity",
      features: ["Touch optimized", "Offline editing", "Push notifications"],
    },
    {
      icon: Tablet,
      name: "Tablet",
      description: "Optimized for iPad and Android tablets",
      features: ["Stylus support", "Split screen", "Gesture navigation"],
    },
  ];

  return (
    <section id="platforms" className="py-20 lg:py-32 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Available everywhere you work
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Native apps for every platform. Your workspace syncs seamlessly
            across all your devices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors shadow-sm"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{platform.name}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {platform.description}
                </p>
                <div className="space-y-2">
                  {platform.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-6">
            Download for your platform
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              className="border-border hover:bg-muted bg-transparent"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop App
            </Button>
            <Button
              variant="outline"
              className="border-border hover:bg-muted bg-transparent"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile App
            </Button>
            <Button
              variant="outline"
              className="border-border hover:bg-muted bg-transparent"
            >
              <Globe className="w-4 h-4 mr-2" />
              Web App
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
