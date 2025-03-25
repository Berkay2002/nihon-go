import React, { PropsWithChildren } from "react";
import { useTheme } from "@/lib/theme-provider";

export function FeedWrapper({ children }: PropsWithChildren) {
  const { isDark } = useTheme();
  
  return (
    <div className={`relative top-0 flex-1 pb-10 px-4 ${
      isDark ? "text-white" : "text-slate-800"
    }`}>
      {children}
    </div>
  );
} 