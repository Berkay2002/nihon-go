
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
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = "dark",
  storageKey = "theme" 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<"light" | "dark">(defaultTheme);
  
  useEffect(() => {
    // Try to load theme from localStorage
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    } else {
      // Check for system preference
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        setTheme(mediaQuery.matches ? "dark" : "light");
      };
      
      handleChange(); // Set initial state
      mediaQuery.addEventListener("change", handleChange);
      
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }
  }, [storageKey]);
  
  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(storageKey, theme);
    
    // Apply theme class to the document element
    if (theme === "dark") {
      document.documentElement.classList.add("dark-theme");
      document.documentElement.classList.remove("light-theme");
    } else {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark-theme");
    }
  }, [theme, storageKey]);
  
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
