// components/shared/PageHeader.tsx

import React from "react";

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  compactOnMobile?: boolean;
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  compactOnMobile = false,
}: PageHeaderProps) {
  if (compactOnMobile) {
    return (
      <div className="flex flex-col gap-1 sm:gap-2 border-b-2 border-border pb-2 sm:pb-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {icon && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary border-2 border-border flex items-center justify-center shadow-[0_1.5px_0_#141827] shrink-0">
                {icon}
              </div>
            )}
            <h1 className="text-lg sm:text-2xl font-black text-text-primary tracking-tight truncate">
              {title}
            </h1>
          </div>
          {actions && <div className="flex items-center shrink-0">{actions}</div>}
        </div>
        {description && (
          <p className="text-[11px] sm:text-xs font-bold text-text-secondary truncate">
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b-2 border-border pb-2.5 sm:pb-3.5">
      <div className="flex items-center gap-2.5 sm:gap-3">
        {icon && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary border-2 border-border flex items-center justify-center shadow-[0_2px_0_#141827] shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
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
      {actions && <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">{actions}</div>}
    </div>
  );
}
