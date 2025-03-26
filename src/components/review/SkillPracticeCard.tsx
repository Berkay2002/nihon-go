import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

interface SkillPracticeCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string;
  className?: string;
}

export const SkillPracticeCard: React.FC<SkillPracticeCardProps> = ({
  title,
  description,
  icon,
  onClick,
  badge,
  className
}) => {
  const { isDark } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 my-2 rounded-xl transition-all hover:shadow-md",
        isDark 
          ? "border border-slate-700/40 bg-slate-800/60 hover:bg-slate-700/70" 
          : "border border-gray-200 bg-gray-100 hover:bg-gray-200",
        className
      )}
    >
      <div className="flex flex-col items-start">
        <div className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</div>
        {description && (
          <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{description}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <div className="text-xs px-2 py-1 rounded-full bg-red-500 text-white font-bold">
            {badge}
          </div>
        )}
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br">
          {icon}
        </div>
      </div>
    </button>
  );
};
