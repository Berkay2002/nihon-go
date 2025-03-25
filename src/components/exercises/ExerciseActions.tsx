
import { Button } from "@/components/ui/button";

interface ExerciseActionsProps {
  isAnswerChecked: boolean;
  isLastExercise: boolean;
  isInputValid: boolean;
  onCheckAnswer: () => void;
  onNextExercise: () => void;
}

export const ExerciseActions = ({
  isAnswerChecked,
  isLastExercise,
  isInputValid,
  onCheckAnswer,
  onNextExercise,
}: ExerciseActionsProps) => {
  return (
    <>
      {!isAnswerChecked ? (
        <Button 
          className="w-full bg-nihongo-blue hover:bg-nihongo-blue/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={onCheckAnswer}
          disabled={!isInputValid}
        >
          Check Answer
        </Button>
      ) : (
        <Button 
          className="w-full bg-nihongo-red hover:bg-nihongo-red/90 text-white py-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={onNextExercise}
        >
          {isLastExercise ? "Complete Lesson" : "Next Exercise"}
        </Button>
      )}
    </>
  );
};
