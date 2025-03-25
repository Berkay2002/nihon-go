import React from "react";
import { cn } from "@/lib/utils";

interface GameCharacterProps {
  state?: "idle" | "happy" | "thinking" | "surprised";
  customText?: string;
  className?: string;
}

export const GameCharacter: React.FC<GameCharacterProps> = ({ 
  state = "idle",
  customText,
  className
}) => {
  // Different character states with different animations
  const stateClasses = {
    idle: "animate-pulse-scale",
    happy: "animate-bounce-light",
    thinking: "",
    surprised: "animate-pulse"
  };
  
  return (
    <div className={cn("relative flex items-center gap-4", className)}>
      <div className={cn(
        "w-24 h-24 relative",
        stateClasses[state]
      )}>
        {/* Character using Japanese green pheasant */}
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
          <img 
            src="/nihon-go-logo-transparent.png" 
            alt="Japanese Green Pheasant" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Character Expression Bubbles */}
        {state === "happy" && (
          <div className="absolute -top-4 -right-4 bg-white p-1.5 rounded-full shadow-md animate-bounce-light z-10">
            <span role="img" aria-label="happy" className="text-lg">🎉</span>
          </div>
        )}
        
        {state === "thinking" && (
          <div className="absolute -top-4 -right-4 bg-white p-1.5 rounded-full shadow-md z-10">
            <span role="img" aria-label="thinking" className="text-lg">🤔</span>
          </div>
        )}
        
        {state === "surprised" && (
          <div className="absolute -top-4 -right-4 bg-white p-1.5 rounded-full shadow-md animate-pulse z-10">
            <span role="img" aria-label="surprised" className="text-lg">😮</span>
          </div>
        )}
      </div>
      
      {/* Speech Bubble */}
      {customText && (
        <div className="relative bg-white text-slate-800 p-3 rounded-xl max-w-sm shadow-md">
          <div className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2 rotate-45 w-4 h-4 bg-white"></div>
          <p className="relative z-10 font-medium">{customText}</p>
        </div>
      )}
    </div>
  );
}; 