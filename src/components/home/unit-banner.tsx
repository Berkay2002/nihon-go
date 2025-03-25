import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

type UnitBannerProps = {
  title: string;
  description?: string;
  unitColor?: string;
  onContinue?: () => void;
};

export const UnitBanner: React.FC<UnitBannerProps> = ({
  title,
  description,
  unitColor = "bg-gray-100",
  onContinue,
}) => {
  const { isDark } = useTheme();
  
  return (
    <div className={cn(
      "rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4",
      unitColor,
      isDark 
        ? "shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-white/10"
        : "shadow-md border border-slate-200/50"
    )}>
      <div className="space-y-1">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          {title}
        </h2>
        {description && (
          <p className="text-white/80 text-sm md:text-base">
            {description}
          </p>
        )}
      </div>
      {onContinue && (
        <Button 
          onClick={onContinue}
          size="lg" 
          className={`font-semibold shadow-md ${
            isDark 
              ? "bg-white hover:bg-white/90 text-slate-800" 
              : "bg-slate-800 hover:bg-slate-700 text-white"
          }`}
        >
          Continue
        </Button>
      )}
    </div>
  );
}; 