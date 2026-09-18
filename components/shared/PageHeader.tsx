// components/shared/PageHeader.tsx

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2.5 border-border pb-5">
      <div className="flex items-center gap-3.5">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-primary border-2.5 border-border flex items-center justify-center shadow-[0_3px_0_#141827] shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm font-extrabold text-text-secondary mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
