// src/components/units/LessonCard.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Check, Lock, ChevronRight, Zap, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: string;
  xp_reward: number;
  is_completed?: boolean;
  is_locked?: boolean;
  hasEarnedXP?: boolean;
}

interface LessonCardProps {
  lesson: Lesson;
  onClick: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick }) => {
  return (
    <Card 
      key={lesson.id} 
      className={cn(
        "border transition-all cursor-pointer",
        lesson.is_completed ? 'border-nihongo-green/30' : 
        lesson.is_locked ? 'border-border opacity-70' : 'border-border hover:border-nihongo-blue/30'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mr-3",
              lesson.is_completed ? 'bg-nihongo-green/10' : 
              lesson.is_locked ? 'bg-slate-100 dark:bg-slate-800' : 'bg-nihongo-red/10'
            )}>
              {lesson.is_completed ? (
                <Check className="w-5 h-5 text-nihongo-green" />
              ) : lesson.is_locked ? (
                <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              ) : (
                <Book className="w-5 h-5 text-nihongo-red" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-high-contrast">{lesson.title}</h3>
              <div className="flex items-center">
                {lesson.is_locked ? (
                  <p className="text-xs text-medium-contrast">
                    Complete previous lessons to unlock
                  </p>
                ) : (
                  <div className="flex items-center">
                    {lesson.is_completed ? (
                      <div className="flex items-center">
                        <XCircle className="h-3 w-3 text-low-contrast mr-1" />
                        <p className="text-xs text-low-contrast">
                          0 XP (already completed)
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Zap className="h-3 w-3 text-nihongo-blue dark:text-blue-400 mr-1" />
                        <p className="text-xs text-nihongo-blue dark:text-blue-400 font-medium">
                          Earn {lesson.xp_reward} XP
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-medium-contrast" />
        </div>
      </CardContent>
    </Card>
  );
};

export const LessonCardSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center">
          <Skeleton className="w-10 h-10 rounded-full mr-3" />
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
};