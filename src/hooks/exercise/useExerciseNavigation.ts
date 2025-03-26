
import { toast } from "sonner";
import { ExerciseType } from "@/types/exercises";
import { useUserProgress } from "@/services/userProgressService";

/**
 * Hook for managing exercise navigation (checking answers, moving to next exercise)
 */
export const useExerciseNavigation = () => {
  const { submitExerciseResult } = useUserProgress();

  // Handle checking the answer
  const handleCheckAnswer = (
    currentExercise: ExerciseType | null,
    isCorrect: boolean,
    setIsAnswerChecked: (checked: boolean) => void,
    setTotalAnswered: (callback: (prev: number) => number) => void,
    setTotalCorrect: (callback: (prev: number) => number) => void,
    setXpEarned: (callback: (prev: number) => number) => void,
    setIncorrectExercises: (callback: (prev: ExerciseType[]) => ExerciseType[]) => void,
    isReviewMode: boolean
  ) => {
    setIsAnswerChecked(true);
    setTotalAnswered(prev => prev + 1);
    
    if (isCorrect) {
      setTotalCorrect(prev => prev + 1);
      // Only add XP if not in review mode
      if (!isReviewMode && currentExercise?.xp_reward) {
        setXpEarned(prev => prev + (currentExercise.xp_reward || 0));
      }
      toast.success("Correct answer!", { duration: 1500 });
    } else {
      toast.error("Incorrect. Try to remember this one.", { duration: 2000 });
      if (!isReviewMode && currentExercise) {
        setIncorrectExercises(prev => [...prev, currentExercise]);
      }
    }
  };

  // Handle moving to the next exercise
  const handleNextExercise = async (
    user: any,
    currentExercise: ExerciseType | null,
    isAnswerChecked: boolean,
    isCorrect: boolean,
    getUserAnswer: () => string,
    lessonId: string | undefined,
    currentExerciseIndex: number,
    isReviewMode: boolean,
    exercises: ExerciseType[],
    incorrectExercises: ExerciseType[],
    setCurrentExerciseIndex: (callback: (prev: number) => number) => void,
    setIsReviewMode: (isReview: boolean) => void,
    setIncorrectExercises: (incorrect: ExerciseType[]) => void
  ) => {
    // If we're checking an answer, submit the result
    if (user && currentExercise && isAnswerChecked) {
      try {
        // Only submit XP if correct and not in review mode
        const xpEarned = isCorrect && !isReviewMode ? (currentExercise.xp_reward || 0) : 0;
        
        await submitExerciseResult({
          lessonId: lessonId || "",
          exerciseId: currentExercise.id,
          isCorrect: isCorrect,
          userAnswer: getUserAnswer(),
          timeSpent: 0,
          xpEarned: xpEarned
        });
      } catch (error) {
        console.error("Error submitting exercise result:", error);
        // Continue anyway - this is not critical
      }
    }

    const currentArray = isReviewMode ? incorrectExercises : exercises;
    const isLastExercise = currentExerciseIndex >= currentArray.length - 1;

    if (!isLastExercise) {
      // Move to next exercise
      setCurrentExerciseIndex(prev => prev + 1);
    } else if (isReviewMode) {
      // Last exercise in review mode
      if (isCorrect) {
        // Remove this question from incorrect questions
        const updatedIncorrect = incorrectExercises.filter((_, idx) => idx !== currentExerciseIndex);
        setIncorrectExercises(updatedIncorrect);
        
        if (updatedIncorrect.length === 0) {
          // All incorrect questions now correct - complete the lesson
          return { completed: true, lessonId };
        } else {
          // More incorrect questions to review
          setCurrentExerciseIndex(prev => 0);
          toast.info(`${updatedIncorrect.length} questions left to review`);
          return { completed: false };
        }
      } else {
        // Keep in incorrect questions, but cycle to the beginning
        setCurrentExerciseIndex(prev => 0);
        return { completed: false };
      }
    } else {
      // Finished main exercises
      if (incorrectExercises.length > 0) {
        // Enter review mode
        setIsReviewMode(true);
        setCurrentExerciseIndex(prev => 0);
        toast.info("Let's review the questions you got wrong", {
          description: "You need to answer all questions correctly to complete the lesson"
        });
        return { completed: false };
      } else {
        // No incorrect questions - complete!
        return { completed: true, lessonId };
      }
    }
    
    return { completed: false };
  };

  return {
    handleCheckAnswer,
    handleNextExercise
  };
};
