"use client";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  showEmoji?: boolean;
}

export const PageTitle = ({ title, subtitle, breadcrumb, showEmoji = false }: PageTitleProps) => {
  return (
    <div className="mb-8">
      {breadcrumb && (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2 tracking-wider">
          <span>{breadcrumb}</span>
        </div>
      )}
      <h1 className="text-[32px] font-bold text-gray-900 dark:text-white leading-tight mb-2">
        {title}{showEmoji && " 👋"}
      </h1>
      {subtitle && (
        <p className="text-gray-600 dark:text-gray-400 text-lg">{subtitle}</p>
      )}
    </div>
  );
};