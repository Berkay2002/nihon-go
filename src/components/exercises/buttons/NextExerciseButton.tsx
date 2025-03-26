
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NextExerciseButtonProps {
  isLastExercise: boolean;
  isReviewMode?: boolean;
  onNextExercise: () => void;
}

export const NextExerciseButton: React.FC<NextExerciseButtonProps> = ({
  isLastExercise,
  isReviewMode = false,
  onNextExercise
}) => {
  // Different text based on whether it's the last exercise and if we're in review mode
  const buttonText = () => {
    if (isReviewMode) {
      return isLastExercise ? "Finish Review" : "Next Question";
    } else {
      return isLastExercise ? "Complete Lesson" : "Next Exercise";
    }
  };

  return (
    <Button 
      className={cn(
        "w-full px-8 py-4 rounded-xl font-bold text-lg text-white transition-all duration-200 shadow-md",
        "bg-green-500 hover:bg-green-600 active:scale-95"
      )}
      onClick={onNextExercise}
    >
      {buttonText()}
    </Button>
  );
};
