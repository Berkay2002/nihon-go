
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

export const SuperBadge = () => (
  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-xs uppercase tracking-wider">
    Super
  </div>
);

export const MaxBadge = () => (
  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider">
    Max
  </div>
);

export const NewBadge = () => (
  <div className="px-3 py-1 rounded-full bg-red-500 text-white font-bold text-xs uppercase tracking-wider">
    New
  </div>
);
