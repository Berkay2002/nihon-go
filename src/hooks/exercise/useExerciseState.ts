
import { useState } from "react";
import { ExerciseType } from "@/types/exercises";

/**
 * Hook for managing exercise session state
 */
export const useExerciseState = () => {
  // Exercise session state
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [incorrectExercises, setIncorrectExercises] = useState<ExerciseType[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // User's answers state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [matchingResult, setMatchingResult] = useState<boolean | null>(null);

  // Computed state helper
  const getCurrentExercise = (exercises: ExerciseType[], incorrectExercises: ExerciseType[], isReviewMode: boolean, currentExerciseIndex: number) => {
    return isReviewMode 
      ? (incorrectExercises.length > 0 ? incorrectExercises[currentExerciseIndex] : null)
      : (exercises.length > 0 ? exercises[currentExerciseIndex] : null);
  };

  return {
    // State
    exercises,
    setExercises,
    incorrectExercises,
    setIncorrectExercises,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    isAnswerChecked,
    setIsAnswerChecked,
    isReviewMode,
    setIsReviewMode,
    isLoading,
    setIsLoading,
    error,
    setError,
    xpEarned,
    setXpEarned,
    totalCorrect,
    setTotalCorrect,
    totalAnswered,
    setTotalAnswered,

    // User's answers
    selectedAnswer,
    setSelectedAnswer,
    textAnswer, 
    setTextAnswer,
    arrangedWords,
    setArrangedWords,
    availableWords,
    setAvailableWords,
    matchingResult,
    setMatchingResult,

    // Helpers
    getCurrentExercise
  };
};
