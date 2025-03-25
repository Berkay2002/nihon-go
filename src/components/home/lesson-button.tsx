import { useState } from 'react';
import { Check, Crown, Star } from 'lucide-react';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-provider';

interface LessonButtonProps {
  id: string;
  index: number;
  totalCount: number;
  locked: boolean;
  current: boolean;
  percentage: number;
  onClick?: (id: string) => void;
  type?: "standard" | "review" | "boss" | "treasure";
}

export function LessonButton({ 
  id, 
  index, 
  totalCount, 
  locked, 
  current, 
  percentage,
  onClick,
  type = "standard"
}: LessonButtonProps) {
  const { isDark } = useTheme();
  
  // Calculate indentation to create zigzag path
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;
  
  let indentationLevel;
  if (cycleIndex <= 2) indentationLevel = cycleIndex;
  else if (cycleIndex <= 4) indentationLevel = 4 - cycleIndex;
  else if (cycleIndex <= 6) indentationLevel = 4 - cycleIndex;
  else indentationLevel = cycleIndex - 8;
  
  const rightPosition = indentationLevel * 40;
  
  const isFirst = index === 0;
  const isLast = index === totalCount;
  const isCompleted = !current && !locked;
  
  // Choose the appropriate icon based on lesson state
  let Icon = isCompleted ? Check : isLast ? Crown : Star;
  if (type === "boss") Icon = Crown;
  
  // Get appropriate colors and styles
  const getButtonStyles = () => {
    if (locked) {
      return isDark 
        ? "bg-neutral-200 border-neutral-400 text-neutral-600"
        : "bg-neutral-100 border-neutral-300 text-neutral-500";
    } else if (isCompleted) {
      return "bg-green-500 border-green-600 text-white";
    } else if (type === "boss") {
      return "bg-purple-500 border-purple-600 text-white";
    } else if (type === "treasure") {
      return "bg-amber-400 border-amber-500 text-white";
    } else {
      return isDark
        ? "bg-white border-green-500 text-green-500"
        : "bg-slate-50 border-green-500 text-green-500";
    }
  };

  const getIconStyles = () => {
    if (locked) {
      return "fill-neutral-400 stroke-neutral-400 text-neutral-400";
    } else if (isCompleted) {
      return "fill-none stroke-[4] text-white";
    } else if (type === "treasure") {
      return "text-yellow-500";
    } else if (type === "boss") {
      return "fill-none stroke-[4] text-white";
    } else {
      return "fill-current text-green-500";
    }
  };
  
  const handleClick = () => {
    if (!locked && onClick) {
      onClick(id);
    }
  };
  
  return (
    <div 
      className="relative"
      style={{
        right: `${rightPosition}px`,
        marginTop: isFirst ? '24px' : '24px',
        marginBottom: '24px',
      }}
    >
      {current ? (
        <div className="relative h-[102px] w-[102px]">
          <div className={`absolute -top-6 left-2.5 z-10 animate-bounce rounded-xl border-2 px-3 py-2.5 font-bold uppercase tracking-wide ${
            isDark 
              ? "bg-white text-green-500 border-white"
              : "bg-green-500 text-white border-green-500"
          }`}>
            Start
            <div
              className={`absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent ${
                isDark ? "border-t-white" : "border-t-green-500"
              }`}
              aria-hidden="true"
            />
          </div>
          
          <CircularProgressbarWithChildren
            value={Number.isNaN(percentage) ? 0 : percentage}
            styles={{
              path: {
                stroke: "#4ade80",
                strokeLinecap: "round",
                transition: "all 0.5s ease",
              },
              trail: {
                stroke: isDark ? "#e5e7eb" : "#d1d5db",
              },
            }}
          >
            <button
              onClick={handleClick}
              className={cn(
                "h-[70px] w-[70px] rounded-full border-b-8 flex items-center justify-center shadow-lg",
                getButtonStyles(),
                locked ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform'
              )}
            >
              {type === "treasure" ? (
                <span className="text-2xl">🎁</span>
              ) : (
                <Icon
                  className={cn(
                    "h-10 w-10",
                    getIconStyles()
                  )}
                />
              )}
            </button>
          </CircularProgressbarWithChildren>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className={cn(
            "h-[70px] w-[70px] rounded-full border-b-8 flex items-center justify-center shadow-lg",
            getButtonStyles(),
            locked ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform'
          )}
        >
          {type === "treasure" ? (
            <span className="text-2xl">🎁</span>
          ) : (
            <Icon
              className={cn(
                "h-10 w-10",
                getIconStyles()
              )}
            />
          )}
        </button>
      )}
    </div>
  );
} 