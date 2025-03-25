import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: "light" | "dark";
}

export function ThemeProvider({ 
  children, 
  defaultTheme = "dark" 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<"light" | "dark">(defaultTheme);
  
  useEffect(() => {
    // Check for system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setTheme(mediaQuery.matches ? "dark" : "light");
    };
    
    handleChange(); // Set initial state
    mediaQuery.addEventListener("change", handleChange);
    
    // Apply theme class to the document element
    if (theme === "dark") {
      document.documentElement.classList.add("dark-theme");
      document.documentElement.classList.remove("light-theme");
    } else {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark-theme");
    }
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
} 