import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

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
  const { isDark } = useTheme();
  
  return (
    <div className={cn("flex items-center justify-between mb-2", className)}>
      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      {badge && badge}
    </div>
  );
};
