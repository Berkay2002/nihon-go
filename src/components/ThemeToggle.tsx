
import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
}

export function ThemeToggle({ 
  variant = "ghost", 
  size = "sm" 
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={variant} 
        size={size} 
        onClick={() => setTheme("light")} 
        className={`${theme === 'light' ? 'bg-nihongo-blue/20 text-nihongo-blue' : 'text-gray-400'}`}
      >
        <Sun className="h-4 w-4 mr-1" />
        Light
      </Button>

      <Button 
        variant={variant} 
        size={size} 
        onClick={() => setTheme("dark")} 
        className={`${theme === 'dark' ? 'bg-nihongo-gold/20 text-nihongo-gold' : 'text-gray-400'}`}
      >
        <Moon className="h-4 w-4 mr-1" />
        Dark
      </Button>
    </div>
  );
}
