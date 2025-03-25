
import React from "react";
import { useTheme } from "@/providers/ThemeProvider";

export const LoadingSpinner: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark' ? 'border-nihongo-gold' : 'border-nihongo-red'}`}></div>
    </div>
  );
};
