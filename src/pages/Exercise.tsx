
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useExerciseSession } from "@/hooks/useExerciseSession";
import { ExerciseLayout } from "@/components/exercises/ExerciseLayout";
import { LoadingExercise } from "@/components/exercises/LoadingExercise";
import { NoExercisesFound } from "@/components/exercises/NoExercisesFound";
import { useUserProgress } from "@/services/userProgressService";

const Exercise = () => {
  // Get lessonId from URL params or exerciseId (support both patterns)
  const { lessonId, exerciseId } = useParams<{ lessonId: string, exerciseId: string }>();
  const effectiveLessonId = lessonId || exerciseId; // Use either parameter
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { getUserProgressData } = useUserProgress();
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  
  useEffect(() => {
    if (!effectiveLessonId) {
      toast.error("No lesson ID provided");
      navigate("/app/units");
    }
  }, [effectiveLessonId, navigate]);
  
  const {
    exercises,
    currentExercise,
    currentExerciseIndex,
    isAnswerChecked,
    isReviewMode,
    isLoading,
    error,
    xpEarned,
    totalCorrect,
    totalAnswered,
    selectedAnswer,
    textAnswer,
    arrangedWords,
    availableWords,
    matchingResult,
    handleSelectAnswer,
    handleTextAnswerChange,
    handleAddWord,
    handleRemoveWord,
    handleMatchingResult,
    handleCheckAnswer,
    handleNextExercise
  } = useExerciseSession(effectiveLessonId);

  // Check if the lesson is already completed
  useEffect(() => {
    const checkLessonCompletion = async () => {
      if (user && effectiveLessonId) {
        try {
          const progressData = await getUserProgressData();
          const lessonProgress = progressData.find(p => p.lesson_id === effectiveLessonId);
          setIsLessonCompleted(lessonProgress?.is_completed || false);
        } catch (error) {
          console.error("Error checking lesson completion:", error);
        }
      }
    };

    checkLessonCompletion();
  }, [user, effectiveLessonId, getUserProgressData]);

  // Calculate if the exercise is valid for submission
  const isInputValid = (): boolean => {
    if (!currentExercise) return false;

    switch (currentExercise.type) {
      case "multiple_choice":
        return selectedAnswer !== null;
      case "text_input":
        return textAnswer.trim().length > 0;
      case "arrange_sentence":
        return arrangedWords.length > 0;
      case "matching":
        return matchingResult !== null;
      default:
        return false;
    }
  };

  // Calculate if this is the last exercise
  const isLastExercise = (): boolean => {
    const currentArray = isReviewMode ? [] : exercises; // Placeholder for incorrect exercises array
    return currentExerciseIndex >= currentArray.length - 1;
  };

  if (isLoading) {
    return <LoadingExercise />;
  }

  if (error || !exercises || exercises.length === 0) {
    return <NoExercisesFound error={error} lessonId={effectiveLessonId} />;
  }

  if (!currentExercise) {
    toast.error("Could not find exercise", {
      description: "Please try again or return to lessons",
    });
    return <NoExercisesFound lessonId={effectiveLessonId} />;
  }

  return (
    <ExerciseLayout
      currentExercise={currentExercise}
      isReviewMode={isReviewMode}
      isCompleted={isLessonCompleted}
      currentExerciseIndex={currentExerciseIndex}
      totalExercises={exercises.length}
      xpEarned={xpEarned}
      selectedAnswer={selectedAnswer}
      textAnswer={textAnswer}
      arrangedWords={arrangedWords}
      availableWords={availableWords}
      isAnswerChecked={isAnswerChecked}
      isLastExercise={isLastExercise()}
      isInputValid={isInputValid()}
      onSelectAnswer={handleSelectAnswer}
      onTextAnswerChange={handleTextAnswerChange}
      onAddWord={handleAddWord}
      onRemoveWord={handleRemoveWord}
      onMatchingResult={handleMatchingResult}
      onCheckAnswer={handleCheckAnswer}
      onNextExercise={handleNextExercise}
    />
  );
};

export default Exercise;
