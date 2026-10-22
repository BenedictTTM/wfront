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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-border pb-3.5">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary border-2 border-border flex items-center justify-center shadow-[0_2px_0_#141827] shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs font-extrabold text-text-secondary mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
