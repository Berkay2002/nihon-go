// src/components/theme/ThemeDebugger.tsx
import React from "react";
import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon } from "lucide-react";

// A debug component that shows theme colors and contrast combinations
const ThemeDebugger = () => {
  const { theme, toggleTheme, colors } = useTheme();
  
  const colorKeys = Object.keys(colors) as Array<keyof typeof colors>;
  
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Theme Debugger</h1>
        <Button onClick={toggleTheme} variant="outline" size="icon">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colorKeys.map((key) => (
          <div key={key} className="space-y-2">
            <div 
              className="h-20 rounded-lg flex items-center justify-center border" 
              style={{ backgroundColor: colors[key] }}
            >
              <span 
                className="px-2 py-1 rounded text-sm font-medium"
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.foreground
                }}
              >
                {key}
              </span>
            </div>
            <p className="text-xs text-center font-mono">{colors[key]}</p>
          </div>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Text Contrast Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-high-contrast">
              High Contrast Text
            </h2>
            <p className="text-medium-contrast">
              Medium contrast text is used for most body content.
            </p>
            <p className="text-low-contrast">
              Low contrast text is used for secondary information.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-slate-800">
            <h3 className="text-white font-semibold mb-2">Dark Background</h3>
            <p className="text-slate-200">This text should be visible on dark backgrounds</p>
            <p className="text-slate-400">This is lower contrast but still readable</p>
          </div>
          
          <div className="p-4 rounded-lg bg-white dark:bg-slate-700 border">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-2">
              Adaptive Background
            </h3>
            <p className="text-slate-700 dark:text-slate-200">
              This text adapts to both light and dark backgrounds
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeDebugger;