
import React from "react";
import { Button } from "@/components/ui/button";

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
      className="w-full bg-green-500 hover:bg-green-600 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      onClick={onNextExercise}
    >
      {buttonText()}
    </Button>
  );
};
