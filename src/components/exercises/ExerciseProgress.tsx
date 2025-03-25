import React from "react";

interface ExerciseProgressProps {
  currentIndex: number;
  totalExercises: number;
  xpEarned: number;
}

export const ExerciseProgress: React.FC<ExerciseProgressProps> = ({
  currentIndex,
  totalExercises,
  xpEarned,
}) => {
  // Calculate progress percentage
  const progressPercentage = totalExercises > 0 
    ? ((currentIndex) / totalExercises) * 100 
    : 0;

  return (
    <div className="mb-8">
      {/* Top bar with XP counter */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Question {currentIndex + 1} of {totalExercises}
        </span>
        
        <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-blue-500 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707L14.12 4a1 1 0 011.415 1.414L14.121 6l1.414 1.414a1 1 0 01-1.414 1.414L13.414 8l-.707.707a1 1 0 01-1.414-1.414L12 6.586l-.707-.707a1 1 0 011.414-1.414l.707.707z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">+{xpEarned} XP</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Percentage complete */}
      <div className="flex justify-end mt-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {Math.round(progressPercentage)}% complete
        </span>
      </div>
    </div>
  );
};
