import React from "react";
import { cn } from "@/lib/utils";

interface ExerciseActionsProps {
  isAnswerChecked: boolean;
  isLastExercise: boolean;
  isInputValid: boolean;
  onCheckAnswer: () => void;
  onNextExercise: () => void;
}

export const ExerciseActions: React.FC<ExerciseActionsProps> = ({
  isAnswerChecked,
  isLastExercise,
  isInputValid,
  onCheckAnswer,
  onNextExercise,
}) => {
  return (
    <div className="fixed bottom-16 left-0 right-0 p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-50">
      <div className="container max-w-md mx-auto flex justify-center">
        {!isAnswerChecked ? (
          <button
            onClick={onCheckAnswer}
            disabled={!isInputValid}
            className={cn(
              "w-full px-8 py-4 rounded-xl font-bold text-lg text-white transition-all duration-200 shadow-md",
              isInputValid 
                ? "bg-green-500 hover:bg-green-600 active:scale-95" 
                : "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
            )}
          >
            Check
          </button>
        ) : (
          <button
            onClick={onNextExercise}
            className="w-full px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-md"
          >
            {isLastExercise ? "Complete" : "Continue"}
          </button>
        )}
      </div>
    </div>
  );
};
