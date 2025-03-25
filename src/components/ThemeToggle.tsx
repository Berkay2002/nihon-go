
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

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={toggleTheme} 
      className={`${theme === 'light' ? 'text-nihongo-blue' : 'text-nihongo-gold'}`}
    >
      {theme === "light" ? (
        <Sun className="h-4 w-4 mr-1" />
      ) : (
        <Moon className="h-4 w-4 mr-1" />
      )}
      {theme === "light" ? "Light" : "Dark"}
    </Button>
  );
}
