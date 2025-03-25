
import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  className?: string;
  badge?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  className,
  badge
}) => {
  return (
    <div className={cn("flex items-center justify-between mb-2", className)}>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {badge && badge}
    </div>
  );
};
