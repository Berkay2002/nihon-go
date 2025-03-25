
import { CheckAnswerButton, NextExerciseButton } from "./buttons";

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
        <CheckAnswerButton 
          isInputValid={isInputValid} 
          onCheckAnswer={onCheckAnswer} 
        />
      ) : (
        <NextExerciseButton 
          isLastExercise={isLastExercise} 
          onNextExercise={onNextExercise} 
        />
      )}
    </>
  );
};
