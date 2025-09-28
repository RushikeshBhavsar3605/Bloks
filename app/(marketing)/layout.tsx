const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="dark:bg-[#1F1F1F]">
      <main className="h-full">{children}</main>
    </div>
  );
};

export default MarketingLayout;
