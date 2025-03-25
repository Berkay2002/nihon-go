
import React from "react";
import { cn } from "@/lib/utils";
import { NextExerciseButton } from "./buttons/NextExerciseButton";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExerciseActionsProps {
  isAnswerChecked: boolean;
  isLastExercise: boolean;
  isInputValid: boolean;
  isReviewMode?: boolean;
  onCheckAnswer: () => void;
  onNextExercise: () => void;
}

export const ExerciseActions: React.FC<ExerciseActionsProps> = ({
  isAnswerChecked,
  isLastExercise,
  isInputValid,
  isReviewMode = false,
  onCheckAnswer,
  onNextExercise,
}) => {
  const navigate = useNavigate();

  const handleExit = () => {
    // Confirm before exiting if in the middle of an exercise
    if (window.confirm("Are you sure you want to leave? Your progress in this exercise won't be saved.")) {
      navigate("/app/home");
    }
  };

  return (
    <div className="fixed md:static bottom-16 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t md:border-t-0 md:mt-8 border-slate-200 dark:border-slate-700 shadow-lg md:shadow-none z-50">
      <div className="container max-w-md mx-auto">
        <div className="flex flex-col space-y-3">
          {!isAnswerChecked ? (
            <>
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
              <button
                onClick={handleExit}
                className="flex items-center justify-center w-full px-8 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <X className="mr-2 h-4 w-4" />
                Leave Exercise
              </button>
            </>
          ) : (
            <>
              <NextExerciseButton
                isLastExercise={isLastExercise}
                isReviewMode={isReviewMode}
                onNextExercise={onNextExercise}
              />
              <button
                onClick={handleExit}
                className="flex items-center justify-center w-full px-8 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <X className="mr-2 h-4 w-4" />
                Leave Exercise
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
