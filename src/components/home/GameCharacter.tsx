import React from "react";
import { cn } from "@/lib/utils";

interface GameCharacterProps {
  state?: "idle" | "happy" | "thinking" | "surprised";
  className?: string;
}

export const GameCharacter: React.FC<GameCharacterProps> = ({ 
  state = "idle",
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
    <div className={cn("relative", className)}>
      <div className={cn(
        "w-20 h-20 relative",
        stateClasses[state]
      )}>
        {/* Character body (green owl-like character similar to Duolingo) */}
        <div className="w-full h-full bg-[#8ae600] rounded-full relative overflow-hidden flex items-center justify-center">
          {/* Eyes */}
          <div className="flex space-x-2 mt-1">
            <div className="w-5 h-6 bg-white rounded-full relative flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full relative">
                {state === "thinking" && (
                  <div className="absolute top-0 w-full h-1/2 bg-white rounded-t-full"></div>
                )}
              </div>
            </div>
            <div className="w-5 h-6 bg-white rounded-full relative flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full relative">
                {state === "thinking" && (
                  <div className="absolute top-0 w-full h-1/2 bg-white rounded-t-full"></div>
                )}
              </div>
            </div>
          </div>
          
          {/* Beak/mouth */}
          <div className={cn(
            "absolute bottom-3 w-8 h-4 bg-[#f49000] rounded-full",
            state === "happy" && "animate-pulse"
          )}></div>
        </div>
        
        {/* Character Expression Bubbles */}
        {state === "happy" && (
          <div className="absolute -top-4 -right-4 bg-white p-1.5 rounded-full shadow-md animate-bounce-light">
            <span role="img" aria-label="happy" className="text-lg">🎉</span>
          </div>
        )}
        
        {state === "thinking" && (
          <div className="absolute -top-4 -right-4 bg-white p-1.5 rounded-full shadow-md">
            <span role="img" aria-label="thinking" className="text-lg">🤔</span>
          </div>
        )}
        
        {state === "surprised" && (
          <div className="absolute -top-4 -right-4 bg-white p-1.5 rounded-full shadow-md animate-pulse">
            <span role="img" aria-label="surprised" className="text-lg">😮</span>
          </div>
        )}
      </div>
    </div>
  );
}; 