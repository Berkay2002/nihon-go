import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
            <div className="flex flex-col items-center gap-8">
              {unit.lessons.map((lesson, lessonIndex) => {
                // Alternate left/right for lessons
                const isLeft = lessonIndex % 2 === 0;
                
                // Determine node type (completed, current, locked, treasure)
                let nodeType = "locked";
                if (lesson.isCompleted) nodeType = "completed";
                else if (lesson.isCurrent) nodeType = "current";
                else if (!lesson.isLocked && lesson.type === "treasure") nodeType = "treasure";
                else if (!lesson.isLocked) nodeType = "unlocked";
                
                // Determine appearance based on node type
                const nodeClasses = {
                  completed: "bg-green-500 border-green-600 text-white",
                  current: `${getUnitColor(unitIndex)} text-white animate-pulse-scale`,
                  unlocked: `bg-white border-gray-300 ${getUnitColor(unitIndex).replace('bg-', 'text-')}`,
                  locked: "bg-gray-200 border-gray-300 text-gray-400",
                  treasure: "bg-yellow-400 border-yellow-500 text-yellow-900 animate-float"
                };
                
                // Icon based on node type
                const nodeIcon = {
                  completed: "✓",
                  current: unitIndex % 2 === 0 ? "→" : "↓",
                  unlocked: lessonIndex + 1,
                  locked: "🔒",
                  treasure: "🎁"
                };

                return (
                  <div 
                    key={lesson.id}
                    className={`relative flex ${isLeft ? 'justify-end mr-1/2' : 'justify-start ml-1/2'} w-full`}
                    style={{ 
                      marginLeft: isLeft ? '0' : '50%',
                      marginRight: isLeft ? '50%' : '0',
                    }}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => !lesson.isLocked && onSelectLesson(lesson.id)}
                            disabled={lesson.isLocked}
                            className={cn(
                              "w-16 h-16 rounded-full border-4 flex items-center justify-center text-xl font-bold shadow-md transition-transform hover:scale-110 learning-path-node",
                              nodeClasses[nodeType as keyof typeof nodeClasses],
                              lesson.isLocked ? "cursor-not-allowed" : "cursor-pointer"
                            )}
                          >
                            {nodeIcon[nodeType as keyof typeof nodeIcon]}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side={isLeft ? "left" : "right"}>
                          <div className="p-2">
                            <p className="font-bold">{lesson.title}</p>
                            <p className="text-sm text-gray-500">XP: {lesson.xpReward}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {/* Line connecting to center path */}
                    <div 
                      className={`absolute top-1/2 ${isLeft ? 'right-0 left-auto' : 'left-0 right-auto'} bg-gray-200 h-1`}
                      style={{ 
                        width: '30%',
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
              {unit.lessons.map((lesson) => {
                // Determine node type
                let nodeType = "locked";
                if (lesson.isCompleted) nodeType = "completed";
                else if (lesson.isCurrent) nodeType = "current";
                else if (!lesson.isLocked && lesson.type === "treasure") nodeType = "treasure";
                else if (!lesson.isLocked) nodeType = "unlocked";
                
                // Determine appearance based on node type
                const nodeClasses = {
                  completed: "bg-green-500 border-green-600 text-white",
                  current: `${getUnitColor(unitIndex)} text-white animate-pulse-scale`,
                  unlocked: `bg-white border-gray-300 ${getUnitColor(unitIndex).replace('bg-', 'text-')}`,
                  locked: "bg-gray-200 border-gray-300 text-gray-400",
                  treasure: "bg-yellow-400 border-yellow-500 text-yellow-900 animate-float"
                };
                
                // Icon based on node type
                const nodeIcon = {
                  completed: "✓",
                  current: "→",
                  unlocked: "•",
                  locked: "🔒",
                  treasure: "🎁"
                };
                
                return (
                  <TooltipProvider key={lesson.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => !lesson.isLocked && onSelectLesson(lesson.id)}
                          disabled={lesson.isLocked}
                          className={cn(
                            "min-w-[60px] w-15 h-15 rounded-full border-4 flex flex-shrink-0 items-center justify-center text-xl font-bold shadow-md learning-path-node",
                            nodeClasses[nodeType as keyof typeof nodeClasses],
                            lesson.isLocked ? "cursor-not-allowed" : "cursor-pointer"
                          )}
                        >
                          {nodeIcon[nodeType as keyof typeof nodeIcon]}
                        </button>
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