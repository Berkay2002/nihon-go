
import React from "react";
import { Button } from "@/components/ui/button";

interface NextExerciseButtonProps {
  isLastExercise: boolean;
  onNextExercise: () => void;
}

export const NextExerciseButton: React.FC<NextExerciseButtonProps> = ({
  isLastExercise,
  onNextExercise
}) => {
  return (
    <Button 
      className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      onClick={onNextExercise}
    >
      {isLastExercise ? "Complete Lesson" : "Next Exercise"}
    </Button>
  );
};
