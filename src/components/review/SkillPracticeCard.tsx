
import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 my-2 rounded-xl border border-slate-700/40 bg-slate-800/60 transition-all hover:bg-slate-700/70 hover:shadow-md",
        className
      )}
    >
      <div className="flex flex-col items-start">
        <div className="text-lg font-semibold text-white mb-1">{title}</div>
        {description && (
          <div className="text-sm text-slate-300">{description}</div>
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
