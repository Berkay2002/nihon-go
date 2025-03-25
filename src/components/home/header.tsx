import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

type HeaderProps = {
  title: string;
  onBack?: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
}) => {
  const { isDark } = useTheme();
  
  return (
    <header className="flex items-center justify-between border-b border-border pb-4 w-full">
      <div className="flex items-center gap-x-2">
        {onBack && (
          <Button
            onClick={onBack}
            size="sm"
            variant="ghost"
            className={`${
              isDark 
                ? "text-white hover:text-white hover:bg-white/10" 
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-2xl font-bold text-primary">
          {title}
        </h1>
      </div>
    </header>
  );
}; 