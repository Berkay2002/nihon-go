// src/components/LearningPath.tsx
import React from "react";
import { Check, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface Lesson {
  id: string;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  xpReward: number;
  type: "standard" | "review" | "boss" | "treasure";
}

interface Unit {
  id: string;
  title: string;
  progress: number;
  lessons: Lesson[];
}

interface LearningPathProps {
  units: Unit[];
  onSelectLesson: (lessonId: string) => void;
}

// Generate a color for each unit based on its index
function getUnitColor(index: number) {
  const colors = [
    "bg-blue-500 border-blue-600", // Blue
    "bg-green-500 border-green-600", // Green
    "bg-purple-500 border-purple-600", // Purple
    "bg-orange-500 border-orange-600", // Orange
    "bg-pink-500 border-pink-600", // Pink
    "bg-teal-500 border-teal-600", // Teal
  ];
  return colors[index % colors.length];
}

export const LearningPath: React.FC<LearningPathProps> = ({ 
  units, 
  onSelectLesson 
}) => {
  const isMobile = window.innerWidth < 768;
  
  if (units.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No units available yet.</p>
      </div>
    );
  }

  if (isMobile) {
    return <MobileLearningPath units={units} onSelectLesson={onSelectLesson} />;
  }

  return (
    <div className="relative pt-4 pb-16">
      {/* Path track */}
      <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-2 bg-gray-200 rounded-full z-0" />
      
      {/* Units and lessons */}
      <div className="relative z-10">
        {units.map((unit, unitIndex) => (
          <div key={unit.id} className="mb-8">
            {/* Unit header */}
            <div className="flex justify-center mb-4">
              <div className={cn(
                "px-6 py-2 rounded-full text-white font-bold shadow-md",
                getUnitColor(unitIndex)
              )}>
                {unit.title}
              </div>
            </div>
            
            {/* Lessons */}
            <div className="flex flex-col items-center">
              {unit.lessons.map((lesson, lessonIndex) => {
                // Calculate zigzag pattern
                const cycleLength = 8;
                const cycleIndex = lessonIndex % cycleLength;
                
                let indentationLevel;
                if (cycleIndex <= 2) indentationLevel = cycleIndex;
                else if (cycleIndex <= 4) indentationLevel = 4 - cycleIndex;
                else if (cycleIndex <= 6) indentationLevel = 4 - cycleIndex;
                else indentationLevel = cycleIndex - 8;
                
                const rightPosition = indentationLevel * 40;
                
                // Determine node type (completed, current, locked, treasure)
                let nodeType = "locked";
                if (lesson.isCompleted) nodeType = "completed";
                else if (lesson.isCurrent) nodeType = "current";
                else if (!lesson.isLocked && lesson.type === "treasure") nodeType = "treasure";
                else if (!lesson.isLocked) nodeType = "unlocked";
                
                // Determine appearance based on node type
                const mainColor = getUnitColor(unitIndex).replace('bg-', 'text-').replace(' border-blue-600', '').replace(' border-green-600', '').replace(' border-purple-600', '').replace(' border-orange-600', '').replace(' border-pink-600', '').replace(' border-teal-600', '');
                
                const nodeClasses = {
                  completed: "bg-green-500 border-green-600 text-white",
                  current: `${getUnitColor(unitIndex)} text-white animate-pulse-scale`,
                  unlocked: `bg-white border-gray-300 ${mainColor}`,
                  locked: "bg-gray-200 border-gray-300 text-gray-400",
                  treasure: "bg-yellow-400 border-yellow-500 text-yellow-900 animate-float"
                };
                
                // Icon based on node type and position
                const isLast = lessonIndex === unit.lessons.length - 1;
                const Icon = lesson.isCompleted ? Check : (isLast || lesson.type === "boss") ? Crown : Star;

                return (
                  <div 
                    key={lesson.id}
                    className="relative mb-8"
                    style={{
                      right: `${rightPosition}px`,
                      marginTop: lessonIndex === 0 ? '24px' : '16px'
                    }}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {lesson.isCurrent ? (
                            <div className="relative h-[102px] w-[102px]">
                              {/* Current lesson indicator */}
                              <div className="absolute -top-6 left-2.5 z-10 animate-bounce rounded-xl border-2 bg-white px-3 py-2.5 font-bold uppercase tracking-wide text-green-500">
                                Start
                                <div
                                  className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent border-t-white"
                                  aria-hidden="true"
                                />
                              </div>
                              
                              <CircularProgressbarWithChildren
                                value={unit.progress || 0}
                                styles={{
                                  path: {
                                    stroke: "#4ade80",
                                  },
                                  trail: {
                                    stroke: "#e5e7eb",
                                  },
                                }}
                              >
                                <button
                                  onClick={() => !lesson.isLocked && onSelectLesson(lesson.id)}
                                  disabled={lesson.isLocked}
                                  className={cn(
                                    "h-[70px] w-[70px] rounded-full flex items-center justify-center",
                                    nodeClasses[nodeType as keyof typeof nodeClasses],
                                    lesson.isLocked ? "cursor-not-allowed" : "cursor-pointer"
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "h-10 w-10", 
                                      lesson.isCompleted && "stroke-[3]",
                                      !lesson.isLocked && !lesson.isCompleted && lesson.type !== "treasure" && "fill-current"
                                    )}
                                  />
                                </button>
                              </CircularProgressbarWithChildren>
                            </div>
                          ) : (
                            <button
                              onClick={() => !lesson.isLocked && onSelectLesson(lesson.id)}
                              disabled={lesson.isLocked}
                              className={cn(
                                "h-[70px] w-[70px] rounded-full border-b-4 flex items-center justify-center learning-path-node",
                                nodeClasses[nodeType as keyof typeof nodeClasses],
                                lesson.isLocked ? "cursor-not-allowed" : "cursor-pointer"
                              )}
                            >
                              {lesson.type === "treasure" ? (
                                <span className="text-2xl">🎁</span>
                              ) : (
                                <Icon
                                  className={cn(
                                    "h-10 w-10", 
                                    lesson.isCompleted && "stroke-[3]",
                                    !lesson.isLocked && !lesson.isCompleted && "fill-current"
                                  )}
                                />
                              )}
                            </button>
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="p-2">
                            <p className="font-bold">{lesson.title}</p>
                            <p className="text-sm text-gray-500">XP: {lesson.xpReward}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {/* Line connecting to center path */}
                    <div 
                      className="absolute top-1/2 bg-gray-200 h-1"
                      style={{ 
                        right: rightPosition < 0 ? 'auto' : '100%',
                        left: rightPosition < 0 ? '100%' : 'auto',
                        width: '40px',
                        transform: 'translateY(-50%)',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileLearningPath: React.FC<LearningPathProps> = ({
  units,
  onSelectLesson
}) => {
  return (
    <div className="w-full overflow-hidden pb-8">
      {units.map((unit, unitIndex) => (
        <div key={unit.id} className="mb-8">
          {/* Unit header */}
          <div className="mb-4">
            <div className={cn(
              "px-4 py-2 rounded-full text-white font-bold shadow-md inline-block",
              getUnitColor(unitIndex)
            )}>
              {unit.title}
            </div>
          </div>
          
          {/* Horizontal path with lessons */}
          <div className="relative">
            {/* Path track */}
            <div className="absolute left-0 right-0 top-1/2 h-2 bg-gray-200 rounded-full transform -translate-y-1/2 z-0" />
            
            {/* Lessons */}
            <div className="relative z-10 flex overflow-x-auto pb-4 pt-2 gap-8 px-4 hide-scrollbar">
              {unit.lessons.map((lesson, lessonIndex) => {
                // Determine node type
                let nodeType = "locked";
                if (lesson.isCompleted) nodeType = "completed";
                else if (lesson.isCurrent) nodeType = "current";
                else if (!lesson.isLocked && lesson.type === "treasure") nodeType = "treasure";
                else if (!lesson.isLocked) nodeType = "unlocked";
                
                // Determine appearance based on node type
                const mainColor = getUnitColor(unitIndex).replace('bg-', 'text-').replace(' border-blue-600', '').replace(' border-green-600', '').replace(' border-purple-600', '').replace(' border-orange-600', '').replace(' border-pink-600', '').replace(' border-teal-600', '');
                
                const nodeClasses = {
                  completed: "bg-green-500 border-green-600 text-white",
                  current: `${getUnitColor(unitIndex)} text-white animate-pulse-scale`,
                  unlocked: `bg-white border-gray-300 ${mainColor}`,
                  locked: "bg-gray-200 border-gray-300 text-gray-400",
                  treasure: "bg-yellow-400 border-yellow-500 text-yellow-900 animate-float"
                };
                
                // Icon based on node type and position
                const isLast = lessonIndex === unit.lessons.length - 1;
                const Icon = lesson.isCompleted ? Check : (isLast || lesson.type === "boss") ? Crown : Star;
                
                return (
                  <TooltipProvider key={lesson.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {lesson.isCurrent ? (
                          <div className="relative h-[80px] w-[80px]">
                            <CircularProgressbarWithChildren
                              value={unit.progress || 0}
                              styles={{
                                path: {
                                  stroke: "#4ade80",
                                },
                                trail: {
                                  stroke: "#e5e7eb",
                                },
                              }}
                            >
                              <button
                                onClick={() => !lesson.isLocked && onSelectLesson(lesson.id)}
                                disabled={lesson.isLocked}
                                className={cn(
                                  "h-[55px] w-[55px] rounded-full flex items-center justify-center",
                                  nodeClasses[nodeType as keyof typeof nodeClasses],
                                  lesson.isLocked ? "cursor-not-allowed" : "cursor-pointer"
                                )}
                              >
                                <Icon 
                                  className={cn(
                                    "h-8 w-8", 
                                    lesson.isCompleted && "stroke-[3]",
                                    !lesson.isLocked && !lesson.isCompleted && lesson.type !== "treasure" && "fill-current"
                                  )}
                                />
                              </button>
                            </CircularProgressbarWithChildren>
                          </div>
                        ) : (
                          <button
                            onClick={() => !lesson.isLocked && onSelectLesson(lesson.id)}
                            disabled={lesson.isLocked}
                            className={cn(
                              "min-w-[60px] w-15 h-15 rounded-full border-b-4 flex flex-shrink-0 items-center justify-center learning-path-node",
                              nodeClasses[nodeType as keyof typeof nodeClasses],
                              lesson.isLocked ? "cursor-not-allowed" : "cursor-pointer"
                            )}
                          >
                            {lesson.type === "treasure" ? (
                              <span className="text-xl">🎁</span>
                            ) : (
                              <Icon
                                className={cn(
                                  "h-8 w-8", 
                                  lesson.isCompleted && "stroke-[3]",
                                  !lesson.isLocked && !lesson.isCompleted && "fill-current"
                                )}
                              />
                            )}
                          </button>
                        )}
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="p-2">
                          <p className="font-bold">{lesson.title}</p>
                          <p className="text-sm text-gray-500">XP: {lesson.xpReward}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};