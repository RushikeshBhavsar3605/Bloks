export const Stats = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              500K+
            </div>
            <div className="text-muted-foreground">Files Created</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              50K+
            </div>
            <div className="text-muted-foreground">Active Users</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              99.9%
            </div>
            <div className="text-muted-foreground">Uptime</div>
          </div>
          <div>
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              24/7
            </div>
            <div className="text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};
