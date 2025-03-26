
import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      onClick={toggleTheme} 
      variant="ghost" 
      size="icon" 
      className={`absolute top-4 right-4 md:top-8 md:right-8 ${theme === 'dark' ? 'text-white hover:text-white hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-200'}`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
