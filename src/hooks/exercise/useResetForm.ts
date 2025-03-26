
import { useEffect } from "react";
import { ExerciseType } from "@/types/exercises";

/**
 * Hook to reset exercise form when changing exercises
 */
export const useResetForm = (
  currentExerciseIndex: number,
  isReviewMode: boolean,
  currentExercise: ExerciseType | null,
  setAvailableWords: (words: string[]) => void,
  setArrangedWords: (words: string[]) => void,
  setSelectedAnswer: (answer: string | null) => void,
  setTextAnswer: (text: string) => void,
  setIsAnswerChecked: (checked: boolean) => void,
  setMatchingResult: (result: boolean | null) => void
) => {
  useEffect(() => {
    if (currentExercise?.type === "arrange_sentence" && Array.isArray(currentExercise.words)) {
      setAvailableWords([...currentExercise.words]);
      setArrangedWords([]);
    } else {
      setAvailableWords([]);
      setArrangedWords([]);
    }
    setSelectedAnswer(null);
    setTextAnswer("");
    setIsAnswerChecked(false);
    setMatchingResult(null);
  }, [
    currentExerciseIndex, 
    isReviewMode, 
    currentExercise, 
    setAvailableWords, 
    setArrangedWords, 
    setSelectedAnswer, 
    setTextAnswer, 
    setIsAnswerChecked, 
    setMatchingResult
  ]);
};
