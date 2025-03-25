// src/components/LearningPathway.tsx
import { Star, Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PathLesson {
  id: string;
  title?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked?: boolean;
  type?: "standard" | "review" | "boss" | "treasure";
}

export interface PathUnit {
  id: string;
  title: string;
  description: string;
  progress: number;
  lessons: PathLesson[];
}

interface LearningPathwayProps {
  unit: PathUnit;
  onSelectLesson: (lessonId: string) => void;
}

const LearningPathway = ({ unit, onSelectLesson }: LearningPathwayProps) => {
  return (
    <div className="relative pt-4 pb-16">
      {/* Path track - the vertical line */}
      <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-1 bg-gray-500 z-0"></div>
      
      {/* Lessons */}
      <div className="relative z-10">
        {unit.lessons.map((lesson, index) => {
          // Determine node type
          let nodeType = "locked";
          if (lesson.isCompleted) nodeType = "completed";
          else if (lesson.isCurrent) nodeType = "current";
          else if (!lesson.isLocked) nodeType = "unlocked";
          
          // Determine icon based on lesson state
          const Icon = lesson.isCompleted ? Check : (lesson.type === "boss" ? Crown : Star);
          
          return (
            <div 
              key={lesson.id}
              className="flex justify-center mb-8"
            >
              <button
                onClick={() => !lesson.isLocked && onSelectLesson(lesson.id)}
                disabled={lesson.isLocked}
                className={cn(
                  "w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl font-bold shadow-md transition-transform hover:scale-110",
                  nodeType === "completed" ? "bg-green-500 border-green-600 text-white" : 
                  nodeType === "current" ? "bg-green-500 border-green-600 text-white" :
                  nodeType === "unlocked" ? "bg-white border-gray-300 text-green-500" :
                  "bg-gray-200 border-gray-300 text-gray-400",
                  lesson.isLocked ? "cursor-not-allowed" : "cursor-pointer"
                )}
              >
                {lesson.isCurrent && (
                  <div className="absolute -top-8 -translate-y-1 z-10 bg-white rounded-lg px-3 py-1 font-bold uppercase text-green-500 text-xs border-2 border-green-500">
                    START
                    <div
                      className="absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 transform border-x-4 border-t-4 border-green-500 border-x-transparent"
                    />
                  </div>
                )}
                
                <Icon className={cn(
                  "h-6 w-6",
                  lesson.isCompleted && "stroke-[3]"
                )} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPathway;