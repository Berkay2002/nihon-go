// src/lib/theme-provider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
    border: string;
    highContrast: string;
    mediumContrast: string;
    lowContrast: string;
    nihongoRed: string;
    nihongoBlue: string;
    nihongoGold: string;
    nihongoGreen: string;
    nihongoError: string;
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define color palette for light and dark modes
const lightColors = {
  background: "#ffffff",
  foreground: "#1f2937", // Slate-800
  primary: "#2C5282", // nihongo-blue
  secondary: "#6B7280", // Slate-500
  muted: "#9CA3AF", // Slate-400
  accent: "#FF4D4D", // nihongo-red
  border: "#E5E7EB", // Slate-200
  highContrast: "#1f2937", // Slate-800
  mediumContrast: "#4B5563", // Slate-600
  lowContrast: "#9CA3AF", // Slate-400
  nihongoRed: "#FF4D4D",
  nihongoBlue: "#2C5282",
  nihongoGold: "#FFD700",
  nihongoGreen: "#38A169",
  nihongoError: "#FF6B6B",
};

const darkColors = {
  background: "#1F2937", // Slate-800
  foreground: "#F9FAFB", // Slate-50
  primary: "#60A5FA", // Blue-400
  secondary: "#9CA3AF", // Slate-400
  muted: "#6B7280", // Slate-500
  accent: "#FF6B6B", // Light red
  border: "#374151", // Slate-700
  highContrast: "#F9FAFB", // Slate-50
  mediumContrast: "#E5E7EB", // Slate-200
  lowContrast: "#9CA3AF", // Slate-400
  nihongoRed: "#FF6B6B", // Lighter red for dark mode
  nihongoBlue: "#93C5FD", // Blue-300
  nihongoGold: "#FBBF24", // Amber-400
  nihongoGreen: "#4ADE80", // Green-400
  nihongoError: "#F87171", // Red-400
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = "dark",
  storageKey = "theme" 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const isDark = theme === "dark";
  const colors = isDark ? darkColors : lightColors;
  
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
  
  // Apply theme to document element and save to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, theme);
    
    // Apply theme class to the document element
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    
    // Apply CSS variables for all theme colors
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [theme, storageKey, colors]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, colors }}>
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