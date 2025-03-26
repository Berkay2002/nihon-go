
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Zap, XCircle } from "lucide-react";

interface ExerciseProgressProps {
  currentIndex: number;
  totalExercises: number;
  xpEarned: number;
  isReviewMode?: boolean;
  isCompleted?: boolean;
}

export const ExerciseProgress: React.FC<ExerciseProgressProps> = ({
  currentIndex,
  totalExercises,
  xpEarned,
  isReviewMode = false,
  isCompleted = false
}) => {
  const progress = Math.round(((currentIndex + 1) / totalExercises) * 100);

  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm text-medium-contrast">
          Question {currentIndex + 1} / {totalExercises}
        </span>
        
        <div className="flex items-center">
          {isReviewMode ? (
            <div className="flex items-center text-sm">
              <XCircle className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-gray-400">0 XP (Review Mode)</span>
            </div>
          ) : isCompleted ? (
            <div className="flex items-center">
              <XCircle className="w-4 h-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-400">0 XP (already completed)</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Zap className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-semibold text-yellow-500">{xpEarned} XP</span>
            </div>
          )}
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />
    </div>
  );
};
